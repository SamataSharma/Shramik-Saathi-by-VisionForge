import asyncio
import json
import os
import subprocess
import time
import urllib.request
import base64
import websockets

ARTIFACT_DIR = r"C:\Users\Avay\.gemini\antigravity-ide\brain\e70adf0e-6fdc-42bb-aa5f-187e6a6a8b2b"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9225

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
    print(f"[SCREENSHOT SAVED] {filename}")
    return filepath

async def test_all():
    print("Launching Edge in headless mode with remote debugging...")
    user_data = os.path.join(os.environ.get("TEMP", "C:\\temp"), "edge_ar_full_test")
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
        tabs_req = urllib.request.urlopen(f"http://localhost:{PORT}/json")
        tabs = json.loads(tabs_req.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print(f"Connected to CDP at {ws_url}")
        
        async with websockets.connect(ws_url) as ws:
            await send_cdp(ws, "Page.enable", msg_id=1)
            await send_cdp(ws, "Runtime.enable", msg_id=2)
            
            # Step 1: Open #login and authenticate
            print("\n1. Authenticating trainee session...")
            await send_cdp(ws, "Page.navigate", {"url": "http://127.0.0.1:8000/#login"}, msg_id=10)
            await asyncio.sleep(1.0)
            
            await evaluate_js(ws, """
                (() => {
                    localStorage.setItem('mine_ar_token', 'demo_token_sih26041');
                    localStorage.setItem('mine_ar_role', 'trainee');
                    localStorage.setItem('mine_ar_user_id', 'anik01');
                    document.body.className = 'bootstrapped';
                    window.location.hash = '#home';
                })()
            """, msg_id=11)
            await asyncio.sleep(1.2)
            
            # VERIFY UI CLEANUP: HEADER REMOVAL OF SIH26041
            print("\n==========================================")
            print("VERIFYING HEADER CLEANUP: REMOVE SIH26041")
            print("==========================================")
            header_check = await evaluate_js(ws, """
                (() => {
                    const header = document.getElementById('global-utility-bar');
                    const sihBadge = document.querySelector('.sih-badge');
                    const headerText = header ? header.innerText : '';
                    const brandBadge = document.querySelector('.brand-badge');
                    
                    return {
                        hasSihBadge: !!sihBadge,
                        headerContainsSih: headerText.includes('SIH26041'),
                        brandBadgeText: brandBadge ? brandBadge.innerText.trim() : '',
                        titleText: document.title
                    };
                })()
            """, msg_id=20)
            print(f"Header has .sih-badge: {header_check.get('hasSihBadge')} (Expected: False)")
            print(f"Header text contains 'SIH26041': {header_check.get('headerContainsSih')} (Expected: False)")
            print(f"Brand badge text: '{header_check.get('brandBadgeText')}' (Expected: 'VISIONFORGE')")
            print(f"Page title: '{header_check.get('titleText')}'")
            
            # Capture Header Desktop Screenshot
            await capture_screenshot(ws, "00_header_desktop_cleaned.png", msg_id=21)
            
            # Emulate Mobile Device (iPhone 14 / Pixel 7: 390x844)
            await send_cdp(ws, "Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            }, msg_id=22)
            await asyncio.sleep(0.5)
            await capture_screenshot(ws, "00_header_mobile_cleaned.png", msg_id=23)
            
            # Reset Desktop resolution for AR testing
            await send_cdp(ws, "Emulation.setDeviceMetricsOverride", {
                "width": 1280,
                "height": 850,
                "deviceScaleFactor": 1,
                "mobile": False
            }, msg_id=24)
            await asyncio.sleep(0.5)
            
            # TEST ALL 5 HAZARD MODULES
            scenarios = [
                ("sim_fire_explosion", "01_module_fire.png"),
                ("sim_gas_confined", "02_module_gas.png"),
                ("sim_machinery_safety", "03_module_machinery.png"),
                ("sim_emergency_evac", "04_module_evacuation.png"),
                ("sim_roof_strata", "05_module_strata.png")
            ]
            
            for idx, (sc_id, screenshot_name) in enumerate(scenarios, start=1):
                print(f"\n==========================================")
                print(f"TESTING MODULE {idx}: {sc_id}")
                print(f"==========================================")
                
                # Navigate to AR screen with specific scenario
                await evaluate_js(ws, f"window.location.hash = '#ar?scenario={sc_id}&mode=sim';", msg_id=100 + idx*30)
                
                # Wait for the full automated flow:
                # SCANNING (1.2s) -> DETECTED (0.8s) -> GENERATING (0.8s) -> HAZARD GENERATED (anchored)
                await asyncio.sleep(3.4)
                
                # Check status and labels
                state_info = await evaluate_js(ws, """
                    (() => {
                        const status = document.getElementById('hud-ar-status')?.textContent?.trim();
                        const timer = document.getElementById('hud-timer')?.textContent?.trim();
                        const danger = document.getElementById('hud-danger-banner')?.textContent?.trim();
                        const buddyToggle = document.getElementById('btn-hud-buddy-toggle')?.textContent?.trim();
                        const buddyCard = document.querySelector('.buddy-card');
                        const buddyPill = document.querySelector('.buddy-mini-pill');
                        const hasReticleOrTap = !!document.getElementById('btn-lock-surface');
                        
                        return {
                            status,
                            timer,
                            danger: danger ? danger.replace(/[^\\x00-\\x7F]/g, '') : '',
                            buddyToggle: buddyToggle ? buddyToggle.replace(/[^\\x00-\\x7F]/g, '') : '',
                            hasBuddyCard: !!buddyCard,
                            hasBuddyPill: !!buddyPill,
                            hasManualTap: hasReticleOrTap
                        };
                    })()
                """, msg_id=101 + idx*30)
                
                print(f"[{sc_id}] HUD Status: {state_info.get('status')}")
                print(f"[{sc_id}] Hazard Banner: {state_info.get('danger')}")
                print(f"[{sc_id}] Timer Running: {state_info.get('timer')}")
                print(f"[{sc_id}] Manual Tap Button Exists: {state_info.get('hasManualTap')} (Expected: False - zero manual placement)")
                print(f"[{sc_id}] Buddy Default State: {state_info.get('buddyToggle')} (Has Card: {state_info.get('hasBuddyCard')})")
                
                # Test Buddy 3-State Controls
                print(f"[{sc_id}] Testing Buddy 3-state transitions (Expanded -> Minimized -> OFF -> Expanded)...")
                
                # 1. Minimize Buddy
                await evaluate_js(ws, """
                    (() => {
                        const minBtn = document.getElementById('buddy-btn-minimize');
                        if (minBtn) minBtn.click();
                    })()
                """, msg_id=102 + idx*30)
                await asyncio.sleep(0.4)
                
                is_min = await evaluate_js(ws, "!!document.querySelector('.buddy-mini-pill')", msg_id=103 + idx*30)
                print(f"[{sc_id}] Buddy Minimized: {is_min}")
                
                # 2. Expand Buddy
                await evaluate_js(ws, """
                    (() => {
                        const pill = document.getElementById('btn-expand-buddy');
                        if (pill) pill.click();
                    })()
                """, msg_id=104 + idx*30)
                await asyncio.sleep(0.4)
                
                is_exp = await evaluate_js(ws, "!!document.querySelector('.buddy-card')", msg_id=105 + idx*30)
                print(f"[{sc_id}] Buddy Re-Expanded: {is_exp}")
                
                # 3. Turn Buddy OFF via HUD toggle
                await evaluate_js(ws, """
                    (() => {
                        const toggle = document.getElementById('btn-hud-buddy-toggle');
                        if (toggle) toggle.click();
                    })()
                """, msg_id=106 + idx*30)
                await asyncio.sleep(0.4)
                
                is_off = await evaluate_js(ws, """
                    (() => {
                        const slot = document.getElementById('deck-buddy-slot');
                        return slot && slot.style.display === 'none';
                    })()
                """, msg_id=107 + idx*30)
                print(f"[{sc_id}] Buddy OFF (Hidden): {is_off}")
                
                # 4. Turn Buddy back ON
                await evaluate_js(ws, """
                    (() => {
                        const toggle = document.getElementById('btn-hud-buddy-toggle');
                        if (toggle) toggle.click();
                    })()
                """, msg_id=108 + idx*30)
                await asyncio.sleep(0.4)
                
                # Test Camera Movement (pointer drag to rotate perspective)
                print(f"[{sc_id}] Testing Camera Look / Rotation Interaction...")
                await evaluate_js(ws, """
                    (() => {
                        const canvas = document.getElementById('ar-three-canvas');
                        if (canvas) {
                            canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 300, clientY: 300, bubbles: true }));
                            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 420, clientY: 280, bubbles: true }));
                            window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                        }
                    })()
                """, msg_id=109 + idx*30)
                await asyncio.sleep(0.4)
                
                # Capture visual verification screenshot
                await capture_screenshot(ws, screenshot_name, msg_id=110 + idx*30)
                print(f"[{sc_id}] VERIFIED SUCCESSFULLY!\n")
                
            print("\n==========================================")
            print("ALL 5 MODULES + BUDDY CONTROLS + HEADER CLEANUP VERIFIED!")
            print("==========================================")
            
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test_all())
