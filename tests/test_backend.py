import unittest
import json
from backend.database import get_db_connection, init_db
from backend.server import calculate_competency, get_level_info, app
from fastapi.testclient import TestClient

class TestMineARExtended(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def setUp(self):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM activity_attempts WHERE trainee_id = 'anik01' AND id LIKE 'test_act_%'")
        cur.execute("DELETE FROM certificates WHERE worker_id = 'anik01'")
        conn.commit()
        conn.close()

    def test_activity_attempt_history_never_overwrites(self):
        # Attempt #1: Wrong answer
        payload1 = {
            "trainee_id": "anik01",
            "activity_id": "act_fire_extinguisher",
            "selected_answer": "Water Extinguisher / Spray",
            "time_taken_sec": 7.5
        }
        resp1 = self.client.post("/api/v1/activities/act_fire_extinguisher/attempt", json=payload1)
        self.assertEqual(resp1.status_code, 200)
        res1 = resp1.json()
        self.assertFalse(res1["is_correct"])
        self.assertEqual(res1["xp_delta"], -10)
        first_attempt_num = res1["attempt_number"]

        # Attempt #2: Correct answer
        payload2 = {
            "trainee_id": "anik01",
            "activity_id": "act_fire_extinguisher",
            "selected_answer": "Dry Chemical Powder (DCP - IS 2171)",
            "time_taken_sec": 4.8
        }
        resp2 = self.client.post("/api/v1/activities/act_fire_extinguisher/attempt", json=payload2)
        self.assertEqual(resp2.status_code, 200)
        res2 = resp2.json()
        self.assertTrue(res2["is_correct"])
        self.assertEqual(res2["xp_delta"], 15)
        second_attempt_num = res2["attempt_number"]

        # Verify second attempt number incremented
        self.assertEqual(second_attempt_num, first_attempt_num + 1)

        # Verify both attempts exist in history without overwriting
        hist_resp = self.client.get("/api/v1/trainees/anik01/activities/history")
        self.assertEqual(hist_resp.status_code, 200)
        history = hist_resp.json()
        self.assertGreaterEqual(len(history), 2)

    def test_supervisor_only_certificate_issuing(self):
        # Trainee attempts to issue certificate with trainee token -> 403 Forbidden!
        issue_payload = {
            "trainee_id": "anik01",
            "supervisor_id": "trainee_impersonator",
            "notes": "Trying to issue own cert"
        }
        trainee_resp = self.client.post(
            "/api/v1/supervisor/certificates/issue",
            json=issue_payload,
            headers={"Authorization": "Bearer token-trainee-fake"}
        )
        self.assertEqual(trainee_resp.status_code, 403)

        # Supervisor issues certificate with supervisor token -> 200 Success & Audit recorded!
        supervisor_resp = self.client.post(
            "/api/v1/supervisor/certificates/issue",
            json={
                "trainee_id": "anik01",
                "supervisor_id": "supervisor01",
                "notes": "Reviewed training history, approved for vocational safety certificate."
            },
            headers={"Authorization": "Bearer token-supervisor-admin"}
        )
        self.assertEqual(supervisor_resp.status_code, 200)
        cert_res = supervisor_resp.json()
        self.assertEqual(cert_res["certificate"]["status"], "ISSUED")

        # Verify audit log was created
        audit_resp = self.client.get("/api/v1/audit-logs")
        self.assertEqual(audit_resp.status_code, 200)
        logs = audit_resp.json()
        self.assertTrue(any(l["action"] == "CERTIFICATE_ISSUED" and l["target_id"] == "anik01" for l in logs))

    def test_daily_progress_endpoint(self):
        resp = self.client.get("/api/v1/trainees/anik01/daily-progress")
        self.assertEqual(resp.status_code, 200)
        dp = resp.json()
        self.assertGreaterEqual(len(dp), 5)
        self.assertEqual(dp[0]["day_name"], "Mon")

    def test_auth_unified_login(self):
        # Trainee login
        resp = self.client.post("/api/v1/auth/login", json={"user_id": "anik01", "password": "mine123"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["role"], "trainee")
        self.assertTrue("token" in data)

        # Supervisor login
        sup_resp = self.client.post("/api/v1/auth/login", json={"user_id": "supervisor01", "password": "admin123"})
        self.assertEqual(sup_resp.status_code, 200)
        sup_data = sup_resp.json()
        self.assertEqual(sup_data["role"], "supervisor")
        self.assertTrue("token" in sup_data)

        # Bad password
        bad_resp = self.client.post("/api/v1/auth/login", json={"user_id": "anik01", "password": "wrongpassword"})
        self.assertEqual(bad_resp.status_code, 401)

    def test_scenarios_analytics_endpoint(self):
        resp = self.client.get("/api/v1/scenarios/analytics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 5)
        scenario_ids = [s["id"] for s in data]
        self.assertIn("sim_fire_explosion", scenario_ids)
        self.assertIn("sim_gas_confined", scenario_ids)
        self.assertIn("sim_machinery_safety", scenario_ids)
        self.assertIn("sim_emergency_evac", scenario_ids)
        self.assertIn("sim_roof_strata", scenario_ids)

    def test_supervisor_retraining_assignment_security(self):
        payload = {
            "trainee_id": "shambhavi01",
            "supervisor_id": "supervisor01",
            "modules": ["Intake vs Return Airway Positioning"]
        }
        # Trainee token -> 403 Forbidden
        trainee_resp = self.client.post(
            "/api/v1/supervisor/retraining/assign",
            json=payload,
            headers={"Authorization": "Bearer token-trainee-fake"}
        )
        self.assertEqual(trainee_resp.status_code, 403)

        # Supervisor token -> 200 Success
        sup_resp = self.client.post(
            "/api/v1/supervisor/retraining/assign",
            json=payload,
            headers={"Authorization": "Bearer token-supervisor-admin"}
        )
        self.assertEqual(sup_resp.status_code, 200)
        res = sup_resp.json()
        self.assertEqual(res["status"], "success")

    def test_all_five_simulation_attempts(self):
        scenarios = [
            ("sim_fire_explosion", "dcp_extinguisher", "intake", ["pull", "aim", "squeeze", "sweep"]),
            ("sim_gas_confined", "multi_gas_detector_scsr", "intake_airway_upwind", ["step_1", "step_2"]),
            ("sim_machinery_safety", "loto_isolation_padlock", "safe_service_perimeter", ["loto_padlock_applied", "boom_clearance_verified"]),
            ("sim_emergency_evac", "scsr_oxygen_breathing", "escapeway_tactile_lifeline", ["scsr_donned_and_sealed", "lifeline_cones_verified"]),
            ("sim_roof_strata", "sounding_hammer_props", "bolted_roadway_standoff", ["sound_and_tap_tested", "hydraulic_props_inspected"])
        ]
        for sc_id, equip, approach, steps in scenarios:
            resp = self.client.post("/api/v1/attempts", json={
                "worker_id": "anik01",
                "scenario_id": sc_id,
                "duration_ms": 22000,
                "hazard_rec_ms": 3500,
                "equipment_selected": equip,
                "approach_position": approach,
                "pass_steps_completed": steps,
                "mistakes": [],
                "checklist_verified": True
            })
            self.assertEqual(resp.status_code, 200, f"Attempt failed for scenario {sc_id}")
            data = resp.json()
            self.assertEqual(data["scenario_id"], sc_id)
            self.assertTrue(data["passed"])

if __name__ == "__main__":
    unittest.main()
