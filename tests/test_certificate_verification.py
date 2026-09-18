import os
import json
import urllib.request
import urllib.error
import unittest

class TestCertificateVerification(unittest.TestCase):
    BASE_URL = "http://127.0.0.1:8000"

    def setUp(self):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def _get(self, path):
        req = urllib.request.Request(f"{self.BASE_URL}{path}")
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status, json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode('utf-8'))

    def _post(self, path, payload, auth_token="test-sup-token"):
        data = json.dumps(payload).encode('utf-8')
        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        req = urllib.request.Request(
            f"{self.BASE_URL}{path}",
            data=data,
            headers=headers
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status, json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode('utf-8'))

    def test_01_verify_valid_certificate(self):
        """Verify that existing issued certificate returns VALID status with full metadata."""
        status, data = self._get("/api/v1/certificates/CERT-DGMS-2026-8941/verify")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "VALID")
        self.assertTrue(data["is_valid"])
        self.assertEqual(data["cert_id"], "CERT-DGMS-2026-8941")
        self.assertIn("worker_name", data)
        self.assertIn("worker_id", data)
        self.assertIn("course_title", data)
        self.assertIn("issue_date", data)
        self.assertIn("issuing_officer", data)
        self.assertIn("hash_sha256", data)
        self.assertIn("verification_url", data)

    def test_02_verify_alias_endpoint(self):
        """Verify that /api/v1/verify/{cert_id} serves as functional alias."""
        status, data = self._get("/api/v1/verify/CERT-DGMS-2026-8941")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "VALID")
        self.assertTrue(data["is_valid"])

    def test_03_verify_not_found_certificate(self):
        """Verify that non-existent certificate returns NOT_FOUND status."""
        status, data = self._get("/api/v1/certificates/CERT-DOES-NOT-EXIST-0000/verify")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "NOT_FOUND")
        self.assertFalse(data["is_valid"])
        self.assertIn("not found", data["message"].lower())

    def test_04_individual_worker_issuance(self):
        """Verify supervisor can issue certificate for an individual worker using worker ID."""
        payload = {
            "trainee_id": "anik01",
            "supervisor_id": "supervisor01",
            "is_reissue": True,  # Clean slate or reissue
            "notes": "Automated verification test issuance for Anik Mondol"
        }
        status, data = self._post("/api/v1/supervisor/certificates/issue", payload)
        self.assertIn(status, [200, 201])
        self.assertTrue(data["success"])
        cert = data["certificate"]
        self.assertEqual(cert["trainee_id"], "anik01")
        self.assertIn(cert["status"], ["ISSUED", "VALID"])
        self.assertIn("CERT-DGMS-", cert["cert_id"])

        # Now verify this newly issued certificate via verify API
        v_status, v_data = self._get(f"/api/v1/certificates/{cert['cert_id']}/verify")
        self.assertEqual(v_status, 200)
        self.assertEqual(v_data["status"], "VALID")
        self.assertEqual(v_data["worker_id"], "anik01")

    def test_05_prevent_duplicate_issuance(self):
        """Verify that attempting duplicate issuance without is_reissue=True is prevented with 409."""
        payload = {
            "trainee_id": "anik01",
            "supervisor_id": "supervisor01",
            "is_reissue": False,
            "notes": "Duplicate attempt without supervisor reissue flag"
        }
        status, data = self._post("/api/v1/supervisor/certificates/issue", payload)
        self.assertEqual(status, 409)
        self.assertIn("already exists", data["detail"].lower())

    def test_06_reissue_certificate(self):
        """Verify that intentional reissue with is_reissue=True succeeds and updates audit log."""
        payload = {
            "trainee_id": "anik01",
            "supervisor_id": "supervisor01",
            "is_reissue": True,
            "notes": "Intentional supervisor reissuance"
        }
        status, data = self._post("/api/v1/supervisor/certificates/issue", payload)
        self.assertEqual(status, 200)
        self.assertTrue(data["is_reissue"])
        self.assertEqual(data["certificate"]["trainee_id"], "anik01")

    def test_07_revoke_certificate(self):
        """Verify supervisor can revoke certificate and verification reflects REVOKED status."""
        # First issue a certificate to revoke
        payload = {
            "trainee_id": "arkadip01",
            "supervisor_id": "supervisor01",
            "is_reissue": True,
            "notes": "Certificate to test revocation"
        }
        status, data = self._post("/api/v1/supervisor/certificates/issue", payload)
        self.assertEqual(status, 200)
        cert_id = data["certificate"]["cert_id"]

        # Revoke it
        r_status, r_data = self._post("/api/v1/supervisor/certificates/revoke", {
            "cert_id": cert_id,
            "supervisor_id": "supervisor01",
            "reason": "Statutory audit reassessment requirement"
        })
        self.assertEqual(r_status, 200)
        self.assertTrue(r_data["success"])
        self.assertEqual(r_data["certificate_status"], "REVOKED")

        # Query verification API
        v_status, v_data = self._get(f"/api/v1/certificates/{cert_id}/verify")
        self.assertEqual(v_status, 200)
        self.assertEqual(v_data["status"], "REVOKED")
        self.assertFalse(v_data["is_valid"])
        self.assertIn("revoked", v_data["message"].lower())

    def test_08_strict_ar_restriction_intact(self):
        """Verify that QR codes are ONLY used for certificates and NOT in AR tracking/anchoring."""
        ar_files = [
            os.path.join(self.root_dir, 'app/js/screens/ar-sim.js'),
            os.path.join(self.root_dir, 'app/js/ar/ar-session.js'),
            os.path.join(self.root_dir, 'app/js/ar/ar-anchor.js'),
            os.path.join(self.root_dir, 'app/js/ar/hazard-spawner.js')
        ]
        for fpath in ar_files:
            if os.path.exists(fpath):
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Ensure no AR markers or QR tracking was added
                    self.assertNotIn('qrcode-tracker', content.lower())
                    self.assertNotIn('qr_anchor', content.lower())
                    self.assertNotIn('ar_marker_qr', content.lower())

    def test_09_ui_components_exist(self):
        """Verify verify screen, supervisor per-worker buttons, and router verify route exist."""
        sup_file = os.path.join(self.root_dir, 'app/js/screens/supervisor.js')
        with open(sup_file, 'r', encoding='utf-8') as f:
            sup_code = f.read()
            self.assertIn('btn-worker-issue-cert', sup_code)
            self.assertIn('btn-worker-reissue-cert', sup_code)
            self.assertIn('btn-worker-view-cert', sup_code)

        router_file = os.path.join(self.root_dir, 'app/js/router.js')
        with open(router_file, 'r', encoding='utf-8') as f:
            router_code = f.read()
            self.assertIn("renderVerifyScreen", router_code)
            self.assertIn("case 'verify':", router_code)

        verify_file = os.path.join(self.root_dir, 'app/js/screens/verify.js')
        self.assertTrue(os.path.exists(verify_file))

if __name__ == '__main__':
    unittest.main()
