// WebXR & Three.js AR Engine with Surface Detection, 3D Conveyor Hazard, 3D DCP Extinguisher & PASS Animations

import { ParticleFireSystem } from './particle-fire.js';
import { startMineSiren, stopMineSiren, playCombustionRoar, stopCombustionRoar, playExtinguisherHiss } from '../voice.js';

export class AREngine {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fireSystem = null;
    this.animFrameId = null;
    this.mediaStream = null;
    this.isFallbackMode = false;
    this.isSurfaceLocked = false;
    this.hazardPosition = new THREE.Vector3(0, -0.6, -2.5);

    // Three.js Groups
    this.reticleGroup = null;
    this.conveyorGroup = null;
    this.extinguisherGroup = null;
    this.galleryMeshGroup = null;

    // Extinguisher Parts for Animation
    this.extinguisherParts = {
      body: null,
      lever: null,
      pin: null,
      nozzle: null,
      gaugeNeedle: null
    };

    // State of PASS
    this.passState = {
      pinPulled: false,
      aimed: false,
      squeezing: false,
      sweeping: false,
      sweepAngle: 0
    };

    this.dangerRing = null;
    this.clock = new THREE.Clock();
  }

  async initialize() {
    this.setupThreeScene();

    // Try starting live camera stream
    const cameraSuccess = await this.startCamera();
    if (!cameraSuccess) {
      console.log('[AREngine] Camera stream unavailable. Engaging 3D Mine Gallery Simulation mode.');
      this.engageFallbackSimulation();
    } else {
      // In AR mode, show surface scanning reticle until locked
      this.buildSurfaceReticle();
    }

    // Build 3D Conveyor Hazard
    this.buildConveyorHazard(this.hazardPosition);

    // Build 3D DCP Extinguisher Model (IS 2171 compliant)
    this.buildExtinguisherModel();

    // Start Procedural Fire & Smoke
    this.fireSystem = new ParticleFireSystem(this.scene);
    this.fireSystem.setAnchorPosition(this.hazardPosition);

    // Start Auditory Stressors (DGMS Siren + Combustion rumble)
    startMineSiren();
    playCombustionRoar();

    // Start render loop
    this.animate();

    return {
      isFallback: this.isFallbackMode,
      isSurfaceLocked: this.isSurfaceLocked
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Key Directional Light
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(2, 4, 2);
    this.scene.add(dirLight);

    // Tactical Fire Point Light
    const redFireLight = new THREE.PointLight(0xff4500, 2.5, 8);
    redFireLight.position.copy(this.hazardPosition).add(new THREE.Vector3(0, 0.2, 0));
    this.scene.add(redFireLight);
    this.redFireLight = redFireLight;

    // Animated Hazard Boundary Ring on floor
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

  buildSurfaceReticle() {
    this.reticleGroup = new THREE.Group();

    // Outer scanning ring
    const outerGeo = new THREE.RingGeometry(0.55, 0.6, 32);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const outerRing = new THREE.Mesh(outerGeo, outerMat);
    outerRing.rotation.x = -Math.PI / 2;
    this.reticleGroup.add(outerRing);

    // Inner target circle
    const innerGeo = new THREE.CircleGeometry(0.08, 16);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
    const innerCircle = new THREE.Mesh(innerGeo, innerMat);
    innerCircle.rotation.x = -Math.PI / 2;
    this.reticleGroup.add(innerCircle);

    // Crosshairs
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const pts = [
      new THREE.Vector3(-0.7, 0, 0), new THREE.Vector3(-0.15, 0, 0),
      new THREE.Vector3(0.15, 0, 0), new THREE.Vector3(0.7, 0, 0),
      new THREE.Vector3(0, 0, -0.7), new THREE.Vector3(0, 0, -0.15),
      new THREE.Vector3(0, 0, 0.15), new THREE.Vector3(0, 0, 0.7)
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const crosshair = new THREE.LineSegments(lineGeo, lineMat);
    this.reticleGroup.add(crosshair);

    this.reticleGroup.position.copy(this.hazardPosition);
    this.scene.add(this.reticleGroup);
  }

  lockSurface(newPos = null) {
    if (newPos) {
      this.hazardPosition.copy(newPos);
    }
    this.isSurfaceLocked = true;

    if (this.reticleGroup) {
      this.reticleGroup.visible = false;
    }

    // Anchor Conveyor, Fire & Danger Ring to locked position
    if (this.conveyorGroup) {
      this.conveyorGroup.position.copy(this.hazardPosition);
      this.conveyorGroup.visible = true;
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
  }

  buildConveyorHazard(pos) {
    this.conveyorGroup = new THREE.Group();

    // 1. Heavy Steel Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const sideBeam1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 4.0), frameMat);
    sideBeam1.position.set(-0.55, 0, 0);
    const sideBeam2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 4.0), frameMat);
    sideBeam2.position.set(0.55, 0, 0);
    this.conveyorGroup.add(sideBeam1, sideBeam2);

    // Legs / Support Stanchions
    for (let z = -1.8; z <= 1.8; z += 1.2) {
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), frameMat);
      leg1.position.set(-0.55, -0.2, z);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), frameMat);
      leg2.position.set(0.55, -0.2, z);
      this.conveyorGroup.add(leg1, leg2);
    }

    // 2. Rubber Conveyor Belt (Trough shape)
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 4.0), beltMat);
    belt.position.set(0, 0.08, 0);
    this.conveyorGroup.add(belt);

    // 3. Electric Drive Motor & Head Pulley at Drive End
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

    // 4. Coal Chunks / Slag Pile on Belt
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
    for (let i = 0; i < 12; i++) {
      const lump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06, 0), coalMat);
      lump.position.set((Math.random() - 0.5) * 0.5, 0.14, (Math.random() - 0.5) * 1.5);
      lump.rotation.set(Math.random(), Math.random(), Math.random());
      this.conveyorGroup.add(lump);
    }

    // 5. Smoldering Friction Point (Red Hot Glow mesh under fire)
    const hotSpotMat = new THREE.MeshBasicMaterial({ color: 0xff3b00 });
    const hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 16), hotSpotMat);
    hotSpot.position.set(0, 0.11, 0);
    this.conveyorGroup.add(hotSpot);

    this.conveyorGroup.position.copy(pos);
    this.scene.add(this.conveyorGroup);
  }

  buildExtinguisherModel() {
    this.extinguisherGroup = new THREE.Group();

    // 1. Red Cylinder Body (IS 2171 DCP 6kg)
    const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.46, 24);
    const cylinderMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Vivid Fire Red
      metalness: 0.35,
      roughness: 0.25
    });
    const body = new THREE.Mesh(cylinderGeo, cylinderMat);
    body.position.set(0, 0, 0);
    this.extinguisherGroup.add(body);
    this.extinguisherParts.body = body;

    // Bottom Base Boot
    const bootGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.06, 24);
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const boot = new THREE.Mesh(bootGeo, bootMat);
    boot.position.set(0, -0.22, 0);
    this.extinguisherGroup.add(boot);

    // Domed Top
    const domeGeo = new THREE.SphereGeometry(0.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, cylinderMat);
    dome.position.set(0, 0.23, 0);
    this.extinguisherGroup.add(dome);

    // 2. DGMS Technical Label / Decal on Cylinder
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 128;
    const lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = '#ffffff';
    lctx.fillRect(0, 0, 256, 128);
    lctx.fillStyle = '#0f172a';
    lctx.font = 'bold 24px sans-serif';
    lctx.fillText('MINE AR - DCP', 18, 36);
    lctx.fillStyle = '#dc2626';
    lctx.font = 'bold 18px sans-serif';
    lctx.fillText('IS: 2171 (6 KG)', 18, 64);
    lctx.fillStyle = '#475569';
    lctx.font = '14px sans-serif';
    lctx.fillText('CLASS A • B • C • E', 18, 92);
    lctx.fillStyle = '#15803d';
    lctx.font = 'bold 13px sans-serif';
    lctx.fillText('✓ DGMS APPROVED', 18, 114);

    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelGeo = new THREE.CylinderGeometry(0.102, 0.102, 0.22, 24, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0.02, 0);
    this.extinguisherGroup.add(labelMesh);

    // 3. Brass / Chrome Valve Assembly Neck
    const neckGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.08, 16);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.set(0, 0.35, 0);
    this.extinguisherGroup.add(neck);

    // 4. Fixed Lower Carrying Handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5, roughness: 0.5 });
    const handleGeo = new THREE.BoxGeometry(0.14, 0.025, 0.03);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.06, 0.38, 0);
    this.extinguisherGroup.add(handle);

    // 5. Operating Upper Squeeze Lever (Pivots downward on Squeeze)
    const leverGroup = new THREE.Group();
    leverGroup.position.set(0.01, 0.42, 0);
    const leverGeo = new THREE.BoxGeometry(0.14, 0.02, 0.03);
    const lever = new THREE.Mesh(leverGeo, handleMat);
    lever.position.set(0.06, 0, 0);
    leverGroup.add(lever);
    this.extinguisherGroup.add(leverGroup);
    this.extinguisherParts.lever = leverGroup;

    // 6. Safety Pull-Pin with Yellow Tamper Seal Ring
    const pinGroup = new THREE.Group();
    pinGroup.position.set(0, 0.40, 0);
    const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.rotation.z = Math.PI / 2;
    pinGroup.add(pinMesh);

    // Yellow ring
    const ringGeo = new THREE.TorusGeometry(0.025, 0.006, 8, 20);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    const pullRing = new THREE.Mesh(ringGeo, ringMat);
    pullRing.position.set(0.045, 0, 0);
    pinGroup.add(pullRing);

    this.extinguisherGroup.add(pinGroup);
    this.extinguisherParts.pin = pinGroup;

    // 7. Pressure Gauge
    const gaugeGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.015, 20);
    const gaugeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8 });
    const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(-0.04, 0.38, 0.035);

    // Gauge Face (Green Zone)
    const gFaceCanvas = document.createElement('canvas');
    gFaceCanvas.width = 64;
    gFaceCanvas.height = 64;
    const gctx = gFaceCanvas.getContext('2d');
    gctx.fillStyle = '#ffffff';
    gctx.beginPath();
    gctx.arc(32, 32, 30, 0, Math.PI * 2);
    gctx.fill();
    gctx.fillStyle = '#10b981'; // Green operable zone
    gctx.beginPath();
    gctx.arc(32, 32, 28, -Math.PI * 0.7, -Math.PI * 0.3);
    gctx.lineTo(32, 32);
    gctx.fill();
    gctx.strokeStyle = '#ef4444'; // Needle
    gctx.lineWidth = 3;
    gctx.beginPath();
    gctx.moveTo(32, 32);
    gctx.lineTo(32, 10);
    gctx.stroke();

    const gFaceMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gFaceCanvas) });
    const gFace = new THREE.Mesh(new THREE.CircleGeometry(0.025, 20), gFaceMat);
    gFace.position.set(0, 0.009, 0);
    gFace.rotation.x = -Math.PI / 2;
    gauge.add(gFace);
    this.extinguisherGroup.add(gauge);

    // 8. Discharge Hose and Nozzle Horn
    const hoseGroup = new THREE.Group();
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });

    // Flexible curved tube for hose
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.03, 0.36, 0),
      new THREE.Vector3(-0.12, 0.30, 0.05),
      new THREE.Vector3(-0.14, 0.15, 0.08),
      new THREE.Vector3(-0.10, 0.02, 0.12),
      new THREE.Vector3(-0.04, -0.05, 0.22)
    ]);
    const hoseGeo = new THREE.TubeGeometry(curve, 20, 0.014, 8, false);
    const hose = new THREE.Mesh(hoseGeo, hoseMat);
    hoseGroup.add(hose);

    // Flared Nozzle Horn
    const nozzleGeo = new THREE.ConeGeometry(0.03, 0.08, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(-0.04, -0.05, 0.26);
    nozzle.rotation.x = Math.PI / 2 + 0.3; // points slightly downward
    hoseGroup.add(nozzle);
    this.extinguisherGroup.add(hoseGroup);
    this.extinguisherParts.nozzle = hoseGroup;

    // Initial First-Person Screen Placement (lower right viewport)
    this.extinguisherGroup.position.set(0.24, -0.32, -0.75);
    this.extinguisherGroup.rotation.set(0.1, -0.25, 0.05);
    this.scene.add(this.extinguisherGroup);
  }

  // ----------------- INTERACTIVE PASS ANIMATIONS ----------------- //

  animatePullPin() {
    this.passState.pinPulled = true;
    if (this.extinguisherParts.pin) {
      // Smooth slide out to the right then drop
      const pin = this.extinguisherParts.pin;
      let startX = pin.position.x;
      let step = 0;
      const slide = () => {
        step++;
        pin.position.x += 0.02;
        pin.rotation.z += 0.1;
        if (step < 12) {
          requestAnimationFrame(slide);
        } else {
          pin.visible = false; // pin removed & dropped
        }
      };
      slide();
    }
  }

  animateAim() {
    this.passState.aimed = true;
    if (this.extinguisherGroup && this.extinguisherParts.nozzle) {
      // Rotate whole unit & pivot nozzle directly towards the base of the fire
      this.extinguisherGroup.rotation.set(0.25, -0.35, 0.08);
      this.extinguisherGroup.position.set(0.20, -0.28, -0.70);
      this.extinguisherParts.nozzle.rotation.x = 0.2;
    }
  }

  animateSqueeze() {
    this.passState.squeezing = true;
    // Depress top lever
    if (this.extinguisherParts.lever) {
      this.extinguisherParts.lever.rotation.z = -0.15;
    }
    // Start continuous white DCP powder discharge toward fire base
    if (this.fireSystem) {
      this.fireSystem.startDCPDischarge(new THREE.Vector3(0.2, -0.3, -0.7), this.hazardPosition);
    }
    playExtinguisherHiss();
  }

  animateSweep(progress = 0) {
    this.passState.sweeping = true;
    // Oscillate extinguisher and nozzle horizontally across fire base
    if (this.extinguisherGroup) {
      const sweepOffset = Math.sin(progress * Math.PI * 6) * 0.12;
      this.extinguisherGroup.position.x = 0.20 + sweepOffset;
      this.extinguisherGroup.rotation.y = -0.35 + sweepOffset * 1.5;
    }
  }

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
      console.warn('[AREngine] Camera access rejected or failed:', err);
      return false;
    }
  }

  engageFallbackSimulation() {
    this.isFallbackMode = true;
    this.isSurfaceLocked = true;
    document.getElementById('ar-viewport-container')?.classList.add('gallery-simulation-active');

    if (this.reticleGroup) this.reticleGroup.visible = false;

    // Build 3D Underground Coal Seam Environment
    this.galleryMeshGroup = new THREE.Group();

    // 1. Coal Gallery Walls (Dark textured rock/coal)
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

    // 2. Timber Crib / Roof Support Props
    for (let z = -5; z <= -1; z += 1.8) {
      const propMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const propL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), propMat);
      propL.position.set(-1.4, 0.4, z);
      const propR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), propMat);
      propR.position.set(1.4, 0.4, z);
      this.galleryMeshGroup.add(propL, propR);
    }

    // 3. Overhead Ventilation Duct (Flexible Yellow Tubing)
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

    // Update Fire, Smoke & DCP Particles
    if (this.fireSystem) {
      this.fireSystem.update(delta);
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

    // Continuous sweep oscillation if currently sweeping
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
      this.dangerRing.material.color.setHex(0x10b981); // Emerald Green Safe
    }
    if (this.extinguisherParts.lever) {
      this.extinguisherParts.lever.rotation.z = 0; // Release lever
    }
    this.passState.sweeping = false;
    stopMineSiren();
    stopCombustionRoar();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    stopMineSiren();
    stopCombustionRoar();

    if (this.fireSystem) {
      this.fireSystem.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
