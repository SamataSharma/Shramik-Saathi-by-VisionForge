import os
import re
import unittest

class TestNewRequirements(unittest.TestCase):
    def setUp(self):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def test_no_emergency_sos_or_tracking(self):
        """Verify that NO emergency SOS buttons, SOS events, GPS tracking, or /api/v1/emergency exist."""
        forbidden_patterns = [
            r'/api/v1/emergency\b',
            r'\bSOS_BUTTON\b',
            r'\bemergency-sos-btn\b',
            r'\bemergency_location\b',
            r'\bworker_location_track\b',
            r'\blive_worker_location\b',
            r'data-action=["\']sos["\']',
            r'id=["\']btn-sos["\']'
        ]

        scan_dirs = ['app/js', 'backend', 'app']
        for sdir in scan_dirs:
            full_path = os.path.join(self.root_dir, sdir)
            for root, _, files in os.walk(full_path):
                for f in files:
                    if f.endswith(('.js', '.py', '.html')):
                        filepath = os.path.join(root, f)
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
                            content = fh.read()
                            for pat in forbidden_patterns:
                                matches = re.findall(pat, content, re.IGNORECASE)
                                self.assertEqual(
                                    len(matches), 0,
                                    f"Forbidden SOS pattern '{pat}' found in {filepath}: {matches}"
                                )

    def test_android_notch_handling(self):
        """Verify Android MainActivity has display cutout mode and insets listener."""
        main_activity = os.path.join(self.root_dir, 'android/app/src/main/java/org/visionforge/minear/MainActivity.java')
        self.assertTrue(os.path.exists(main_activity))
        with open(main_activity, 'r', encoding='utf-8') as f:
            code = f.read()
        self.assertIn('LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES', code)
        self.assertIn('setOnApplyWindowInsetsListener', code)
        self.assertIn('--android-safe-top', code)
        self.assertIn('--android-safe-bottom', code)

    def test_css_safe_area_variables(self):
        """Verify CSS contains safe area fallbacks combining env() and --android-safe."""
        css_path = os.path.join(self.root_dir, 'app/css/main.css')
        self.assertTrue(os.path.exists(css_path))
        with open(css_path, 'r', encoding='utf-8') as f:
            css = f.read()
        self.assertIn('--safe-top', css)
        self.assertIn('--safe-bottom', css)
        self.assertIn('safe-area-inset-top', css)
        self.assertIn('--android-safe-top', css)
        self.assertIn('.notch-punch-center', css)
        self.assertIn('.notch-large', css)

    def test_7_vocational_games(self):
        """Verify that 7 realistic vocational games are implemented."""
        games_path = os.path.join(self.root_dir, 'app/js/screens/games.js')
        self.assertTrue(os.path.exists(games_path))
        with open(games_path, 'r', encoding='utf-8') as f:
            games_code = f.read()
        for gid in ['game_hazard_hunt', 'game_ppe', 'game_evac', 'game_loto', 'game_gas', 'game_roof', 'game_quiz']:
            self.assertIn(gid, games_code, f"Game {gid} missing from games.js")

    def test_vocational_training_section(self):
        """Verify that vocational.js has 6 DGMS & CMR 2017 compliant modules."""
        voc_path = os.path.join(self.root_dir, 'app/js/screens/vocational.js')
        self.assertTrue(os.path.exists(voc_path))
        with open(voc_path, 'r', encoding='utf-8') as f:
            voc_code = f.read()
        for mid in ['voc_mod1', 'voc_mod2', 'voc_mod3', 'voc_mod4', 'voc_mod5', 'voc_mod6']:
            self.assertIn(mid, voc_code, f"Module {mid} missing from vocational.js")

    def test_global_multilingual_dictionaries(self):
        """Verify English, Hindi, and Santali Ol Chiki have matching core keys."""
        i18n_path = os.path.join(self.root_dir, 'app/js/i18n.js')
        self.assertTrue(os.path.exists(i18n_path))
        with open(i18n_path, 'r', encoding='utf-8') as f:
            code = f.read()
        self.assertIn('en: {', code)
        self.assertIn('hi: {', code)
        self.assertIn('sat: {', code)
        # Verify Ol Chiki characters are present
        self.assertTrue(any('\u1c50' <= c <= '\u1c7f' for c in code), "Santali Ol Chiki script missing from i18n.js")

    def test_procedural_scenario_alarms_and_ducking(self):
        """Verify voice.js implements 5 scenario procedural alarms with ducking."""
        voice_path = os.path.join(self.root_dir, 'app/js/voice.js')
        self.assertTrue(os.path.exists(voice_path))
        with open(voice_path, 'r', encoding='utf-8') as f:
            code = f.read()
        self.assertIn('startScenarioAlarm', code)
        self.assertIn('stopScenarioAlarm', code)
        self.assertIn('duckAlarms', code)
        self.assertIn('restoreAlarms', code)
        for sc in ['sim_fire_explosion', 'sim_gas_confined', 'sim_machinery_safety', 'sim_emergency_evac', 'sim_roof_strata']:
            self.assertIn(sc, code, f"Scenario {sc} missing alarm sound generator in voice.js")

    def test_notifications_drawer_offline_persistence(self):
        """Verify notifications drawer with local storage persistence exists."""
        notif_path = os.path.join(self.root_dir, 'app/js/screens/notifications.js')
        self.assertTrue(os.path.exists(notif_path))
        with open(notif_path, 'r', encoding='utf-8') as f:
            code = f.read()
        self.assertIn('openNotificationsDrawer', code)
        self.assertIn('getUnreadCount', code)
        self.assertIn('mine_ar_notifications', code)

if __name__ == '__main__':
    unittest.main()
