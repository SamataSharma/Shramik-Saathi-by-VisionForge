// Unified Scenario Data & Configuration Engine for VISIONFORGE MINE AR
// Defines the 5 Official Vocational Training Simulations

export const SCENARIOS = [
  {
    id: "sim_fire_explosion",
    domain: "Fire & Explosion Response",
    title: "Conveyor Belt Friction & Spontaneous Heating",
    location: "Trunk Belt Conveyor Gallery",
    hazardType: "Thermal Combustion & Toxic Smoke",
    targetType: "Conveyor Belt Idler / Gallery Floor",
    supportedTargetLabel: "Conveyor Drive / Floor Plane",
    briefing: "Friction between a seized conveyor roller idler and vulcanized rubber belt has generated localized spontaneous heating with glowing coal fines and Carbon Monoxide smoke.",
    targetSafetyDoctrine: [
      "Hazard Recognition: Identify heating indicators promptly.",
      "Equipment Selection: Dry Chemical Powder (DCP) for energized electrical conveyor drives.",
      "Ventilation Positioning: Always approach from intake fresh airflow (upwind).",
      "PASS Protocol: Pull pin, Aim at base, Squeeze lever, Sweep side-to-side."
    ],
    checklist: [
      { id: "c1", text: "Verify Dry Chemical Powder (DCP) cylinder pressure gauge is in operable range" },
      { id: "c2", text: "Confirm clear unobstructed escape route behind operator" },
      { id: "c3", text: "Verify intake airway positioning (fresh air flowing past you toward the hazard)" },
      { id: "c4", text: "Maintain safe operational approach distance from energized conveyor drive" },
      { id: "c5", text: "Inspect cylinder tamper seal and discharge hose nozzle for blockages" }
    ],
    allowedEquipment: [
      { id: "dcp_extinguisher", name: "Dry Chemical Powder (DCP)", icon: "🧯", correct: true },
      { id: "water_extinguisher", name: "Water Hose / Spray", icon: "💧", correct: false, reason: "Water risks electrical flashover near drive motors and dust cloud agitation" },
      { id: "co2_extinguisher", name: "Carbon Dioxide (CO2)", icon: "💨", correct: false, reason: "CO2 has limited range and rapid dissipation in mine ventilation" }
    ],
    airwayOptions: [
      { id: "intake", name: "Intake Airway (Upwind - Fresh Air)", safe: true },
      { id: "return", name: "Return Airway (Downwind - Toxic Smoke)", safe: false, reason: "Deadly Carbon Monoxide and dense smoke flow directly into return airway" }
    ],
    passRequired: true
  },
  {
    id: "sim_gas_confined",
    domain: "Gas Leak & Confined Space",
    title: "Multi-Gas Detection & Confined Space Entry",
    location: "Continuous Miner Ingress Heading",
    hazardType: "Inflammable Gas Accumulation & Oxygen Deficiency",
    targetType: "Confined Space Entry Collar / Seam Heading",
    supportedTargetLabel: "Confined Space Portal / Airway Face",
    briefing: "Entering a remote coal seam heading requires multi-gas testing, personal protective verification, and continuous communication with your assigned safety buddy.",
    targetSafetyDoctrine: [
      "Pre-Entry Check: Verify atmospheric safety prior to breaking entry perimeter.",
      "Gas Monitoring: Verify Multi-Gas detector responds across all channels (CH4, CO, O2).",
      "Buddy Protocol: Maintain visual and verbal communication with designated safety buddy.",
      "Action on Gas Warning: De-energize machinery and withdraw immediately into fresh air."
    ],
    checklist: [
      { id: "cg1", text: "Calibrate and bump-test digital multi-gas detector for CH4, CO, and O2" },
      { id: "cg2", text: "Inspect 60-minute Self-Contained Self-Rescuer (SCSR) case and tamper indicator" },
      { id: "cg3", text: "Confirm verbal and signal communication with assigned Virtual Safety Buddy" },
      { id: "cg4", text: "Verify auxiliary ventilation ducting is actively delivering fresh intake air" },
      { id: "cg5", text: "Identify location of nearest refuge bay and egress lifeline" }
    ],
    buddyScenario: true
  },
  {
    id: "sim_machinery_safety",
    domain: "Machinery Safety",
    title: "Electrical Lockout/Tagout & Continuous Miner Safety",
    location: "Heavy Machine Transfer Substation",
    hazardType: "Mechanical Pinch Points & High-Voltage Cable Arcing",
    targetType: "Industrial Machinery Drive / Power Isolator Panel",
    supportedTargetLabel: "Equipment Drive / Electrical Isolation Switch",
    briefing: "A trailing cable to the continuous miner cutter head is showing mechanical abrasion near the haulage crossover. Trainee must verify isolation, safe clearance, and lockout before approach.",
    targetSafetyDoctrine: [
      "Isolation Protocol: De-energize gate-end circuit breaker and apply lockout/tagout (LOTO).",
      "Safe Perimeter: Stay clear of machinery swing radius and moving conveyor pinch points.",
      "Cable Inspection: Never handle energized 3.3kV flexible trailing cables with bare hands.",
      "Emergency Controls: Locate and test emergency trip pull-cord switch stations."
    ],
    checklist: [
      { id: "cm1", text: "Verify physical isolation of machinery electrical feed at the section breaker" },
      { id: "cm2", text: "Affix Lockout/Tagout (LOTO) warning tag and padlock to the disconnect lever" },
      { id: "cm3", text: "Verify zero-energy state with calibrated high-voltage proximity detector" },
      { id: "cm4", text: "Maintain required 1.5m clearance perimeter from machine articulated boom" },
      { id: "cm5", text: "Wear rated dielectric safety boots and flame-retardant safety gloves" }
    ],
    machineryProtocol: true
  },
  {
    id: "sim_emergency_evac",
    domain: "Emergency Evacuation",
    title: "Subsurface Evacuation & Refuge Chamber Protocol",
    location: "Main Seam Trunk Escapeway",
    hazardType: "Visibility Loss & Airway Smoke Contamination",
    targetType: "Escapeway Lifeline / Air Separation Door",
    supportedTargetLabel: "Escapeway Lifeline Route / Refuge Portal",
    briefing: "Fire alarm sirens sound along the panel. Visibility is deteriorating. Trainee must don self-rescuer respiratory pack, locate tactile lifeline, and lead retreat to the intake shaft or refuge bay.",
    targetSafetyDoctrine: [
      "Immediate Activation: Don and activate 60-min SCSR oxygen pack without hesitation.",
      "Lifeline Navigation: Follow tactile directional cones pointing along fresh air escapeway.",
      "Separation Doors: Pass through air-lock doors and ensure they latch shut behind you.",
      "Refuge Protocol: If escape is blocked by fire, enter positive-pressure refuge chamber."
    ],
    checklist: [
      { id: "ce1", text: "Open SCSR protective casing and insert silicone mouthpiece firmly" },
      { id: "ce2", text: "Clamp nose clip securely and verify steady oxygen generation flow" },
      { id: "ce3", text: "Locate tactile escape lifeline and verify directional cone points toward intake shaft" },
      { id: "ce4", text: "Confirm buddy pair count before commencing single-file retreat" },
      { id: "ce5", text: "Ensure separation air-lock doors are never propped open" }
    ],
    evacProtocol: true
  },
  {
    id: "sim_roof_strata",
    domain: "Strata Control & Roof Support",
    title: "Working Face Strata Cracking & Roof Fall Prevention",
    location: "Active Extraction Working Seam",
    hazardType: "Sandstone Delamination & Unstable Spalling Rocks",
    targetType: "Working Face Roof Strata / Timber Prop",
    supportedTargetLabel: "Roof Strata Joint / Support Prop Anchor",
    briefing: "Audible cracking and spalling rocks detected along the sandstone bedding plane at the coal extraction face. Trainee must execute roof sounding, check support props, and enforce safe stand-off.",
    targetSafetyDoctrine: [
      "Auditory Awareness: Distinct strata cracking signals imminent roof delamination.",
      "Sound-and-Tap Testing: Use testing rod to assess roof cohesion (clear ring vs dull drummy thud).",
      "Support Props: Never advance beyond last row of permanent resin roof bolts and props.",
      "Emergency Withdrawal: Sound immediate alert and withdraw to supported roadway."
    ],
    checklist: [
      { id: "cr1", text: "Inspect timber cribs and hydraulic props for load-induced bowing or cracking" },
      { id: "cr2", text: "Perform non-destructive sound-and-tap test with non-ferrous inspection rod" },
      { id: "cr3", text: "Verify no personnel enter green unsupported roof zone ahead of props" },
      { id: "cr4", text: "Check tell-tale roof convergence indicators for strata bed separation" },
      { id: "cr5", text: "Establish 3m stand-off zone from spalling rib and face area" }
    ],
    roofProtocol: true
  }
];

export function getScenarioById(id) {
  return SCENARIOS.find(s => s.id === id) || SCENARIOS[0];
}
