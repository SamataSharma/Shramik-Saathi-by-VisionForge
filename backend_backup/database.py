import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "mine_ar.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Workers / Trainees Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS workers (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL DEFAULT 'mine123',
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        mine_location TEXT NOT NULL,
        level INTEGER NOT NULL,
        level_title TEXT NOT NULL,
        xp INTEGER NOT NULL,
        progress_pct INTEGER NOT NULL,
        competency_score REAL NOT NULL,
        avatar_url TEXT NOT NULL,
        streaks INTEGER NOT NULL,
        notifications_count INTEGER NOT NULL,
        language TEXT NOT NULL,
        voice_guidance INTEGER NOT NULL,
        sound_fx INTEGER NOT NULL
    )
    """)

    # Check if password column exists in workers (schema migration)
    cur.execute("PRAGMA table_info(workers)")
    cols = [col[1] for col in cur.fetchall()]
    if "password" not in cols:
        cur.execute("ALTER TABLE workers ADD COLUMN password TEXT NOT NULL DEFAULT 'mine123'")

    # 2. Users / Credentials Table (for unified login)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        designation TEXT
    )
    """)

    # 3. Scenarios Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        hazard_type TEXT NOT NULL,
        location TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        description TEXT NOT NULL,
        time_limit_sec INTEGER NOT NULL,
        correct_equipment TEXT NOT NULL,
        correct_approach TEXT NOT NULL,
        pass_steps_required TEXT NOT NULL
    )
    """)

    # 4. Attempts Table (AR Scenarios)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        hazard_rec_ms INTEGER NOT NULL,
        equipment_selected TEXT NOT NULL,
        approach_position TEXT NOT NULL,
        pass_steps TEXT NOT NULL,
        mistakes TEXT NOT NULL,
        xp_awarded INTEGER NOT NULL,
        accuracy_score REAL NOT NULL,
        speed_score REAL NOT NULL,
        procedure_score REAL NOT NULL,
        hazard_rec_score REAL NOT NULL,
        competency_score REAL NOT NULL,
        passed INTEGER NOT NULL,
        FOREIGN KEY (worker_id) REFERENCES workers(id)
    )
    """)

    # 5. Badges Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        badge_key TEXT NOT NULL,
        badge_title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        FOREIGN KEY (worker_id) REFERENCES workers(id)
    )
    """)

    # 6. Safety Events Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS safety_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # 7. Certificates Table (Supervisor-controlled)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS certificates (
        cert_id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        course_name TEXT NOT NULL,
        competency_score REAL NOT NULL,
        issue_date TEXT NOT NULL,
        cert_hash TEXT NOT NULL,
        verification_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ISSUED',
        issued_by_supervisor_id TEXT DEFAULT 'admin_supervisor'
    )
    """)

    # 8. Activities Master Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL
    )
    """)

    # 9. Activity Attempts History Table (Never Overwrites!)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS activity_attempts (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        activity_title TEXT NOT NULL,
        activity_category TEXT NOT NULL,
        attempt_number INTEGER NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        selected_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        score INTEGER NOT NULL,
        xp_delta INTEGER NOT NULL,
        time_taken_sec REAL NOT NULL,
        timestamp TEXT NOT NULL,
        explanation TEXT NOT NULL,
        mistakes_json TEXT NOT NULL,
        improvement_notes TEXT,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 10. Game Attempts History Table (Hazard Hunt Runs)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS game_attempts (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        attempt_number INTEGER NOT NULL,
        score_pct INTEGER NOT NULL,
        time_taken_sec INTEGER NOT NULL,
        hazards_found INTEGER NOT NULL,
        total_hazards INTEGER NOT NULL,
        mistakes_count INTEGER NOT NULL,
        xp_earned INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 11. Daily Progress Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS daily_progress (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        day_name TEXT NOT NULL,
        date TEXT NOT NULL,
        lessons_completed INTEGER NOT NULL,
        activities_completed INTEGER NOT NULL,
        games_completed INTEGER NOT NULL,
        ar_scenarios_completed INTEGER NOT NULL,
        training_time_min INTEGER NOT NULL,
        avg_accuracy REAL NOT NULL,
        xp_earned INTEGER NOT NULL,
        xp_lost INTEGER NOT NULL,
        competency_score REAL NOT NULL,
        overall_progress INTEGER NOT NULL,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 12. Lesson Progress Table (Remembers playback position & watch %)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS lesson_progress (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        part_id TEXT NOT NULL,
        video_url TEXT NOT NULL,
        watched_pct REAL NOT NULL,
        last_position_sec REAL NOT NULL,
        is_completed INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 13. Lesson Quiz Attempts Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS lesson_quiz_attempts (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        part_id TEXT NOT NULL,
        question TEXT NOT NULL,
        selected_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        score INTEGER NOT NULL,
        attempt_number INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        explanation TEXT NOT NULL,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 14. Audit Logs Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    conn.commit()
    seed_all_data(conn)
    conn.close()

def seed_all_data(conn):
    cur = conn.cursor()

    # Verify if new trainees exist
    cur.execute("SELECT COUNT(*) FROM workers WHERE id = 'anik01'")
    has_anik = cur.fetchone()[0] > 0

    if not has_anik:
        cur.execute("DELETE FROM workers WHERE id IN ('suresh_01', 'rajesh_02', 'amit_03', 'sunita_04', 'manoj_05')")
        cur.execute("DELETE FROM users")

        # 1. Official Trainee Accounts
        workers_data = [
            ("anik01", "mine123", "Anik Mondol", "Underground Belt Conveyor Operator", "Dhanbad Seam #4 (BCCL)", 2, "Miner Grade II", 420, 48, 84.5, "assets/images/worker_avatar.svg", 5, 2, "en", 1, 1),
            ("samata01", "mine123", "Samata Sharma", "Senior Continuous Miner Operator", "Jharia Deep Seam #9", 3, "Safety Specialist", 750, 82, 91.5, "assets/images/worker_avatar.svg", 14, 0, "hi", 1, 1),
            ("shambhavi01", "mine123", "Shambhavi", "Haulage & Trimming Attendant", "Bokaro Open-to-Underground Link", 1, "Mining Trainee", 175, 30, 77.0, "assets/images/worker_avatar.svg", 3, 1, "en", 1, 1),
            ("arkadip01", "mine123", "Arkadip Ghosh", "Ventilation Safety Officer", "Dhanbad North Seam", 2, "Miner Grade II", 320, 42, 72.0, "assets/images/worker_avatar.svg", 2, 3, "en", 1, 1),
            ("sahnik01", "mine123", "Sahnik Barui", "Underground Electrical Technician", "Bokaro Seam #2", 1, "Mining Trainee", 95, 18, 58.5, "assets/images/worker_avatar.svg", 1, 4, "hi", 1, 1),
            ("abhay01", "mine123", "Abhay", "Mine Rescue Brigade Captain", "Jharia Coalfield Rescue Unit", 4, "Mine Rescue Master", 1350, 96, 96.5, "assets/images/worker_avatar.svg", 25, 0, "en", 1, 1),
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO workers (id, password, name, role, mine_location, level, level_title, xp, progress_pct, competency_score, avatar_url, streaks, notifications_count, language, voice_guidance, sound_fx)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, workers_data)

        # 2. Unified Users Table
        users_data = [
            ("u_anik", "anik01", "mine123", "trainee", "Anik Mondol", "anik@mine-ar.in", "Belt Conveyor Operator"),
            ("u_samata", "samata01", "mine123", "trainee", "Samata Sharma", "samata@mine-ar.in", "Continuous Miner Operator"),
            ("u_shambhavi", "shambhavi01", "mine123", "trainee", "Shambhavi", "shambhavi@mine-ar.in", "Haulage Attendant"),
            ("u_arkadip", "arkadip01", "mine123", "trainee", "Arkadip Ghosh", "arkadip@mine-ar.in", "Ventilation Safety Officer"),
            ("u_sahnik", "sahnik01", "mine123", "trainee", "Sahnik Barui", "sahnik@mine-ar.in", "Electrical Technician"),
            ("u_abhay", "abhay01", "mine123", "trainee", "Abhay", "abhay@mine-ar.in", "Rescue Brigade Captain"),
            ("u_sup01", "supervisor01", "admin123", "supervisor", "Er. R. K. Verma", "rkverma@dgms.gov.in", "Director of Mine Safety (DGMS Dhanbad)"),
            ("u_sup_admin", "supervisor_admin", "admin123", "supervisor", "Er. R. K. Verma", "rkverma@dgms.gov.in", "Director of Mine Safety (DGMS Dhanbad)"),
            ("u_admin", "admin", "admin123", "supervisor", "Er. R. K. Verma", "admin@dgms.gov.in", "Chief Mine Inspector")
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO users (id, username, password, role, name, email, designation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, users_data)

        # 3. Badges for trainees
        badges_data = [
            ("b_anik_1", "anik01", "first_fire_drill", "First Extinguisher Drill", "🧯", "Completed initial conveyor fire suppression drill", "2026-09-08T10:00:00Z"),
            ("b_anik_2", "anik01", "pass_protocol_master", "PASS Operator", "⚡", "Executed Pull, Aim, Squeeze, Sweep flawlessly", "2026-09-11T14:30:00Z"),
            ("b_samata_1", "samata01", "hazard_hunter", "Eagle Eye Hazard Scout", "🦅", "Detected 100% of underground hazards in under 30 seconds", "2026-09-09T16:20:00Z"),
            ("b_samata_2", "samata01", "safety_champion", "Safety Specialist", "⭐", "Maintained >90% statutory competency for 14 consecutive shifts", "2026-09-12T12:00:00Z"),
            ("b_abhay_1", "abhay01", "mine_rescue_ace", "Mine Rescue Master", "🏆", "Completed all underground fire, roof, and ventilation simulations", "2026-09-01T08:00:00Z"),
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO badges (id, worker_id, badge_key, badge_title, icon, description, unlocked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, badges_data)

        # 4. Scenarios
        cur.execute("SELECT COUNT(*) FROM scenarios")
        if cur.fetchone()[0] == 0:
            scenarios_data = [
                (
                    "fire_conveyor_01",
                    "Fire & Explosion Response",
                    "Lessons",
                    "Conveyor Belt Friction & Coal Dust Spontaneous Heating",
                    "Underground Seam 4 Trunk Conveyor Gallery, Dhanbad",
                    "Medium",
                    "Detect spontaneous coal combustion and smoldering belt friction. Select appropriate extinguisher and execute the PASS protocol from upwind intake ventilation.",
                    60,
                    "dcp_extinguisher",
                    "intake",
                    json.dumps(["pull", "aim", "squeeze", "sweep"])
                ),
                (
                    "hazard_hunt_01",
                    "Hazard Hunt: Conveyor Gallery",
                    "Games",
                    "Multi-Hazard Identification",
                    "Main Haulage Road & Conveyor Junction",
                    "Hard",
                    "Spot critical hazards within time limit.",
                    45,
                    "dcp_extinguisher",
                    "intake",
                    json.dumps(["spot_idler", "spot_dust", "spot_curtain"])
                )
            ]
            cur.executemany("""
            INSERT OR REPLACE INTO scenarios (id, title, category, hazard_type, location, difficulty, description, time_limit_sec, correct_equipment, correct_approach, pass_steps_required)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, scenarios_data)

        # 5. Master Activities
        cur.execute("DELETE FROM activities")
        activities_data = [
            (
                "act_fire_extinguisher",
                "Fire Extinguisher Selection",
                "Fire Safety",
                "Select certified firefighting agent for underground conveyor drive motor and coal accumulation.",
                "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
                json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
                "Dry Chemical Powder (DCP - IS 2171)",
                "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard or dust cloud explosion."
            ),
            (
                "act_ventilation_airway",
                "Ventilation Airway Positioning",
                "Ventilation",
                "Identify statutory upwind positioning during fire and smoke suppression.",
                "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
                json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
                "Intake Airway (Upwind)",
                "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire, carrying heat, dense smoke, and toxic carbon monoxide away from the trainee."
            ),
            (
                "act_methane_threshold",
                "Methane Threshold Action",
                "Gas Monitoring",
                "Statutory DGMS response when inflammable gas reaches critical limits.",
                "Under DGMS Coal Mines Regulation 169, what mandatory action is required if inflammable gas reaches 1.25% in the working face?",
                json.dumps(["Continue work but turn on water mist", "Open compressed air valve to dilute gas", "Cut electric power and immediately withdraw team to intake air", "Ignore until gas reaches 5%"]),
                "Cut electric power and immediately withdraw team to intake air",
                "At 1.25% methane (CH4), electrical power supply must be isolated immediately and all personnel withdrawn to fresh air until competent sirdar certifies safety."
            ),
            (
                "act_ppe_compliance",
                "Pre-Shift PPE Compliance Inspection",
                "Personal Protection",
                "Statutory DGMS pre-shift safety verification before shaft descent.",
                "Which item is statutory mandated for continuous emergency oxygen supply during underground mine fire evacuation?",
                json.dumps(["N95 Cotton Dust Mask", "Wet Handkerchief", "Self-Contained Self-Rescuer (SCSR 60-min)", "Welding Face Shield"]),
                "Self-Contained Self-Rescuer (SCSR 60-min)",
                "SCSR chemically generates breathable oxygen for up to 60 minutes, shielding lungs against lethal Carbon Monoxide (CO) and oxygen deficiency."
            ),
            (
                "act_pass_protocol",
                "PASS Protocol Execution Order",
                "Fire Safety",
                "Standard operating procedure for manual extinguisher operation.",
                "What is the correct sequential order of the PASS technique?",
                json.dumps(["Pull, Aim, Squeeze, Sweep", "Aim, Pull, Squeeze, Sweep", "Squeeze, Aim, Pull, Sweep", "Sweep, Squeeze, Aim, Pull"]),
                "Pull, Aim, Squeeze, Sweep",
                "PASS sequence: [P] Pull the lock pin -> [A] Aim at fuel base -> [S] Squeeze the operating lever -> [S] Sweep side-to-side across burning fuel."
            )
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO activities (id, title, category, description, question, options_json, correct_answer, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, activities_data)

        # 6. Activity Attempts History for Each Trainee
        cur.execute("DELETE FROM activity_attempts")
        act_attempts = [
            # Anik Mondol (Attempt 1 failed, Attempt 2 passed with major improvement)
            ("att_act_anik_01", "anik01", "act_fire_extinguisher", "Fire Extinguisher Selection", "Fire Safety", 1,
             "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
             json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
             "Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", 0, 0, -10, 8.2, "2026-09-09T09:15:00Z",
             "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard.",
             json.dumps(["Selected water on electrical equipment", "Water jet can cause coal dust dispersion explosion"]),
             "Failed to recognize electrical conductivity risk. Review Module 2."),
            ("att_act_anik_02", "anik01", "act_fire_extinguisher", "Fire Extinguisher Selection", "Fire Safety", 2,
             "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
             json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
             "Dry Chemical Powder (DCP - IS 2171)", "Dry Chemical Powder (DCP - IS 2171)", 1, 100, 15, 4.8, "2026-09-11T14:30:00Z",
             "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard.",
             json.dumps([]), "Outstanding improvement! Solved 3.4s faster than Attempt #1 and selected correct non-conductive agent."),
            ("att_act_anik_03", "anik01", "act_ventilation_airway", "Ventilation Airway Positioning", "Ventilation", 1,
             "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
             json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
             "Intake Airway (Upwind)", "Intake Airway (Upwind)", 1, 100, 15, 3.9, "2026-09-12T11:20:00Z",
             "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire, carrying heat, dense smoke, and toxic carbon monoxide away.",
             json.dumps([]), "Flawless tactical positioning. Fresh air intake path maintained."),

            # Samata Sharma (High performer)
            ("att_act_sam_01", "samata01", "act_fire_extinguisher", "Fire Extinguisher Selection", "Fire Safety", 1,
             "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
             json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
             "Dry Chemical Powder (DCP - IS 2171)", "Dry Chemical Powder (DCP - IS 2171)", 1, 100, 15, 3.2, "2026-09-10T10:15:00Z",
             "Dry Chemical Powder non-conductively interrupts the chemical chain reaction.", json.dumps([]), "Flawless fast execution in 3.2s!"),
            ("att_act_sam_02", "samata01", "act_methane_threshold", "Methane Threshold Action", "Gas Monitoring", 1,
             "Under DGMS Coal Mines Regulation 169, what mandatory action is required if inflammable gas reaches 1.25% in the working face?",
             json.dumps(["Continue work but turn on water mist", "Open compressed air valve to dilute gas", "Cut electric power and immediately withdraw team to intake air", "Ignore until gas reaches 5%"]),
             "Cut electric power and immediately withdraw team to intake air", "Cut electric power and immediately withdraw team to intake air", 1, 100, 20, 2.9, "2026-09-12T09:40:00Z",
             "At 1.25% methane, electrical power must be isolated immediately.", json.dumps([]), "Statutory compliance adhered without delay."),

            # Shambhavi
            ("att_act_shamb_01", "shambhavi01", "act_ppe_compliance", "Pre-Shift PPE Compliance Inspection", "Personal Protection", 1,
             "Which item is statutory mandated for continuous emergency oxygen supply during underground mine fire evacuation?",
             json.dumps(["N95 Cotton Dust Mask", "Wet Handkerchief", "Self-Contained Self-Rescuer (SCSR 60-min)", "Welding Face Shield"]),
             "Self-Contained Self-Rescuer (SCSR 60-min)", "Self-Contained Self-Rescuer (SCSR 60-min)", 1, 100, 15, 5.1, "2026-09-11T13:00:00Z",
             "SCSR chemically generates breathable oxygen for up to 60 minutes.", json.dumps([]), "Excellent gear verification."),

            # Arkadip Ghosh
            ("att_act_ark_01", "arkadip01", "act_ventilation_airway", "Ventilation Airway Positioning", "Ventilation", 1,
             "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
             json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
             "Intake Airway (Upwind)", "Intake Airway (Upwind)", 1, 100, 15, 4.4, "2026-09-12T08:30:00Z",
             "Intake Airway supplies fresh atmospheric air.", json.dumps([]), "Correct airway dynamics verified."),

            # Sahnik Barui (Retraining Required)
            ("att_act_sahnik_01", "sahnik01", "act_ventilation_airway", "Ventilation Airway Positioning", "Ventilation", 1,
             "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
             json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
             "Return Airway (Downwind)", "Intake Airway (Upwind)", 0, 0, -20, 9.5, "2026-09-12T10:05:00Z",
             "Intake Airway supplies fresh atmospheric air.",
             json.dumps(["Downwind return airway approach", "Severe toxic carbon monoxide inhalation risk"]),
             "CRITICAL SAFETY VIOLATION! Trainee placed themselves directly in return smoke path. Mandatory retraining assigned."),
            ("att_act_sahnik_02", "sahnik01", "act_fire_extinguisher", "Fire Extinguisher Selection", "Fire Safety", 1,
             "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
             json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
             "Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", 0, 0, -10, 8.8, "2026-09-12T10:20:00Z",
             "Dry Chemical Powder non-conductively interrupts the chemical chain reaction.",
             json.dumps(["Selected water on electrical drive"]), "Electrical safety protocol failure."),

            # Abhay
            ("att_act_abhay_01", "abhay01", "act_pass_protocol", "PASS Protocol Execution Order", "Fire Safety", 1,
             "What is the correct sequential order of the PASS technique?",
             json.dumps(["Pull, Aim, Squeeze, Sweep", "Aim, Pull, Squeeze, Sweep", "Squeeze, Aim, Pull, Sweep", "Sweep, Squeeze, Aim, Pull"]),
             "Pull, Aim, Squeeze, Sweep", "Pull, Aim, Squeeze, Sweep", 1, 100, 25, 2.4, "2026-09-08T15:00:00Z",
             "PASS sequence: Pull -> Aim -> Squeeze -> Sweep.", json.dumps([]), "Rescue Brigade standard timing: 2.4 seconds.")
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO activity_attempts (id, trainee_id, activity_id, activity_title, activity_category, attempt_number, question, options_json, selected_answer, correct_answer, is_correct, score, xp_delta, time_taken_sec, timestamp, explanation, mistakes_json, improvement_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, act_attempts)

        # 7. Game Attempts (Hazard Hunt)
        cur.execute("DELETE FROM game_attempts")
        game_attempts = [
            ("att_game_anik_1", "anik01", "hazard_hunt_01", 1, 65, 42, 4, 7, 2, 45, "2026-09-09T14:10:00Z"),
            ("att_game_anik_2", "anik01", "hazard_hunt_01", 2, 88, 31, 6, 7, 1, 80, "2026-09-11T16:00:00Z"),
            ("att_game_sam_1", "samata01", "hazard_hunt_01", 1, 95, 24, 7, 7, 0, 100, "2026-09-10T11:45:00Z"),
            ("att_game_shamb_1", "shambhavi01", "hazard_hunt_01", 1, 72, 38, 5, 7, 2, 55, "2026-09-12T14:20:00Z"),
            ("att_game_sahnik_1", "sahnik01", "hazard_hunt_01", 1, 40, 50, 3, 7, 4, 20, "2026-09-12T09:15:00Z"),
            ("att_game_abhay_1", "abhay01", "hazard_hunt_01", 1, 100, 21, 7, 7, 0, 120, "2026-09-07T16:30:00Z")
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO game_attempts (id, trainee_id, game_id, attempt_number, score_pct, time_taken_sec, hazards_found, total_hazards, mistakes_count, xp_earned, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, game_attempts)

        # 8. AR Scenario Attempts
        cur.execute("DELETE FROM attempts")
        ar_attempts = [
            ("att_ar_anik_1", "anik01", "fire_conveyor_01", "2026-09-10T15:20:00Z", 48000, 6200, "dcp_extinguisher", "intake",
             json.dumps(["pull", "aim", "squeeze", "sweep"]), json.dumps([]), 55, 85.0, 80.0, 88.0, 85.0, 84.5, 1),
            ("att_ar_sam_1", "samata01", "fire_conveyor_01", "2026-09-11T10:30:00Z", 36000, 3400, "dcp_extinguisher", "intake",
             json.dumps(["pull", "aim", "squeeze", "sweep"]), json.dumps([]), 75, 95.0, 92.0, 95.0, 95.0, 93.8, 1),
            ("att_ar_sahnik_1", "sahnik01", "fire_conveyor_01", "2026-09-12T11:00:00Z", 65000, 12500, "water_extinguisher", "return",
             json.dumps(["pull"]), json.dumps(["Water selected near conveyor drive", "Return airway toxic approach"]), 10, 40.0, 45.0, 50.0, 40.0, 44.5, 0),
            ("att_ar_abhay_1", "abhay01", "fire_conveyor_01", "2026-09-08T09:00:00Z", 28000, 2600, "dcp_extinguisher", "intake",
             json.dumps(["pull", "aim", "squeeze", "sweep"]), json.dumps([]), 90, 98.0, 96.0, 98.0, 97.0, 97.2, 1)
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO attempts (id, worker_id, scenario_id, timestamp, duration_ms, hazard_rec_ms, equipment_selected, approach_position, pass_steps, mistakes, xp_awarded, accuracy_score, speed_score, procedure_score, hazard_rec_score, competency_score, passed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ar_attempts)

        # 9. Daily Progress Records
        cur.execute("DELETE FROM daily_progress")
        daily_records = [
            ("dp_anik_1", "anik01", "Mon", "2026-09-08", 1, 1, 0, 0, 20, 70.0, 40, 10, 72.0, 20),
            ("dp_anik_2", "anik01", "Tue", "2026-09-09", 1, 1, 1, 0, 30, 75.0, 65, 0, 75.5, 28),
            ("dp_anik_3", "anik01", "Wed", "2026-09-10", 2, 1, 0, 1, 40, 82.0, 85, 0, 79.0, 35),
            ("dp_anik_4", "anik01", "Thu", "2026-09-11", 1, 2, 1, 0, 35, 86.0, 90, 0, 82.0, 42),
            ("dp_anik_5", "anik01", "Fri", "2026-09-12", 2, 2, 1, 1, 50, 88.5, 140, 0, 84.5, 48),

            ("dp_sam_1", "samata01", "Mon", "2026-09-08", 2, 2, 1, 1, 45, 90.0, 110, 0, 88.0, 65),
            ("dp_sam_2", "samata01", "Tue", "2026-09-09", 2, 2, 1, 1, 55, 92.5, 130, 0, 90.0, 72),
            ("dp_sam_3", "samata01", "Wed", "2026-09-10", 1, 3, 2, 1, 60, 94.0, 150, 0, 91.5, 82),

            ("dp_sahnik_1", "sahnik01", "Thu", "2026-09-11", 1, 1, 0, 0, 15, 50.0, 20, 20, 55.0, 12),
            ("dp_sahnik_2", "sahnik01", "Fri", "2026-09-12", 0, 2, 1, 1, 25, 48.0, 30, 40, 58.5, 18),

            ("dp_abhay_1", "abhay01", "Fri", "2026-09-12", 3, 4, 2, 2, 65, 98.0, 210, 0, 96.5, 96),
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO daily_progress (id, trainee_id, day_name, date, lessons_completed, activities_completed, games_completed, ar_scenarios_completed, training_time_min, avg_accuracy, xp_earned, xp_lost, competency_score, overall_progress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, daily_records)

        # 10. Lesson Video Progress & Quiz Seeds
        cur.execute("DELETE FROM lesson_progress")
        lesson_prog = [
            ("lp_anik_1", "anik01", "mod_01", "part_1", "/assets/videos/fire_safety_part1.mp4", 100.0, 75.0, 1, "2026-09-11T11:00:00Z"),
            ("lp_anik_2", "anik01", "mod_01", "part_2", "/assets/videos/fire_safety_part2.mp4", 45.0, 42.0, 0, "2026-09-12T14:15:00Z"),
            ("lp_sam_1", "samata01", "mod_01", "part_1", "/assets/videos/fire_safety_part1.mp4", 100.0, 75.0, 1, "2026-09-10T10:00:00Z"),
            ("lp_sam_2", "samata01", "mod_01", "part_2", "/assets/videos/fire_safety_part2.mp4", 100.0, 110.0, 1, "2026-09-10T10:30:00Z"),
            ("lp_abhay_1", "abhay01", "mod_01", "part_1", "/assets/videos/fire_safety_part1.mp4", 100.0, 75.0, 1, "2026-09-08T09:00:00Z"),
            ("lp_abhay_2", "abhay01", "mod_01", "part_2", "/assets/videos/fire_safety_part2.mp4", 100.0, 110.0, 1, "2026-09-08T09:30:00Z"),
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO lesson_progress (id, trainee_id, lesson_id, part_id, video_url, watched_pct, last_position_sec, is_completed, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, lesson_prog)

        # 11. Lesson Quiz Attempts
        cur.execute("DELETE FROM lesson_quiz_attempts")
        quiz_attempts = [
            ("lq_anik_1", "anik01", "mod_01", "part_1", "What should you do after identifying a conveyor fire?",
             "Raise alarm and follow safe procedure", "Raise alarm and follow safe procedure", 1, 100, 1, "2026-09-11T11:05:00Z",
             "Correct! Always raise alarm immediately and execute response from upwind intake air."),
            ("lq_sam_1", "samata01", "mod_01", "part_1", "What should you do after identifying a conveyor fire?",
             "Raise alarm and follow safe procedure", "Raise alarm and follow safe procedure", 1, 100, 1, "2026-09-10T10:05:00Z",
             "Correct! Emergency signaling prevents trapped workers downwind.")
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO lesson_quiz_attempts (id, trainee_id, lesson_id, part_id, question, selected_answer, correct_answer, is_correct, score, attempt_number, timestamp, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, quiz_attempts)

        # 12. Certificates (Abhay is ISSUED; Samata is ELIGIBLE; Sahnik is NOT_ELIGIBLE)
        cur.execute("DELETE FROM certificates")
        certs = [
            (
                "CERT-DGMS-2026-8941",
                "abhay01",
                "Abhay",
                "DGMS Underground Mine Fire Safety & PASS Extinguisher Standard",
                96.5,
                "2026-09-05",
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "/#certificate/CERT-DGMS-2026-8941",
                "ISSUED",
                "supervisor01"
            ),
            (
                "CERT-DGMS-2026-ELIGIBLE-01",
                "samata01",
                "Samata Sharma",
                "DGMS Underground Mine Fire Safety & PASS Extinguisher Standard",
                91.5,
                "",
                "",
                "/#certificate/CERT-DGMS-2026-ELIGIBLE-01",
                "ELIGIBLE",
                ""
            ),
            (
                "CERT-DGMS-2026-PENDING-02",
                "anik01",
                "Anik Mondol",
                "DGMS Underground Mine Fire Safety & PASS Extinguisher Standard",
                84.5,
                "",
                "",
                "/#certificate/CERT-DGMS-2026-PENDING-02",
                "ELIGIBLE",
                ""
            )
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO certificates (cert_id, worker_id, worker_name, course_name, competency_score, issue_date, cert_hash, verification_url, status, issued_by_supervisor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, certs)

        # 13. Audit Logs
        cur.execute("DELETE FROM audit_logs")
        audit_data = [
            ("log_01", "supervisor01", "supervisor", "LOGIN", "system", "Supervisor session initiated from DGMS Safety Console", "2026-09-12T08:00:00Z"),
            ("log_02", "supervisor01", "supervisor", "CERTIFICATE_ISSUED", "abhay01", "Issued DGMS Certificate CERT-DGMS-2026-8941 to Abhay (Competency: 96.5%)", "2026-09-05T14:00:00Z"),
            ("log_03", "system", "system", "RETRAINING_TRIGGERED", "sahnik01", "Automatic retraining triggered for Sahnik Barui (Competency: 58.5% < 70% threshold)", "2026-09-12T10:25:00Z")
        ]
        cur.executemany("""
        INSERT OR REPLACE INTO audit_logs (id, actor_id, actor_role, action, target_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, audit_data)

    conn.commit()

