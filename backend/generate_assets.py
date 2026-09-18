import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "assets", "images")
os.makedirs(ASSETS_DIR, exist_ok=True)

# 1. Avatar Suresh (SVG)
suresh_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2c3e50"/>
      <stop offset="100%" stop-color="#1a252f"/>
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c68642"/>
      <stop offset="100%" stop-color="#a5652a"/>
    </linearGradient>
    <clipPath id="circleClip">
      <circle cx="60" cy="60" r="58"/>
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
    <rect width="120" height="120" fill="url(#bgGrad)"/>
    <!-- Mining uniform & Collar -->
    <path d="M20 120 L25 80 L60 85 L95 80 L100 120 Z" fill="#1e3a5f"/>
    <path d="M45 82 L60 102 L75 82 Z" fill="#ffffff"/>
    <path d="M52 82 L60 96 L68 82 Z" fill="#b91c1c"/>
    <path d="M25 88 L35 120" stroke="#f59e0b" stroke-width="4"/>
    <path d="M95 88 L85 120" stroke="#f59e0b" stroke-width="4"/>
    <!-- Head & Neck -->
    <rect x="52" y="65" width="16" height="22" rx="4" fill="url(#skinGrad)"/>
    <ellipse cx="60" cy="52" rx="20" ry="24" fill="url(#skinGrad)"/>
    <!-- Hair & Beard -->
    <path d="M40 48 Q60 22 80 48 Q78 30 60 30 Q42 30 40 48 Z" fill="#171717"/>
    <path d="M42 58 Q60 80 78 58 Q70 74 60 74 Q50 74 42 58 Z" fill="#171717"/>
    <!-- Mustache -->
    <path d="M48 61 Q60 67 72 61 Q60 63 48 61 Z" fill="#171717"/>
    <!-- Eyes -->
    <circle cx="53" cy="50" r="2.5" fill="#171717"/>
    <circle cx="67" cy="50" r="2.5" fill="#171717"/>
    <!-- Safety Hardhat -->
    <path d="M36 38 C36 18, 84 18, 84 38 Z" fill="#fbbf24"/>
    <path d="M30 38 L90 38 L90 43 L30 43 Z" rx="2" fill="#d97706"/>
    <!-- Miner Lamp on hardhat -->
    <rect x="55" y="24" width="10" height="10" rx="3" fill="#38bdf8"/>
    <circle cx="60" cy="29" r="3" fill="#ffffff"/>
  </g>
  <circle cx="60" cy="60" r="58" fill="none" stroke="#3b82f6" stroke-width="3"/>
</svg>'''

with open(os.path.join(ASSETS_DIR, "worker_avatar.svg"), "w", encoding="utf-8") as f:
    f.write(suresh_svg)

# 2. Hazard Cards Thumbnail (Level 1 main card)
hazard_thumb_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120" width="180" height="120">
  <defs>
    <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="180" height="120" rx="14" fill="url(#hGrad)"/>
  <!-- Conveyor Frame -->
  <line x1="20" y1="80" x2="160" y2="80" stroke="#94a3b8" stroke-width="6"/>
  <circle cx="45" cy="80" r="14" fill="#334155" stroke="#f1f5f9" stroke-width="3"/>
  <circle cx="90" cy="80" r="14" fill="#334155" stroke="#f1f5f9" stroke-width="3"/>
  <circle cx="135" cy="80" r="14" fill="#334155" stroke="#f1f5f9" stroke-width="3"/>
  <!-- Fire Flame -->
  <path d="M90 70 C70 50, 80 30, 90 20 C100 30, 110 50, 90 70 Z" fill="#ef4444"/>
  <path d="M90 70 C80 58, 86 42, 90 35 C94 42, 100 58, 90 70 Z" fill="#f59e0b"/>
  <!-- Warning badge -->
  <rect x="110" y="16" width="56" height="24" rx="6" fill="#dc2626"/>
  <text x="138" y="32" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CMR 136</text>
</svg>'''

with open(os.path.join(ASSETS_DIR, "hazard_thumb.svg"), "w", encoding="utf-8") as f:
    f.write(hazard_thumb_svg)

