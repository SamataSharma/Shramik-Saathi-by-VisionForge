import os

IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "assets", "images")
os.makedirs(IMG_DIR, exist_ok=True)

# 1. Realistic Conveyor Fire & Coal Dust Seam
conveyor_fire_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <radialGradient id="tunnelDark" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="coalWall" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="50%" stop-color="#27272a"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="fireGlow" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="rgba(254, 240, 138, 0)"/>
    </linearGradient>
  </defs>

  <!-- Gallery Background Tunnel -->
  <rect width="800" height="500" fill="url(#tunnelDark)"/>

  <!-- Underground Coal Strata & Rib Pillars -->
  <path d="M0 0 L180 120 L180 500 L0 500 Z" fill="url(#coalWall)"/>
  <path d="M800 0 L620 120 L620 500 L800 500 Z" fill="url(#coalWall)"/>
  <path d="M180 120 L620 120 L620 160 L180 160 Z" fill="#18181b"/>

  <!-- Steel Roof Arch Supports -->
  <path d="M140 500 C140 180, 660 180, 660 500" fill="none" stroke="#475569" stroke-width="14"/>
  <path d="M140 500 C140 180, 660 180, 660 500" fill="none" stroke="#64748b" stroke-width="4"/>

  <path d="M220 500 C220 230, 580 230, 580 500" fill="none" stroke="#334155" stroke-width="10"/>

  <!-- Overhead Yellow Ventilation Ducting -->
  <path d="M200 180 C350 160, 500 170, 750 150" fill="none" stroke="#eab308" stroke-width="26" stroke-dasharray="8,2"/>
  <path d="M200 180 C350 160, 500 170, 750 150" fill="none" stroke="#ca8a04" stroke-width="4"/>

  <!-- Conveyor Belt Assembly (Heavy Industrial) -->
  <polygon points="120,440 680,440 600,280 200,280" fill="#111827"/>
  <!-- Rubber Belt Surface -->
  <polygon points="150,420 650,420 580,290 220,290" fill="#030712"/>

  <!-- Steel Rollers (Idlers) -->
  <line x1="240" y1="310" x2="560" y2="310" stroke="#94a3b8" stroke-width="8"/>
  <line x1="200" y1="360" x2="600" y2="360" stroke="#94a3b8" stroke-width="10"/>
  <line x1="160" y1="410" x2="640" y2="410" stroke="#94a3b8" stroke-width="12"/>

  <!-- Hot Friction Spot & Burning Rubber Idler -->
  <ellipse cx="430" cy="355" rx="45" ry="18" fill="url(#fireGlow)"/>
  <path d="M410 360 Q430 300 450 360 Q440 330 430 305 Q420 330 410 360 Z" fill="#ef4444"/>
  <path d="M418 360 Q430 320 442 360 Q436 340 430 325 Q424 340 418 360 Z" fill="#f59e0b"/>

  <!-- Rising Coal Smoke -->
  <ellipse cx="440" cy="270" rx="60" ry="30" fill="rgba(51, 65, 85, 0.6)"/>
  <ellipse cx="460" cy="220" rx="90" ry="40" fill="rgba(30, 41, 59, 0.7)"/>

  <!-- Spilled Fine Coal Dust on Floor -->
  <path d="M120 440 Q250 430 380 445 Q500 435 680 445 L700 500 L100 500 Z" fill="#09090b"/>

  <!-- Emergency Pull-Cord Switch along gallery -->
  <line x1="120" y1="360" x2="680" y2="360" stroke="#ef4444" stroke-width="4"/>
  <rect x="580" y="340" width="22" height="30" rx="4" fill="#dc2626"/>
  <circle cx="591" cy="355" r="5" fill="#f8fafc"/>
