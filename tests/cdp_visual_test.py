import asyncio
import json
import os
import subprocess
import time
import urllib.request
import base64
import websockets

ARTIFACT_DIR = r"C:\Users\Avay\.gemini\antigravity-ide\brain\59546a88-2661-49d3-8adc-a79214f6516d"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9222

async def send_cdp(ws, method, params=None, msg_id=1):
    payload = {"id": msg_id, "method": method, "params": params or {}}
    await ws.send(json.dumps(payload))
    while True:
        resp = await ws.recv()
        data = json.loads(resp)
        if data.get("id") == msg_id:
            return data

async def evaluate_js(ws, expr, msg_id=100):
    res = await send_cdp(ws, "Runtime.evaluate", {"expression": expr, "returnByValue": True}, msg_id)
    return res.get("result", {}).get("result", {}).get("value")

async def capture_screenshot(ws, filename, msg_id=200):
    res = await send_cdp(ws, "Page.captureScreenshot", {"format": "png"}, msg_id)
    b64_data = res.get("result", {}).get("data")
    filepath = os.path.join(ARTIFACT_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(base64.b64decode(b64_data))
    print(f"[SCREENSHOT SAVED] {filename} -> {filepath}")
    return filepath

async def main():
    print("1. Launching Edge in headless mode with remote debugging port...")
    user_data = os.path.join(os.environ.get("TEMP", "C:\\temp"), "edge_test_profile")
    proc = subprocess.Popen([
        EDGE_PATH,
        f"--remote-debugging-port={PORT}",
        "--headless=new",
        "--disable-gpu",
        f"--user-data-dir={user_data}",
        "--window-size=1280,850",
        "about:blank"
    ])
    
    await asyncio.sleep(2)
    
    try:
        # Get websocket debugger URL
        tabs_req = urllib.request.urlopen(f"http://localhost:{PORT}/json")
        tabs = json.loads(tabs_req.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print(f"Connected to CDP at {ws_url}")
        
        async with websockets.connect(ws_url) as ws:
            # Enable Page and Runtime
            await send_cdp(ws, "Page.enable", msg_id=1)
            await send_cdp(ws, "Runtime.enable", msg_id=2)
            
            # Navigate to http://localhost:8000/
            print("2. Navigating to http://localhost:8000/...")
            await send_cdp(ws, "Page.navigate", {"url": "http://localhost:8000/"}, msg_id=3)
            
            # Wait 500ms and clear storage to guarantee fresh state
            await asyncio.sleep(0.5)
            await evaluate_js(ws, "localStorage.clear(); sessionStorage.clear();", msg_id=4)
            # Re-navigate clean
            await send_cdp(ws, "Page.navigate", {"url": "http://localhost:8000/"}, msg_id=5)
            await asyncio.sleep(0.6)
            
            # Step A: Capture Splash Screen
            await capture_screenshot(ws, "01_splash_screen.png", msg_id=6)
            
            # Step B: Wait for transition to #login (takes ~2s)
            print("3. Waiting 2.5s for splash screen to complete and transition to #login...")
            await asyncio.sleep(2.5)
            
            curr_hash = await evaluate_js(ws, "window.location.hash", msg_id=7)
            print(f"Current hash after splash: {curr_hash}")
            
            # Verify DOM isolation on login
            dom_check = await evaluate_js(ws, """
                (() => {
                    const loginEl = document.getElementById('login');
                    const appShell = document.getElementById('app-shell');
                    const bottomNav = document.getElementById('bottom-nav');
                    const homeEl = document.getElementById('home');
                    const mainView = document.getElementById('main-view');
                    const logoImg = loginEl ? loginEl.querySelector('img') : null;
                    
                    return {
                        hash: window.location.hash,
                        bodyClass: document.body.className,
                        loginDisplay: loginEl ? window.getComputedStyle(loginEl).display : null,
                        appShellDisplay: appShell ? window.getComputedStyle(appShell).display : null,
                        bottomNavDisplay: bottomNav ? window.getComputedStyle(bottomNav).display : null,
                        homeInDom: !!homeEl,
                        mainViewEmpty: !mainView || mainView.innerHTML.trim() === '',
                        logoSrc: logoImg ? logoImg.src : null,
                        hasUserId: !!document.getElementById('login-userid'),
                        hasPassword: !!document.getElementById('login-password'),
                        hasToggleBtn: !!document.getElementById('btn-toggle-password'),
                        hasSubmitBtn: !!document.getElementById('btn-login-submit')
                    };
                })()
            """, msg_id=8)
            print(f"DOM Check on #login: {json.dumps(dom_check, indent=2)}")
            
            assert dom_check['hash'] == '#login', f"Expected #login, got {dom_check['hash']}"
            assert dom_check['bodyClass'] == 'bootstrapped route-login' or 'route-login' in dom_check['bodyClass'], f"Expected route-login body class, got {dom_check['bodyClass']}"
            assert dom_check['loginDisplay'] == 'flex', f"loginDisplay expected flex, got {dom_check['loginDisplay']}"
            assert dom_check['appShellDisplay'] == 'none', "app-shell is not hidden!"
            assert dom_check['bottomNavDisplay'] == 'none', "bottom-nav is not hidden!"
            assert not dom_check['homeInDom'], "#home is in DOM!"
            assert dom_check['mainViewEmpty'], "#main-view is not empty!"
            assert 'mine_ar_official_logo.png' in (dom_check['logoSrc'] or ''), "New logo not used!"
            assert dom_check['hasSubmitBtn'], "btn-login-submit not found!"
            
            # Step C: Capture Clean Login Screen
            await capture_screenshot(ws, "02_clean_login_screen.png", msg_id=9)
            
            # Step D: Test Password Show/Hide Toggle
            print("4. Testing Password Show/Hide Toggle...")
            await evaluate_js(ws, """
                (() => {
                    const pwdInput = document.getElementById('login-password');
                    pwdInput.value = 'mine123';
                    const toggleBtn = document.getElementById('btn-toggle-password');
                    toggleBtn.click();
                })()
            """, msg_id=10)
            
            pwd_type_after_toggle = await evaluate_js(ws, "document.getElementById('login-password').type", msg_id=11)
            print(f"Password field type after toggle: {pwd_type_after_toggle}")
            assert pwd_type_after_toggle == 'text', f"Expected type 'text', got {pwd_type_after_toggle}"
            await capture_screenshot(ws, "03_login_password_revealed.png", msg_id=12)
            
            # Toggle back to password
            await evaluate_js(ws, "document.getElementById('btn-toggle-password').click();", msg_id=13)
            pwd_type_restored = await evaluate_js(ws, "document.getElementById('login-password').type", msg_id=14)
            assert pwd_type_restored == 'password', f"Expected type 'password', got {pwd_type_restored}"
            
            # Step E: Perform Trainee Login (anik01 / mine123)
            print("5. Logging in as Trainee anik01 / mine123...")
            await evaluate_js(ws, """
                (() => {
                    document.getElementById('login-userid').value = 'anik01';
                    document.getElementById('login-password').value = 'mine123';
                    document.getElementById('btn-login-submit').click();
                })()
            """, msg_id=15)
            
            await asyncio.sleep(1.8)
            trainee_hash = await evaluate_js(ws, "window.location.hash", msg_id=16)
            print(f"Hash after trainee login: {trainee_hash}")
            assert trainee_hash == '#home', f"Expected #home, got {trainee_hash}"
            
            trainee_home_check = await evaluate_js(ws, """
                (() => {
                    const appShell = document.getElementById('app-shell');
                    const bottomNav = document.getElementById('bottom-nav');
                    const traineeName = document.querySelector('#home h2, #home .trainee-name, #home')?.textContent;
                    return {
                        appShellDisplay: appShell ? window.getComputedStyle(appShell).display : null,
                        bottomNavDisplay: bottomNav ? window.getComputedStyle(bottomNav).display : null,
                        traineeNameSnippet: traineeName ? traineeName.slice(0, 50) : null
                    };
                })()
            """, msg_id=17)
            print(f"Trainee Home Check: {json.dumps(trainee_home_check, indent=2)}")
            assert trainee_home_check['appShellDisplay'] == 'flex', "app-shell not visible on #home"
            assert trainee_home_check['bottomNavDisplay'] == 'flex', "bottom-nav not visible on #home"
            
            await capture_screenshot(ws, "04_trainee_home_screen.png", msg_id=18)
            
            # Step F: Logout back to Login Screen
            print("6. Logging out back to #login...")
            await evaluate_js(ws, """
                (() => {
                    localStorage.removeItem('mine_ar_token');
                    localStorage.removeItem('mine_ar_role');
                    window.location.hash = '#login';
                })()
            """, msg_id=19)
            await asyncio.sleep(0.8)
            
            logout_hash = await evaluate_js(ws, "window.location.hash", msg_id=20)
            print(f"Hash after logout: {logout_hash}")
            assert logout_hash == '#login', f"Expected #login, got {logout_hash}"
            await capture_screenshot(ws, "05_login_after_logout.png", msg_id=21)
            
            # Step G: Perform Supervisor Login (supervisor01 / admin123)
            print("7. Logging in as Supervisor supervisor01 / admin123...")
            await evaluate_js(ws, """
                (() => {
                    document.getElementById('login-userid').value = 'supervisor01';
                    document.getElementById('login-password').value = 'admin123';
                    document.getElementById('btn-login-submit').click();
                })()
            """, msg_id=22)
            await asyncio.sleep(1.2)
            
            sup_hash = await evaluate_js(ws, "window.location.hash", msg_id=23)
            print(f"Hash after supervisor login: {sup_hash}")
            assert sup_hash == '#supervisor', f"Expected #supervisor, got {sup_hash}"
            await capture_screenshot(ws, "06_supervisor_control_center.png", msg_id=24)
            
            print("\nALL VERIFICATIONS AND SCREENSHOTS COMPLETED SUCCESSFULLY!")

    finally:
        proc.kill()

if __name__ == "__main__":
    asyncio.run(main())