# 3. Lessons Card Mining Site Image
lessons_img_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" width="240" height="180">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="240" height="180" rx="12" fill="url(#skyGrad)"/>
  <!-- Mine Coal Face / Structures -->
  <polygon points="0,120 60,80 120,110 180,70 240,100 240,180 0,180" fill="#334155"/>
  <polygon points="0,140 80,120 160,135 240,115 240,180 0,180" fill="#1e293b"/>
  <!-- Excavator Machine -->
  <rect x="40" y="115" width="45" height="25" rx="3" fill="#f59e0b"/>
  <rect x="48" y="100" width="22" height="16" rx="2" fill="#0284c7"/>
  <line x1="85" y1="125" x2="115" y2="95" stroke="#475569" stroke-width="5"/>
  <line x1="115" y1="95" x2="135" y2="120" stroke="#475569" stroke-width="4"/>
  <circle cx="50" cy="142" r="7" fill="#0f172a"/>
  <circle cx="75" cy="142" r="7" fill="#0f172a"/>
  <!-- 3 Workers in hardhats reviewing plan -->
  <!-- Worker 1 -->
  <circle cx="165" cy="125" r="5" fill="#facc15"/>
  <rect x="161" y="130" width="8" height="16" fill="#16a34a"/>
  <!-- Worker 2 -->
  <circle cx="178" cy="123" r="5" fill="#facc15"/>
  <rect x="174" y="128" width="8" height="18" fill="#f97316"/>
  <!-- Worker 3 -->
  <circle cx="191" cy="124" r="5" fill="#ffffff"/>
  <rect x="187" y="129" width="8" height="17" fill="#2563eb"/>
  <!-- White Blueprint -->
  <rect x="168" y="134" width="22" height="10" rx="1" fill="#f8fafc" stroke="#38bdf8"/>
</svg>'''

with open(os.path.join(ASSETS_DIR, "lessons_banner.svg"), "w", encoding="utf-8") as f:
    f.write(lessons_img_svg)

# 4. Games Hazard Hunt Image
games_img_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" width="240" height="180">
  <defs>
    <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="240" height="180" rx="12" fill="url(#gGrad)"/>
  <!-- Steel Rig / Shaft Headframe -->
  <line x1="80" y1="20" x2="50" y2="160" stroke="#f59e0b" stroke-width="4"/>
  <line x1="120" y1="20" x2="150" y2="160" stroke="#f59e0b" stroke-width="4"/>
  <line x1="60" y1="70" x2="140" y2="70" stroke="#d97706" stroke-width="3"/>
  <line x1="65" y1="110" x2="135" y2="110" stroke="#d97706" stroke-width="3"/>
  <line x1="60" y1="70" x2="135" y2="110" stroke="#d97706" stroke-width="2"/>
  <line x1="140" y1="70" x2="65" y2="110" stroke="#d97706" stroke-width="2"/>
  <!-- Headframe Wheel (Sheave) -->
  <circle cx="100" cy="30" r="16" fill="none" stroke="#fef08a" stroke-width="4"/>
  <!-- Hazard Reticle in AR style -->
  <circle cx="100" cy="110" r="28" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
  <line x1="100" y1="75" x2="100" y2="85" stroke="#ef4444" stroke-width="2"/>
  <line x1="100" y1="135" x2="100" y2="145" stroke="#ef4444" stroke-width="2"/>
  <line x1="65" y1="110" x2="75" y2="110" stroke="#ef4444" stroke-width="2"/>
  <line x1="125" y1="110" x2="135" y2="110" stroke="#ef4444" stroke-width="2"/>
  <!-- Text HUD -->
  <rect x="68" y="145" width="64" height="18" rx="4" fill="#dc2626"/>
  <text x="100" y="158" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">SPARK HAZARD</text>
</svg>'''

with open(os.path.join(ASSETS_DIR, "games_banner.svg"), "w", encoding="utf-8") as f:
    f.write(games_img_svg)

print("Generated all SVG assets successfully in app/assets/images/")
