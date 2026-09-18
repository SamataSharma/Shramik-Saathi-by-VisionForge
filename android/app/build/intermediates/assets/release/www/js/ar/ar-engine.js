// WebXR & Three.js AR Engine with Spatial Anchoring & Scenario-Specific 3D Hazard Visualizations
// Modules: Fire & Explosion, Gas Leak & Confined Space, Machinery Safety, Emergency Evac, Strata Control

import { ParticleFireSystem } from './particle-fire.js';
import { startScenarioAlarm, stopScenarioAlarm, playExtinguisherHiss } from '../voice.js';

export class AREngine {
  constructor(videoElement, canvasElement, options = {}) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.scenarioId = options.scenarioId || 'sim_fire_explosion';
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fireSystem = null;
    this.animFrameId = null;
    this.mediaStream = null;
    this.isFallbackMode = false;
    this.isSurfaceLocked = false;
    this.hazardPosition = new THREE.Vector3(0, -0.6, -2.5);

    // Honest tracking label: default to simulation/rotation fallback unless true WebXR session active
    this.trackingMode = 'SIMULATION / ROTATION FALLBACK';

    // Three.js Groups
    this.reticleGroup = null;
    this.hazardGroup = null;
    this.conveyorGroup = null;
    this.extinguisherGroup = null;
    this.galleryMeshGroup = null;

    // Extinguisher Parts for Animation
    this.extinguisherParts = {
      body: null,
      lever: null,
      pin: null,
      nozzle: null
    };

    // State of PASS
    this.passState = {
      pinPulled: false,
      aimed: false,
      squeezing: false,
      sweeping: false,
      sweepAngle: 0
    };

    // Scenario specific animation controllers
    this.gasSystem = null;
    this.machinerySystem = null;
    this.evacSystem = null;
    this.strataSystem = null;

    this.dangerRing = null;
    this.clock = new THREE.Clock();

