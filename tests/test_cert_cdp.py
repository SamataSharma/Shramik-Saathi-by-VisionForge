import asyncio
import json
import os
import subprocess
import urllib.request
import base64
import websockets

ARTIFACT_DIR = r"C:\Users\Avay\.gemini\antigravity-ide\brain\6fbde17d-7bee-4ce8-82fa-0f79dd9e09bc"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9228

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
    if not b64_data:
        print(f"[WARN] capture_screenshot for {filename} returned no data")
        return None
    filepath = os.path.join(ARTIFACT_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(base64.b64decode(b64_data))
    print(f"[SCREENSHOT SAVED] {filename} -> {filepath}", flush=True)
    return filepath

async def main():
    print("1. Launching Edge in headless mode...", flush=True)
    user_data = os.path.join(os.environ.get("TEMP", "C:\\temp"), "edge_cert_profile_9228")
    proc = subprocess.Popen([
        EDGE_PATH,
        f"--remote-debugging-port={PORT}",
        "--headless=new",
        "--disable-gpu",
        f"--user-data-dir={user_data}",
        "--window-size=1280,950",
        "about:blank"
    ])
    
    await asyncio.sleep(2)
    
    try:
        tabs_req = urllib.request.urlopen(f"http://localhost:{PORT}/json")
        tabs = json.loads(tabs_req.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print(f"Connected to CDP at {ws_url}", flush=True)
        
        async with websockets.connect(ws_url) as ws:
            await send_cdp(ws, "Page.enable", msg_id=1)
            await send_cdp(ws, "Runtime.enable", msg_id=2)
            
            # --- TEST 1: Direct Public Verification Screen ---
            print("2. Navigating directly to public verification URL #verify/CERT-DGMS-2026-8941...", flush=True)
            await send_cdp(ws, "Page.navigate", {"url": "http://127.0.0.1:8000/#verify/CERT-DGMS-2026-8941"}, msg_id=10)
            await asyncio.sleep(2.5)
            
            verify_card = await evaluate_js(ws, """
                (() => {
                    const card = document.getElementById('verify-result-container');
                    return card ? card.innerText : 'CONTAINER_NOT_FOUND';
                })()
            """, msg_id=11)
            print(f"=== VERIFICATION CARD RESULT ===\n{verify_card.encode('ascii', 'replace').decode()}\n", flush=True)
            await capture_screenshot(ws, "01_public_verification_valid.png", msg_id=12)
            
            # Search unknown cert
            print("3. Testing Search for invalid / not found certificate...", flush=True)
            await evaluate_js(ws, """
                (() => {
                    const input = document.getElementById('verify-cert-input');
                    const btn = document.getElementById('btn-do-verify');
                    if (input && btn) {
                        input.value = 'CERT-FAKE-NOT-FOUND-999';
                        btn.click();
                    }
                })()
            """, msg_id=20)
            await asyncio.sleep(1.5)
            
            not_found_card = await evaluate_js(ws, """
                (() => {
                    const card = document.getElementById('verify-result-container');
                    return card ? card.innerText : 'CONTAINER_NOT_FOUND';
                })()
            """, msg_id=21)
            print(f"=== NOT FOUND CARD RESULT ===\n{not_found_card.encode('ascii', 'replace').decode()}\n", flush=True)
            await capture_screenshot(ws, "02_public_verification_not_found.png", msg_id=22)

            # --- TEST 2: Supervisor Console & Per-Worker Buttons ---
            print("4. Logging in as Supervisor...", flush=True)
            await evaluate_js(ws, """
                (() => {
                    localStorage.setItem('mine_ar_token', 'token-supervisor-admin');
                    localStorage.setItem('mine_ar_role', 'supervisor');
                    localStorage.setItem('mine_ar_user_id', 'supervisor01');
                    document.body.className = 'bootstrapped supervisor-mode';
                    window.location.hash = '#supervisor';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                })()
            """, msg_id=30)
            await asyncio.sleep(2.5)
            
            roster_buttons = await evaluate_js(ws, """
                (() => {
                    const rows = Array.from(document.querySelectorAll('.roster-table tbody tr'));
                    return rows.map(r => {
                        const name = r.querySelector('strong')?.textContent.trim();
                        const id = r.querySelector('span[style*="monospace"]')?.textContent.trim();
                        const issueBtn = r.querySelector('.btn-worker-issue-cert')?.textContent.trim() || null;
                        const reissueBtn = r.querySelector('.btn-worker-reissue-cert')?.textContent.trim() || null;
                        const viewBtn = r.querySelector('.btn-worker-view-cert')?.textContent.trim() || null;
                        return { id, name, issueBtn, reissueBtn, viewBtn };
                    });
                })()
            """, msg_id=31)
            print(f"=== SUPERVISOR WORKER ROSTER BUTTONS ===\n{json.dumps(roster_buttons, indent=2)}\n", flush=True)
            
            # Scroll table into view
            await evaluate_js(ws, "document.querySelector('.roster-table')?.scrollIntoView({behavior: 'instant'});", msg_id=32)
            await asyncio.sleep(0.5)
            await capture_screenshot(ws, "03_supervisor_roster_individual_buttons.png", msg_id=33)

            # --- TEST 3: Trainee Certificate View with Pure SVG QR ---
            print("5. Viewing Trainee Certificate with QR Code...", flush=True)
            await evaluate_js(ws, """
                (() => {
                    localStorage.setItem('mine_ar_token', 'test-trainee-token');
                    localStorage.setItem('mine_ar_role', 'trainee');
                    localStorage.setItem('mine_ar_user_id', 'abhay01');
                    document.body.className = 'bootstrapped';
                    window.location.hash = '#certificate';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                })()
            """, msg_id=40)
            await asyncio.sleep(2.0)
            
            qr_info = await evaluate_js(ws, """
                (() => {
                    const qrEl = document.querySelector('.cert-qr svg');
                    return {
                        hasQrSvg: !!qrEl,
                        width: qrEl?.getAttribute('width'),
                        height: qrEl?.getAttribute('height'),
                        rectCount: qrEl?.querySelectorAll('rect').length
                    };
                })()
            """, msg_id=41)
            print(f"=== TRAINEE CERTIFICATE QR INFO ===\n{json.dumps(qr_info, indent=2)}\n", flush=True)
            await capture_screenshot(ws, "04_trainee_certificate_qr.png", msg_id=42)

            print("=== ALL CDP TESTS COMPLETED SUCCESSFULLY! ===", flush=True)
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(main())