</svg>'''

with open(os.path.join(IMG_DIR, "hazard_conveyor_fire.svg"), "w", encoding="utf-8") as f:
    f.write(conveyor_fire_svg)

# 2. Electrical Substation Hazard Scene
electrical_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <radialGradient id="subBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="url(#subBg)"/>

  <!-- Rock Walls with Mesh & Rock Bolts -->
  <line x1="60" y1="80" x2="740" y2="80" stroke="#334155" stroke-width="2"/>
  <line x1="60" y1="160" x2="740" y2="160" stroke="#334155" stroke-width="2"/>
  <circle cx="180" cy="80" r="10" fill="#94a3b8"/>
  <circle cx="380" cy="80" r="10" fill="#94a3b8"/>
  <circle cx="580" cy="80" r="10" fill="#94a3b8"/>

  <!-- High-Voltage Transformer Unit (3.3kV) -->
  <rect x="220" y="160" width="220" height="230" rx="8" fill="#334155" stroke="#475569" stroke-width="6"/>
  <rect x="240" y="180" width="180" height="100" fill="#1e293b"/>
  <!-- Cooling Fins -->
  <line x1="200" y1="200" x2="220" y2="200" stroke="#64748b" stroke-width="6"/>
  <line x1="200" y1="240" x2="220" y2="240" stroke="#64748b" stroke-width="6"/>
  <line x1="200" y1="280" x2="220" y2="280" stroke="#64748b" stroke-width="6"/>
  <line x1="200" y1="320" x2="220" y2="320" stroke="#64748b" stroke-width="6"/>

  <!-- Warning High Voltage Plaque -->
  <polygon points="330,200 310,240 350,240" fill="#eab308"/>
  <text x="330" y="270" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">DANGER 3.3kV</text>

  <!-- Switchgear Cabinet on Right -->
  <rect x="520" y="140" width="160" height="260" rx="6" fill="#475569" stroke="#64748b" stroke-width="4"/>
  <circle cx="600" cy="200" r="18" fill="#dc2626"/>
  <line x1="560" y1="260" x2="640" y2="260" stroke="#0f172a" stroke-width="4"/>

  <!-- Water Puddle Near Transformer (Hazard 1) -->
  <ellipse cx="320" cy="430" rx="140" ry="32" fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8" stroke-width="2"/>

  <!-- Damaged / Frayed Trailing Cable (Hazard 2) -->
  <path d="M120 450 Q280 430 420 440 T680 410" fill="none" stroke="#0f172a" stroke-width="12"/>
  <path d="M420 440 L450 435" stroke="#f59e0b" stroke-width="6"/>
  <!-- Electrical Arcing Spark -->
  <polygon points="440,430 445,415 455,425 465,410 458,435" fill="#facc15"/>
</svg>'''

with open(os.path.join(IMG_DIR, "hazard_electrical_substation.svg"), "w", encoding="utf-8") as f:
    f.write(electrical_svg)

# 3. Working Coal Face & Roof Strata Hazard Scene
roof_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" fill="#09090b"/>
  <!-- Broken Sandstone Roof Strata -->
  <polygon points="0,0 800,0 800,140 680,160 520,130 380,170 200,135 0,150" fill="#3f3f46"/>
  <!-- Roof Cracks & Separation Bedding Planes -->
  <path d="M150 140 L240 80 L320 120 L420 70" fill="none" stroke="#ef4444" stroke-width="4"/>
  <path d="M380 170 L480 130 L580 150" fill="none" stroke="#dc2626" stroke-width="3"/>

  <!-- Spalling Falling Coal Chunks -->
  <polygon points="360,190 390,180 385,210 355,205" fill="#18181b" stroke="#ef4444" stroke-width="1.5"/>
  <polygon points="280,220 300,210 295,235" fill="#18181b"/>

  <!-- Timber Support Prop (Cracked under roof pressure) -->
  <rect x="220" y="140" width="28" height="300" fill="#78350f" stroke="#451a03" stroke-width="3"/>
  <line x1="220" y1="260" x2="248" y2="275" stroke="#ef4444" stroke-width="4"/>

  <!-- Digital Methane Detector Mounted on Timber -->
  <rect x="210" y="200" width="48" height="36" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <rect x="216" y="206" width="36" height="18" fill="#0f172a"/>
  <text x="234" y="220" fill="#ef4444" font-family="monospace" font-weight="bold" font-size="11" text-anchor="middle">1.4%</text>

  <!-- Continuous Miner Machine at Coal Face -->
  <rect x="440" y="240" width="300" height="200" rx="12" fill="#d97706" stroke="#b45309" stroke-width="6"/>
  <circle cx="480" cy="270" r="45" fill="#1f2937" stroke="#9ca3af" stroke-width="6" stroke-dasharray="14,6"/>
  <circle cx="480" cy="270" r="16" fill="#facc15"/>
</svg>'''

with open(os.path.join(IMG_DIR, "hazard_roof_spalling.svg"), "w", encoding="utf-8") as f:
    f.write(roof_svg)

print("Generated all realistic hazard scene backgrounds in app/assets/images/")