    // Camera interaction controls (for testing and spatial anchoring demonstration)
    this.cameraYaw = 0;
    this.cameraPitch = 0;
    this.isPointerDragging = false;
    this.prevPointerPos = { x: 0, y: 0 };
  }

  async initialize() {
    this.setupThreeScene();
    this.setupCameraControls();

    // Try starting live camera stream
    const cameraSuccess = await this.startCamera();
    if (!cameraSuccess) {
      console.log('[AREngine] Camera stream unavailable. Engaging 3D Mine Gallery Simulation mode.');
      this.engageFallbackSimulation();
    }


    // Build scenario-specific 3D interactive hazard
    this.buildScenarioHazard();

    // Start render loop
    this.animate();

    return {
      isFallback: this.isFallbackMode,
      isSurfaceLocked: this.isSurfaceLocked,
      trackingMode: this.trackingMode
    };
  }

  setupThreeScene() {
    this.scene = new THREE.Scene();

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    // Key Directional Light
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.85);
    dirLight.position.set(2, 4, 2);
    this.scene.add(dirLight);

    // Hazard Boundary Ring on floor
    const ringGeo = new THREE.RingGeometry(0.9, 1.05, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.dangerRing = new THREE.Mesh(ringGeo, ringMat);
    this.dangerRing.rotation.x = -Math.PI / 2;
    this.dangerRing.position.copy(this.hazardPosition);
    this.scene.add(this.dangerRing);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  setupCameraControls() {
    // Pointer Drag & Touch Look Controls (Desktop/Browser testing fallback)
    const onPointerDown = (e) => {
      this.isPointerDragging = true;
      this.prevPointerPos = { x: e.clientX || (e.touches && e.touches[0].clientX) || 0, y: e.clientY || (e.touches && e.touches[0].clientY) || 0 };
    };

    const onPointerMove = (e) => {
      if (!this.isPointerDragging) return;
      const curX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const curY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const dx = curX - this.prevPointerPos.x;
      const dy = curY - this.prevPointerPos.y;
      this.prevPointerPos = { x: curX, y: curY };

      this.cameraYaw -= dx * 0.005;
      this.cameraPitch = Math.max(-Math.PI * 0.35, Math.min(Math.PI * 0.35, this.cameraPitch - dy * 0.005));

      this.updateCameraRotation();
    };

    const onPointerUp = () => {
      this.isPointerDragging = false;
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // DeviceOrientation listener for mobile phones (gyroscope rotation fallback)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (event) => {
        if (event.beta !== null && event.gamma !== null && !this.isPointerDragging) {
          const pitch = (event.beta - 45) * (Math.PI / 180) * 0.5;
          const roll = event.gamma * (Math.PI / 180) * 0.5;
          this.cameraPitch = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, pitch));
          this.cameraYaw = roll;
          this.updateCameraRotation();
        }
      }, false);
    }
  }

  updateCameraRotation() {
    if (!this.camera) return;
    const euler = new THREE.Euler(this.cameraPitch, this.cameraYaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  selectRandomValidSurfacePose(scenarioId) {
    // 1. Obtain detected surface boundaries based on scenario requirements
    let minZ = -3.2;
    let maxZ = -2.0;
    let minX = -1.2;
    let maxX = 1.2;
    let posY = -0.6; // Floor plane

    if (scenarioId === 'sim_roof_strata') {
      posY = 0.1; // Overhead / upper strata plane
      minZ = -3.0;
      maxZ = -1.9;
    } else if (scenarioId === 'sim_gas_confined') {
      posY = -0.3; // Heading flange
      minZ = -3.0;
      maxZ = -2.0;
    } else if (scenarioId === 'sim_machinery_safety') {
      posY = -0.5;
      minZ = -3.2;
      maxZ = -2.1;
    } else if (scenarioId === 'sim_emergency_evac') {
      posY = -0.6;
      minZ = -3.4;
      maxZ = -2.2;
    }

    // 2. Controlled Random Candidate Generation with Viewport NDC Validation
    // Validates position to guarantee discovery from initial camera field-of-view:
    // - Not behind the worker
    // - Not outside the camera screen
    // - Not at the extreme edge
    // - Optimal distance (1.8m to 3.2m)
    const validCandidates = [];
    for (let attempt = 0; attempt < 25; attempt++) {
      const cx = minX + Math.random() * (maxX - minX);
      const cz = minZ + Math.random() * (maxZ - minZ);
      const cy = posY + (Math.random() - 0.5) * 0.12; // Controlled elevation variance
      const candidate = new THREE.Vector3(cx, cy, cz);

      // Distance check: between 1.8m and 3.2m
      const dist = candidate.length();
      if (dist < 1.8 || dist > 3.2) continue;

      // Project into initial camera view NDC coordinates [-1, 1]
      if (this.camera) {
        const screenPos = candidate.clone().project(this.camera);
        // Reject behind camera (depth z > 1 in NDC or z in world > -1.2)
        if (screenPos.z > 1.0 || candidate.z > -1.2) continue;

        // Guaranteed discoverable in starting camera FOV: not at extreme edges (|x| <= 0.65, |y| <= 0.55)
        if (Math.abs(screenPos.x) <= 0.65 && Math.abs(screenPos.y) <= 0.55) {
          validCandidates.push(candidate);
        }
      } else {
        validCandidates.push(candidate);
      }
    }

    // Select candidate with controlled randomness
    if (validCandidates.length > 0) {
      return validCandidates[Math.floor(Math.random() * validCandidates.length)];
    }

    // Safe discoverable fallback within initial FOV
    const defaultX = (Math.random() - 0.5) * 0.6; // Slightly left or right
    return new THREE.Vector3(defaultX, posY, -2.4);
  }

  generateAndAnchorRandomHazard() {
    const randomPose = this.selectRandomValidSurfacePose(this.scenarioId);
    this.hazardPosition.copy(randomPose);
    this.isSurfaceLocked = true;

    // Create Spatial Anchor representation
    this.arAnchor = {
      id: "anchor_" + Date.now(),
      position: this.hazardPosition.clone(),
      createdAt: performance.now()
    };

    // Spatially attach hazard to anchor
    if (this.conveyorGroup) {
      this.conveyorGroup.position.copy(this.hazardPosition);
      this.conveyorGroup.visible = true;
    }
    if (this.hazardGroup) {
      this.hazardGroup.position.copy(this.hazardPosition);
      this.hazardGroup.visible = true;
    }
    if (this.dangerRing) {
      this.dangerRing.position.copy(this.hazardPosition);
      this.dangerRing.visible = true;
    }
    if (this.redFireLight) {
      this.redFireLight.position.copy(this.hazardPosition).add(new THREE.Vector3(0, 0.2, 0));
    }
    if (this.fireSystem) {
      this.fireSystem.setAnchorPosition(this.hazardPosition);
    }

    return this.arAnchor;
  }

  buildScenarioHazard() {
    if (this.scenarioId === 'sim_fire_explosion') {
      this.buildConveyorHazard(this.hazardPosition);
      this.buildExtinguisherModel();
      this.fireSystem = new ParticleFireSystem(this.scene);
      this.fireSystem.setAnchorPosition(this.hazardPosition);
    } else if (this.scenarioId === 'sim_gas_confined') {
      this.buildGasConfinedHazard(this.hazardPosition);
    } else if (this.scenarioId === 'sim_machinery_safety') {
      this.buildMachineryHazard(this.hazardPosition);
    } else if (this.scenarioId === 'sim_emergency_evac') {
      this.buildEvacuationHazard(this.hazardPosition);
    } else if (this.scenarioId === 'sim_roof_strata') {
      this.buildRoofStrataHazard(this.hazardPosition);
    }

    // Start procedural emergency siren & environmental sounds in ALL 5 scenarios
    startScenarioAlarm(this.scenarioId);
  }

  // ==========================================
  // MODULE 1: FIRE & EXPLOSION RESPONSE
  // ==========================================
  buildConveyorHazard(pos) {
    this.conveyorGroup = new THREE.Group();

    // 1. Heavy Steel Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const sideBeam1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 4.0), frameMat);
    sideBeam1.position.set(-0.55, 0, 0);
    const sideBeam2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 4.0), frameMat);
    sideBeam2.position.set(0.55, 0, 0);
    this.conveyorGroup.add(sideBeam1, sideBeam2);

    // Support Legs
    for (let z = -1.8; z <= 1.8; z += 1.2) {
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), frameMat);
      leg1.position.set(-0.55, -0.2, z);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), frameMat);
      leg2.position.set(0.55, -0.2, z);
      this.conveyorGroup.add(leg1, leg2);
    }

    // 2. Rubber Conveyor Belt
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 4.0), beltMat);
    belt.position.set(0, 0.08, 0);
    this.conveyorGroup.add(belt);

    // 3. Electric Drive Motor & Head Pulley
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.7, roughness: 0.3 });
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16), motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-0.75, 0.1, -1.8);
    this.conveyorGroup.add(motor);

    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const headPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.1, 24), pulleyMat);
    headPulley.rotation.z = Math.PI / 2;
    headPulley.position.set(0, 0.1, -1.8);
    this.conveyorGroup.add(headPulley);

    // 4. Coal Lumps on Belt
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
    for (let i = 0; i < 12; i++) {
      const lump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06, 0), coalMat);
      lump.position.set((Math.random() - 0.5) * 0.5, 0.14, (Math.random() - 0.5) * 1.5);
      lump.rotation.set(Math.random(), Math.random(), Math.random());
      this.conveyorGroup.add(lump);
    }

    // 5. Smoldering Friction Point (Hot Spot mesh)
    const hotSpotMat = new THREE.MeshBasicMaterial({ color: 0xff3b00 });
    const hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 16), hotSpotMat);
    hotSpot.position.set(0, 0.11, 0);
    this.conveyorGroup.add(hotSpot);
    this.hotSpotMesh = hotSpot;

    // Tactical Fire Point Light
    const redFireLight = new THREE.PointLight(0xff4500, 2.5, 8);
    redFireLight.position.copy(pos).add(new THREE.Vector3(0, 0.2, 0));
    this.scene.add(redFireLight);
    this.redFireLight = redFireLight;

    this.conveyorGroup.position.copy(pos);
    this.scene.add(this.conveyorGroup);
  }

  buildExtinguisherModel() {
    this.extinguisherGroup = new THREE.Group();

    // Red Cylinder Body
    const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.46, 24);
    const cylinderMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.35, roughness: 0.25 });
    const body = new THREE.Mesh(cylinderGeo, cylinderMat);
    this.extinguisherGroup.add(body);
    this.extinguisherParts.body = body;

    // Base Boot & Domed Top
    const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x18181b }));
    boot.position.set(0, -0.22, 0);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), cylinderMat);
    dome.position.set(0, 0.23, 0);
    this.extinguisherGroup.add(boot, dome);

    // Label Canvas
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 128;
    const lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = '#ffffff';
    lctx.fillRect(0, 0, 256, 128);
    lctx.fillStyle = '#0f172a';
    lctx.font = 'bold 24px sans-serif';
    lctx.fillText('SHRAMIK SAATHI - DCP', 18, 36);
    lctx.fillStyle = '#dc2626';
    lctx.font = 'bold 18px sans-serif';
    lctx.fillText('IS: 2171 (6 KG)', 18, 64);
    lctx.fillStyle = '#475569';
    lctx.font = '14px sans-serif';
    lctx.fillText('TRAINING SIMULATOR', 18, 92);
    lctx.fillStyle = '#15803d';
    lctx.font = 'bold 13px sans-serif';
    lctx.fillText('SIMULATION APPARATUS', 18, 114);

    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.102, 0.102, 0.22, 24, 1, true, -Math.PI * 0.4, Math.PI * 0.8),
      new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
    );
    labelMesh.position.set(0, 0.02, 0);
    this.extinguisherGroup.add(labelMesh);

    // Lever & Pin
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5 });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.03), handleMat);
    handle.position.set(0.06, 0.38, 0);
    this.extinguisherGroup.add(handle);

    const leverGroup = new THREE.Group();
    leverGroup.position.set(0.01, 0.42, 0);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.03), handleMat);
    lever.position.set(0.06, 0, 0);
    leverGroup.add(lever);
    this.extinguisherGroup.add(leverGroup);
    this.extinguisherParts.lever = leverGroup;

    // Pin with yellow pull ring
    const pinGroup = new THREE.Group();
    pinGroup.position.set(0, 0.40, 0);
    const pinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
    pinMesh.rotation.z = Math.PI / 2;
    const pullRing = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 8, 20), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
    pullRing.position.set(0.045, 0, 0);
    pinGroup.add(pinMesh, pullRing);
    this.extinguisherGroup.add(pinGroup);
    this.extinguisherParts.pin = pinGroup;

    // Nozzle & Hose
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.03, 0.36, 0),
      new THREE.Vector3(-0.12, 0.30, 0.05),
      new THREE.Vector3(-0.14, 0.15, 0.08),
      new THREE.Vector3(-0.04, -0.05, 0.22)
    ]);
    const hose = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.014, 8, false), hoseMat);
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x27272a }));
    nozzle.position.set(-0.04, -0.05, 0.26);
    nozzle.rotation.x = Math.PI / 2 + 0.3;
    const nozzleGroup = new THREE.Group();
    nozzleGroup.add(hose, nozzle);
    this.extinguisherGroup.add(nozzleGroup);
    this.extinguisherParts.nozzle = nozzleGroup;

    this.extinguisherGroup.position.set(0.24, -0.32, -0.75);
    this.extinguisherGroup.rotation.set(0.1, -0.25, 0.05);
    this.scene.add(this.extinguisherGroup);
  }

  // ==========================================
  // MODULE 2: GAS LEAK & CONFINED SPACE
  // ==========================================
  buildGasConfinedHazard(pos) {
    this.hazardGroup = new THREE.Group();

    // 1. Industrial High-Pressure Pipe & Flange Assembly
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const pipeMain = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 24), pipeMat);
    pipeMain.rotation.z = Math.PI / 2;
    pipeMain.position.set(0, 0.2, -0.2);
    this.hazardGroup.add(pipeMain);

    // Bolted Flange Joint (Leak Source)
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const flange1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), flangeMat);
    flange1.rotation.z = Math.PI / 2;
    flange1.position.set(-0.04, 0.2, -0.2);
    const flange2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), flangeMat);
    flange2.rotation.z = Math.PI / 2;
    flange2.position.set(0.04, 0.2, -0.2);
    this.hazardGroup.add(flange1, flange2);

    // Valve Handwheel (Red industrial wheel)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.5 });
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 12, 24), wheelMat);
    wheel.position.set(0.4, 0.45, -0.2);
    wheel.rotation.x = Math.PI / 2;
    this.hazardGroup.add(wheel);

    // Auxiliary Ventilation Ducting (Flexible yellow duct)
    const ductMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3.0, 20), ductMat);
    duct.position.set(0, 1.1, -0.5);
    duct.rotation.z = Math.PI / 2;
    this.hazardGroup.add(duct);

    // 2. Realistic Pressurized Gas Jet Particle System
    const jetCount = 180;
    const jetGeo = new THREE.BufferGeometry();
    const jetPos = new Float32Array(jetCount * 3);
    const jetColors = new Float32Array(jetCount * 3);
    this.gasJetData = [];

    for (let i = 0; i < jetCount; i++) {
      jetPos[i * 3] = 0;
      jetPos[i * 3 + 1] = 0.2;
      jetPos[i * 3 + 2] = -0.2;

      // Vapor cloud subtle yellowish-white
      jetColors[i * 3] = 0.95;
      jetColors[i * 3 + 1] = 0.9;
      jetColors[i * 3 + 2] = 0.6;

      this.gasJetData.push({
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.8 + Math.random() * 1.2,
        vz: 1.2 + Math.random() * 1.5,
        life: Math.random(),
        maxLife: 0.8 + Math.random() * 0.5
      });
    }
    jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3));
    jetGeo.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 230, 0.8)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const jetMat = new THREE.PointsMaterial({
      size: 0.22,
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    this.gasJetParticles = new THREE.Points(jetGeo, jetMat);
    this.hazardGroup.add(this.gasJetParticles);

    // 3. Spatially Anchored 3D Gas Concentration HUD Readout
    const hudCanvas = document.createElement('canvas');
    hudCanvas.width = 320; hudCanvas.height = 120;
    const hctx = hudCanvas.getContext('2d');
    hctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    hctx.fillRect(0, 0, 320, 120);
    hctx.strokeStyle = '#f59e0b';
    hctx.lineWidth = 4;
    hctx.strokeRect(4, 4, 312, 112);
    hctx.fillStyle = '#ef4444';
    hctx.font = 'bold 20px sans-serif';
    hctx.fillText('⚠️ CH4: 1.35% VOL', 20, 38);
    hctx.fillStyle = '#f59e0b';
    hctx.font = 'bold 15px sans-serif';
    hctx.fillText('SIMULATION THRESHOLD: >1.25%', 20, 68);
    hctx.fillStyle = '#94a3b8';
    hctx.font = '12px sans-serif';
    hctx.fillText('HAZARD ZONE: IMMEDIATE WITHDRAWAL', 20, 96);

    const hudTex = new THREE.CanvasTexture(hudCanvas);
    const hudMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.45), new THREE.MeshBasicMaterial({ map: hudTex, side: THREE.DoubleSide }));
    hudMesh.position.set(0, 0.9, 0.1);
    this.hazardGroup.add(hudMesh);
    this.gasHudMesh = hudMesh;

    // 4. Amber Warning Pulse Light
    const gasLight = new THREE.PointLight(0xf59e0b, 2.5, 6);
    gasLight.position.set(0, 0.5, 0);
    this.hazardGroup.add(gasLight);
    this.gasLight = gasLight;

    this.hazardGroup.position.copy(pos);
    this.scene.add(this.hazardGroup);

    this.gasSystem = {
      isActive: true,
      update: (delta) => {
        if (!this.gasJetParticles || !this.gasSystem.isActive) return;
        const positions = this.gasJetParticles.geometry.attributes.position.array;
        for (let i = 0; i < jetCount; i++) {
          const d = this.gasJetData[i];
          d.life += delta;
          if (d.life > d.maxLife) {
            d.life = 0;
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0.2;
            positions[i * 3 + 2] = -0.2;
          } else {
            positions[i * 3] += d.vx * delta;
            positions[i * 3 + 1] += d.vy * delta;
            positions[i * 3 + 2] += d.vz * delta;
          }
        }
        this.gasJetParticles.geometry.attributes.position.needsUpdate = true;
      },
      isolate: () => {
        this.gasSystem.isActive = false;
        if (this.gasJetParticles) this.gasJetParticles.visible = false;
        if (this.gasLight) this.gasLight.color.setHex(0x10b981);
        if (this.dangerRing) this.dangerRing.material.color.setHex(0x10b981);
      }
    };
  }

  // ==========================================
  // MODULE 3: MACHINERY SAFETY
  // ==========================================
  buildMachineryHazard(pos) {
    this.hazardGroup = new THREE.Group();

    // 1. Continuous Miner Rotating Cutter Drum
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.8, 24), drumMat);
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0, 0.2, -0.3);
    this.hazardGroup.add(drum);
    this.cutterDrum = drum;

    // Tungsten carbide cutter picks along drum circumference
    const pickMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 20; i++) {
      const pick = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), pickMat);
      const angle = (i / 20) * Math.PI * 2;
      pick.position.set((i % 5 - 2) * 0.35, 0.2 + Math.sin(angle) * 0.46, -0.3 + Math.cos(angle) * 0.46);
      pick.rotation.x = angle;
      this.hazardGroup.add(pick);
    }

    // Machine Boom Arms & Tracks
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 1.2), frameMat);
    armL.position.set(-0.8, 0.1, -0.9);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 1.2), frameMat);
    armR.position.set(0.8, 0.1, -0.9);
    this.hazardGroup.add(armL, armR);

    // 2. 1.5m Clearance Danger Zone (Rotating holographic warning cylinder)
    const dangerGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.05, 32);
    const dangerMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const clearanceZone = new THREE.Mesh(dangerGeo, dangerMat);
    clearanceZone.position.set(0, -0.5, -0.3);
    this.hazardGroup.add(clearanceZone);
    this.clearanceZone = clearanceZone;

    // 3. Damaged 3.3kV Trailing Cable with Electrical Arcing Sparks
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.1, -0.52, 0.6),
      new THREE.Vector3(-0.3, -0.54, 0.1),
      new THREE.Vector3(0.4, -0.52, -0.1),
      new THREE.Vector3(1.2, -0.55, -0.5)
    ]);
    const cableMesh = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 32, 0.045, 8, false), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    this.hazardGroup.add(cableMesh);

    // Electrical Spark Particle System
    const sparkCount = 60;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);
    this.sparkData = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = -0.3;
      sparkPos[i * 3 + 1] = -0.52;
      sparkPos[i * 3 + 2] = 0.1;

      sparkColors[i * 3] = 0.4;
      sparkColors[i * 3 + 1] = 0.8;
      sparkColors[i * 3 + 2] = 1.0;

      this.sparkData.push({
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.8,
        vz: (Math.random() - 0.5) * 1.5,
        life: Math.random()
      });
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.14,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    this.sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    this.hazardGroup.add(this.sparkParticles);

    // Cyan electrical flash light
    const sparkLight = new THREE.PointLight(0x38bdf8, 3.0, 4);
    sparkLight.position.set(-0.3, -0.4, 0.1);
    this.hazardGroup.add(sparkLight);
    this.sparkLight = sparkLight;

    // 4. Gate-End Section Breaker Box & LOTO Stand
    const breakerBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x0369a1 }));
    breakerBox.position.set(1.0, 0.1, 0.5);
    this.hazardGroup.add(breakerBox);

    const padlock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    padlock.position.set(0.9, 0.15, 0.62);
    this.hazardGroup.add(padlock);
    this.padlock = padlock;

    this.hazardGroup.position.copy(pos);
    this.scene.add(this.hazardGroup);

    this.machinerySystem = {
      isOperating: true,
      rotationSpeed: 6.0,
      update: (delta) => {
        if (!this.machinerySystem) return;
        if (this.cutterDrum && this.machinerySystem.isOperating) {
          this.cutterDrum.rotation.x += this.machinerySystem.rotationSpeed * delta;
        }
        if (this.sparkParticles && this.machinerySystem.isOperating) {
          const positions = this.sparkParticles.geometry.attributes.position.array;
          for (let i = 0; i < sparkCount; i++) {
            const d = this.sparkData[i];
            d.life += delta;
            if (d.life > 0.4) {
              d.life = 0;
              positions[i * 3] = -0.3;
              positions[i * 3 + 1] = -0.52;
              positions[i * 3 + 2] = 0.1;
            } else {
              positions[i * 3] += d.vx * delta;
              positions[i * 3 + 1] += d.vy * delta;
              positions[i * 3 + 2] += d.vz * delta;
            }
          }
          this.sparkParticles.geometry.attributes.position.needsUpdate = true;
          if (this.sparkLight) {
            this.sparkLight.intensity = Math.random() > 0.4 ? 3.5 : 0.2;
          }
        }
      },
      isolate: () => {
        this.machinerySystem.isOperating = false;
        if (this.sparkParticles) this.sparkParticles.visible = false;
        if (this.sparkLight) this.sparkLight.intensity = 0;
        if (this.clearanceZone) this.clearanceZone.material.color.setHex(0x10b981);
        if (this.dangerRing) this.dangerRing.material.color.setHex(0x10b981);
      }
    };
  }

  // ==========================================
  // MODULE 4: EMERGENCY EVACUATION
  // ==========================================
  buildEvacuationHazard(pos) {
    this.hazardGroup = new THREE.Group();

    // 1. Spatially Anchored Escape Route Directional Chevrons on Floor
    this.chevrons = [];
    const chevronMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });

    for (let z = 0.8; z >= -3.2; z -= 0.8) {
      const cGroup = new THREE.Group();
      const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.35), chevronMat);
      leftBar.rotation.y = Math.PI / 4;
      leftBar.position.set(-0.12, 0, 0);
      const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.35), chevronMat);
      rightBar.rotation.y = -Math.PI / 4;
      rightBar.position.set(0.12, 0, 0);
      cGroup.add(leftBar, rightBar);
      cGroup.position.set(0.3, -0.56, z);
      this.hazardGroup.add(cGroup);
      this.chevrons.push(cGroup);
    }

    // 2. Tactile Escape Lifeline with Directional Cones pointing toward Intake
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 4.5, 8), wireMat);
    wire.rotation.x = Math.PI / 2;
    wire.position.set(0.8, -0.1, -1.2);
    this.hazardGroup.add(wire);

    const coneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    for (let z = 0.5; z >= -3.0; z -= 0.9) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 12), coneMat);
      cone.rotation.x = -Math.PI / 2; // Pointing forward into intake
      cone.position.set(0.8, -0.1, z);
      this.hazardGroup.add(cone);
    }

    // 3. Unsafe Airway Danger Cordon on Left (Contaminated zone)
    const unsafeGeo = new THREE.PlaneGeometry(1.2, 3.5);
    const unsafeMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const unsafeZone = new THREE.Mesh(unsafeGeo, unsafeMat);
    unsafeZone.rotation.x = -Math.PI / 2;
    unsafeZone.position.set(-0.9, -0.55, -1.2);
    this.hazardGroup.add(unsafeZone);

    // Unsafe route warning sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256; signCanvas.height = 96;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = 'rgba(220, 38, 38, 0.95)';
    sctx.fillRect(0, 0, 256, 96);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 18px sans-serif';
    sctx.fillText('⛔ UNSAFE AIRWAY', 20, 36);
    sctx.font = '13px sans-serif';
    sctx.fillText('SMOKE CONTAMINATED', 20, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    signMesh.position.set(-0.9, 0.2, -0.4);
    this.hazardGroup.add(signMesh);

    // 4. Safe Area Portal: Refuge Chamber Air-Lock Door & Green Beacon
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.15), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    doorFrame.position.set(0.3, 0.4, -3.4);
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.08), new THREE.MeshStandardMaterial({ color: 0x059669 }));
    doorLeaf.position.set(0.3, 0.4, -3.4);
    this.hazardGroup.add(doorFrame, doorLeaf);
    this.evacDoor = doorLeaf;

    const refugeSign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.04), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    refugeSign.position.set(0.3, 1.35, -3.35);
    this.hazardGroup.add(refugeSign);

    const greenBeacon = new THREE.PointLight(0x10b981, 2.5, 6);
    greenBeacon.position.set(0.3, 1.35, -3.0);
    this.hazardGroup.add(greenBeacon);

    this.hazardGroup.position.copy(pos);
    this.scene.add(this.hazardGroup);

    this.evacSystem = {
      update: (time) => {
        if (!this.chevrons) return;
        this.chevrons.forEach((c, idx) => {
          const wave = Math.sin(time * 5 - idx * 0.8);
          c.scale.set(1.0 + wave * 0.15, 1.0, 1.0 + wave * 0.15);
        });
      },
      complete: () => {
        if (this.dangerRing) this.dangerRing.material.color.setHex(0x10b981);
      }
    };
  }

  // ==========================================
  // MODULE 5: STRATA CONTROL & ROOF SUPPORT
  // ==========================================
  buildRoofStrataHazard(pos) {
    this.hazardGroup = new THREE.Group();

    // 1. Fractured Sandstone Overhead Roof Strata
    const strataMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.95 });
    const strataSlab = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 2.6), strataMat);
    strataSlab.position.set(0, 1.25, 0);
    this.hazardGroup.add(strataSlab);

    // Stress Fissure Veins (Glowing red/amber crack indicating strata stress)
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const crack1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.03, 0.06), crackMat);
    crack1.position.set(0, 1.08, 0.1);
    this.hazardGroup.add(crack1);
    this.strataCrack = crack1;

    // 2. Real-Time Falling Rock Particle Simulation
    const rockCount = 28;
    this.rockParticles = [];
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });

    for (let i = 0; i < rockCount; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04 + Math.random() * 0.04, 0), rockMat);
      rock.position.set((Math.random() - 0.5) * 1.8, 1.05, (Math.random() - 0.5) * 0.6);
      this.hazardGroup.add(rock);
      this.rockParticles.push({
        mesh: rock,
        vy: -0.2 - Math.random() * 0.4,
        startY: 1.05,
        floorY: -0.55 + Math.random() * 0.04,
        isResting: Math.random() > 0.6
      });
    }

    // 3. Hydraulic Roof Support Props
    const propMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.7 });
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });

    const createProp = (x, z) => {
      const p = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.9, 16), propMat);
      base.position.y = -0.15;
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16), pistonMat);
      piston.position.y = 0.6;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.25), propMat);
      cap.position.y = 1.05;
      p.add(base, piston, cap);
      p.position.set(x, 0, z);
      return p;
    };

    this.hazardGroup.add(createProp(-1.1, -0.4));
    this.hazardGroup.add(createProp(1.1, -0.4));

    // 4. 3m Danger Stand-Off Boundary Cordon
    const postMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), postMat);
    postL.position.set(-1.2, -0.2, 0.8);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), postMat);
    postR.position.set(1.2, -0.2, 0.8);
    this.hazardGroup.add(postL, postR);
    this.strataPostL = postL;
    this.strataPostR = postR;

    this.hazardGroup.position.copy(pos);
    this.scene.add(this.hazardGroup);

    this.strataSystem = {
      isFalling: true,
      update: (delta) => {
        if (!this.strataSystem.isFalling) return;
        this.rockParticles.forEach(r => {
          if (!r.isResting) {
            r.mesh.position.y += r.vy * delta * 2.5;
            if (r.mesh.position.y <= r.floorY) {
              r.mesh.position.y = r.floorY;
              r.isResting = true;
              setTimeout(() => {
                r.mesh.position.y = r.startY;
                r.mesh.position.x = (Math.random() - 0.5) * 1.8;
                r.isResting = false;
              }, 1200 + Math.random() * 2000);
            }
          }
        });
        if (this.strataCrack) {
          const pulse = Math.sin(Date.now() * 0.006) * 0.5 + 0.5;
          this.strataCrack.material.color.setRGB(0.9, 0.2 * pulse, 0.2 * pulse);
        }
      },
      secure: () => {
        this.strataSystem.isFalling = false;
        if (this.strataCrack) this.strataCrack.material.color.setHex(0x10b981);
        if (this.strataPostL) this.strataPostL.material.color.setHex(0x10b981);
        if (this.strataPostR) this.strataPostR.material.color.setHex(0x10b981);
        if (this.dangerRing) this.dangerRing.material.color.setHex(0x10b981);
      }
    };
  }

  // ----------------- PASS ANIMATIONS (MODULE 1) ----------------- //
  animatePullPin() {
    this.passState.pinPulled = true;
    if (this.extinguisherParts.pin) {
      const pin = this.extinguisherParts.pin;
      let step = 0;
      const slide = () => {
        step++;
        pin.position.x += 0.02;
        pin.rotation.z += 0.1;
        if (step < 12) {
          requestAnimationFrame(slide);
        } else {
          pin.visible = false;
        }
      };
      slide();
    }
  }

  animateAim() {
    this.passState.aimed = true;
    if (this.extinguisherGroup && this.extinguisherParts.nozzle) {
      this.extinguisherGroup.rotation.set(0.25, -0.35, 0.08);
      this.extinguisherGroup.position.set(0.20, -0.28, -0.70);
      this.extinguisherParts.nozzle.rotation.x = 0.2;
    }
  }

  animateSqueeze() {
    this.passState.squeezing = true;
    if (this.extinguisherParts.lever) {
      this.extinguisherParts.lever.rotation.z = -0.15;
    }
    if (this.fireSystem) {
      this.fireSystem.startDCPDischarge(new THREE.Vector3(0.2, -0.3, -0.7), this.hazardPosition);
    }
    playExtinguisherHiss();
  }

  animateSweep(progress = 0) {
    this.passState.sweeping = true;
    if (this.extinguisherGroup) {
      const sweepOffset = Math.sin(progress * Math.PI * 6) * 0.12;
      this.extinguisherGroup.position.x = 0.20 + sweepOffset;
      this.extinguisherGroup.rotation.y = -0.35 + sweepOffset * 1.5;
    }
  }

  shrinkFire(amount = 0.25) {
    if (this.fireSystem) {
      this.fireSystem.reduceIntensity(amount);
    }
  }

  extinguishCompletely() {
    if (this.fireSystem) {
      this.fireSystem.extinguishCompletely();
    }
    if (this.dangerRing) {
      this.dangerRing.material.color.setHex(0x10b981);
    }
    if (this.extinguisherParts.lever) {
      this.extinguisherParts.lever.rotation.z = 0;
    }
    this.passState.sweeping = false;
    stopMineSiren();
    stopCombustionRoar();
  }

  // ----------------- CAMERA & FALLBACK SIMULATION ----------------- //
  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.video.srcObject = this.mediaStream;
      await this.video.play();
      this.isFallbackMode = false;
      return true;
    } catch (err) {
      console.warn('[AREngine] Camera stream unavailable:', err);
      return false;
    }
  }

  engageFallbackSimulation() {
    this.isFallbackMode = true;
    this.isSurfaceLocked = true;
    this.trackingMode = 'SIMULATION / ROTATION FALLBACK';
    document.getElementById('ar-viewport-container')?.classList.add('gallery-simulation-active');

    if (this.reticleGroup) this.reticleGroup.visible = false;

    // Build 3D Underground Coal Seam Environment
    this.galleryMeshGroup = new THREE.Group();

    // 1. Coal Gallery Walls
    const tunnelGeo = new THREE.CylinderGeometry(2.4, 2.4, 12, 16, 1, true, -Math.PI * 0.5, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.position.set(0, 0.4, -4);
    this.galleryMeshGroup.add(tunnel);

    // 2. Timber Roof Support Props
    for (let z = -5; z <= -1; z += 1.8) {
      const propMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const propL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), propMat);
      propL.position.set(-1.4, 0.4, z);
      const propR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), propMat);
      propR.position.set(1.4, 0.4, z);
      this.galleryMeshGroup.add(propL, propR);
    }

    // 3. Overhead Ventilation Duct
    const ductGeo = new THREE.CylinderGeometry(0.35, 0.35, 10, 16);
    const ductMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.rotation.x = Math.PI / 2;
    duct.position.set(1.2, 1.2, -4);
    this.galleryMeshGroup.add(duct);

    this.scene.add(this.galleryMeshGroup);
  }

  toggleFallbackMode() {
    if (this.isFallbackMode) {
      this.startCamera().then(success => {
        if (success) {
          if (this.galleryMeshGroup) this.galleryMeshGroup.visible = false;
          document.getElementById('ar-viewport-container')?.classList.remove('gallery-simulation-active');
          this.isFallbackMode = false;
        }
      });
    } else {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
      }
      this.engageFallbackSimulation();
      if (this.galleryMeshGroup) this.galleryMeshGroup.visible = true;
    }
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Pulse Reticle if not locked
    if (this.reticleGroup && !this.isSurfaceLocked) {
      const s = 1.0 + Math.sin(elapsedTime * 4) * 0.08;
      this.reticleGroup.scale.set(s, s, s);
      this.reticleGroup.rotation.y = elapsedTime * 0.5;
    }

    // Update Fire & Smoke Particles
    if (this.fireSystem) {
      this.fireSystem.update(delta);
    }

    // Update Scenario Systems
    if (this.gasSystem) {
      this.gasSystem.update(delta);
    }
    if (this.machinerySystem) {
      this.machinerySystem.update(delta);
    }
    if (this.evacSystem) {
      this.evacSystem.update(elapsedTime);
    }
    if (this.strataSystem) {
      this.strataSystem.update(delta);
    }

    // Flicker Fire Light
    if (this.redFireLight) {
      this.redFireLight.intensity = (2.2 + Math.sin(elapsedTime * 15) * 0.5) * (this.fireSystem ? this.fireSystem.fireIntensity : 1.0);
    }

    // Pulse Hazard Perimeter Ring
    if (this.dangerRing) {
      const s = 1.0 + Math.sin(elapsedTime * 4) * 0.04;
      this.dangerRing.scale.set(s, s, s);
    }

    // Continuous sweep oscillation
    if (this.passState.sweeping && this.fireSystem && !this.fireSystem.isExtinguished) {
      this.passState.sweepAngle += delta * 4;
      this.animateSweep(this.passState.sweepAngle);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    stopScenarioAlarm();

    if (this.fireSystem) {
      this.fireSystem.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
