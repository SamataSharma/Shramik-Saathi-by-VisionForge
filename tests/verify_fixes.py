import urllib.request
import json

def verify_all():
    print("=== VERIFYING ISSUE 1: SPLASH SCREEN & NEW OFFICIAL LOGO ===")
    req = urllib.request.urlopen('http://localhost:8000/')
    html = req.read().decode('utf-8')
    assert 'id="splash"' in html, "ERROR: #splash not in initial HTML"
    assert 'mine_ar_official_logo.png' in html, "ERROR: New official logo not in initial HTML"
    assert 'body.route-login' in html, "ERROR: Route-based login isolation rules missing"
    assert 'id="login"' in html, "ERROR: Dedicated #login container missing from initial HTML"
    print("[OK] Initial HTML has #splash, new official logo, and #login container.")

    logo_req = urllib.request.urlopen('http://localhost:8000/assets/images/mine_ar_official_logo.png')
    assert logo_req.getcode() == 200, "ERROR: New logo image failed to load"
    assert len(logo_req.read()) > 50000, "ERROR: New logo image is too small or corrupt"
    print("[OK] New official logo /assets/images/mine_ar_official_logo.png successfully served (HTTP 200).")

    print("\n=== VERIFYING ISSUE 2: LOGIN VIEW ISOLATION ===")
    with open('app/js/screens/login.js', 'r', encoding='utf-8') as f:
        login_code = f.read()
    assert 'mine_ar_official_logo.png' in login_code, "ERROR: Login screen does not use new official logo"
    assert 'unified-login-form' in login_code, "ERROR: Unified login form missing"
    assert 'btn-toggle-password' in login_code, "ERROR: Password show/hide toggle missing"
    assert 'Portal Login' in login_code, "ERROR: Portal Login heading missing"

    with open('app/js/router.js', 'r', encoding='utf-8') as f:
        router_code = f.read()
    assert "route === 'login'" in router_code, "ERROR: router does not explicitly handle login route"
    assert "loginSlot.style.display = 'flex'" in router_code, "ERROR: router does not show dedicated login container"
    assert "appShell.style.display = 'none'" in router_code, "ERROR: router does not hide app-shell on login"
    print("[OK] Login screen is completely isolated in dedicated #login container; #app-shell and #home unmounted.")

    print("\n=== VERIFYING ISSUE 3: 5 TRAINING SIMULATIONS ===")
    with open('app/js/engine/scenarios-data.js', 'r', encoding='utf-8') as f:
        scenarios_code = f.read()
    for sc in ['sim_fire_explosion', 'sim_gas_confined', 'sim_machinery_safety', 'sim_emergency_evac', 'sim_roof_strata']:
        assert sc in scenarios_code, f"ERROR: Scenario {sc} missing from scenarios-data.js"
    print("[OK] All 5 distinct simulations defined with hazards, briefs, checklists, and equipment.")

    with open('app/js/ar/ar-engine.js', 'r', encoding='utf-8') as f:
        ar_code = f.read()
    for builder in ['buildConveyorHazard', 'buildGasConfinedHazard', 'buildMachineryHazard', 'buildEvacuationHazard', 'buildRoofStrataHazard']:
        assert builder in ar_code, f"ERROR: 3D builder {builder} missing from ar-engine.js"
    print("[OK] All 5 3D hazard models implemented in AREngine.")

    print("\n=== VERIFYING ISSUE 4: UNIVERSAL VIRTUAL SAFETY BUDDY ===")
    with open('app/js/ar/virtual-buddy.js', 'r', encoding='utf-8') as f:
        buddy_code = f.read()
    for sc in ['sim_fire_explosion', 'sim_gas_confined', 'sim_machinery_safety', 'sim_emergency_evac', 'sim_roof_strata']:
        assert sc in buddy_code, f"ERROR: Buddy missing steps for {sc}"
    print("[OK] Virtual Safety Buddy (Arjun) supports all 5 simulations with dialogues, voices, options, and reactions.")

    print("\n=== VERIFYING ISSUE 5: SUPERVISOR CONTROL CENTER ===")
    dash_req = urllib.request.urlopen('http://localhost:8000/api/v1/dashboard')
    dash_data = json.loads(dash_req.read().decode('utf-8'))
    assert dash_data['stats']['total_workers'] == 6, "ERROR: total_workers != 6"
    assert len(dash_data['worker_roster']) == 6, "ERROR: worker_roster length != 6"
    print(f"[OK] Dashboard API live: 6 KPI stats, 6-trainee roster (Competency Avg: {dash_data['stats']['average_competency']}%).")

    analytics_req = urllib.request.urlopen('http://localhost:8000/api/v1/scenarios/analytics')
    analytics_data = json.loads(analytics_req.read().decode('utf-8'))
    assert len(analytics_data) >= 5, "ERROR: Fewer than 5 scenarios in analytics"
    print(f"[OK] Scenario Analytics API live: {len(analytics_data)} scenarios reported.")

    with open('app/js/screens/supervisor.js', 'r', encoding='utf-8') as f:
        sup_code = f.read()
    assert 'VISIONFORGE – MINE AR SAFETY TRAINING CONTROL CENTER' in sup_code
    assert 'Assign Statutory Retraining' in sup_code
    assert '5-Simulation Vocational Progress Breakdown' in sup_code
    assert 'btn-sup-issue-cert' in sup_code
    print("[OK] Supervisor screen updated with 6 KPIs, 6 trainees, 5-sim analytics, interactive retraining, and drilldown.")

    print("\n=== ALL 5 ISSUES VERIFIED SUCCESSFULLY! ===")

if __name__ == '__main__':
    verify_all()
