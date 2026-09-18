// Three.js Volumetric Particle Fire, Embers, Coal Smoke & Pressurized DCP Chemical Powder Cloud

export class ParticleFireSystem {
  constructor(scene) {
    this.scene = scene;
    this.fireParticles = null;
    this.smokeParticles = null;
    this.dcpParticles = null;
    this.steamParticles = null;
    this.fireIntensity = 1.0;
    this.isExtinguished = false;
    this.isDischargingDCP = false;
    this.anchorPosition = new THREE.Vector3(0, -0.6, -2.5);

    this.initFire();
    this.initSmoke();
    this.initDCPDischarge();
  }

  setAnchorPosition(pos) {
    this.anchorPosition.copy(pos);
    if (this.fireParticles) this.fireParticles.position.copy(this.anchorPosition);
    if (this.smokeParticles) this.smokeParticles.position.copy(this.anchorPosition);
    if (this.dcpParticles) this.dcpParticles.position.set(0, 0, 0); // world coords
  }

  initFire() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    this.fireData = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 0.9;
      const y = Math.random() * 0.4;
      const z = (Math.random() - 0.5) * 0.9;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Vivid Orange/Red core to bright flame yellow
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.6;
      colors[i * 3 + 2] = 0.05;

      sizes[i] = 0.18 + Math.random() * 0.22;

      this.fireData.push({
        baseX: x,
        baseZ: z,
        speedY: 0.9 + Math.random() * 1.6,
        maxHeight: 1.3 + Math.random() * 0.7,
        life: Math.random()
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom glowing particle canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 190, 20, 0.9)');
    grad.addColorStop(0.65, 'rgba(255, 50, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.28,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this.fireParticles = new THREE.Points(geometry, material);
    this.fireParticles.position.copy(this.anchorPosition);
    this.scene.add(this.fireParticles);
  }

  initSmoke() {
    const smokeCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(smokeCount * 3);
    const colors = new Float32Array(smokeCount * 3);

    this.smokeData = [];

    for (let i = 0; i < smokeCount; i++) {
      const x = (Math.random() - 0.5) * 0.7;
      const y = 0.4 + Math.random() * 1.6;
      const z = (Math.random() - 0.5) * 0.7;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Dark gray coal combustion soot
      const gray = 0.12 + Math.random() * 0.14;
      colors[i * 3] = gray;
      colors[i * 3 + 1] = gray;
      colors[i * 3 + 2] = gray;

      this.smokeData.push({
        baseX: x,
        baseZ: z,
        speedY: 0.5 + Math.random() * 0.7,
        driftX: (Math.random() - 0.5) * 0.3,
        life: Math.random()
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.4,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      vertexColors: true
    });

    this.smokeParticles = new THREE.Points(geometry, material);
    this.smokeParticles.position.copy(this.anchorPosition);
    this.scene.add(this.smokeParticles);
  }

  initDCPDischarge() {
    // White / pale bluish-white Sodium Bicarbonate / MAP chemical powder cloud
    const dcpCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dcpCount * 3);
    const colors = new Float32Array(dcpCount * 3);

    this.dcpData = [];

    for (let i = 0; i < dcpCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // start hidden
      positions[i * 3 + 2] = 0;

      colors[i * 3] = 0.95;
      colors[i * 3 + 1] = 0.97;
      colors[i * 3 + 2] = 1.0;

      this.dcpData.push({
        active: false,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        startX: 0.25,
        startY: -0.25,
        startZ: -0.6,
        targetX: 0,
        targetY: -0.5,
        targetZ: -2.4,
        velSpreadX: (Math.random() - 0.5) * 0.4,
        velSpreadY: (Math.random() - 0.5) * 0.3,
        velSpreadZ: (Math.random() - 0.5) * 0.4
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Soft powder cloud texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.4, 'rgba(240, 245, 255, 0.6)');
    grad.addColorStop(1, 'rgba(230, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      vertexColors: true
    });

    this.dcpParticles = new THREE.Points(geometry, material);
    this.dcpParticles.visible = false;
    this.scene.add(this.dcpParticles);
  }

  startDCPDischarge(nozzlePos, targetPos) {
    this.isDischargingDCP = true;
    if (this.dcpParticles) {
      this.dcpParticles.visible = true;
      this.dcpParticles.material.opacity = 0.85;
    }
  }

  stopDCPDischarge() {
    this.isDischargingDCP = false;
    if (this.dcpParticles) {
      // fade out
      this.dcpParticles.visible = false;
    }
  }

  update(delta = 0.016) {
    if (this.isExtinguished) {
      if (this.fireParticles) this.fireParticles.visible = false;
      if (this.smokeParticles) {
        this.smokeParticles.material.opacity = Math.max(0, this.smokeParticles.material.opacity - 0.015);
      }
    } else {
      // Update Fire
      if (this.fireParticles) {
        const pos = this.fireParticles.geometry.attributes.position.array;
        for (let i = 0; i < this.fireData.length; i++) {
          const d = this.fireData[i];
          d.life += delta * d.speedY;
          if (d.life > 1.0) {
            d.life = 0;
            pos[i * 3] = d.baseX * this.fireIntensity;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = d.baseZ * this.fireIntensity;
          } else {
            pos[i * 3 + 1] = d.life * d.maxHeight * this.fireIntensity;
            pos[i * 3] += (Math.sin(d.life * 10) * 0.01) * this.fireIntensity;
          }
        }
        this.fireParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Update Smoke
      if (this.smokeParticles) {
        const pos = this.smokeParticles.geometry.attributes.position.array;
        for (let i = 0; i < this.smokeData.length; i++) {
          const s = this.smokeData[i];
          pos[i * 3 + 1] += delta * s.speedY;
          pos[i * 3] += delta * s.driftX;
          if (pos[i * 3 + 1] > 2.8) {
            pos[i * 3 + 1] = 0.4 * this.fireIntensity;
            pos[i * 3] = s.baseX;
          }
        }
        this.smokeParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update Pressurized DCP Powder Stream
    if (this.dcpParticles && (this.isDischargingDCP || this.dcpParticles.visible)) {
      const pos = this.dcpParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.dcpData.length; i++) {
        const p = this.dcpData[i];
        if (this.isDischargingDCP) {
          p.life += delta;
          if (p.life > p.maxLife) {
            p.life = 0;
          }
          const t = p.life / p.maxLife; // 0 to 1
          // Lerp from nozzle to fire base with widening cone
          const curX = THREE.MathUtils.lerp(0.22, this.anchorPosition.x, t) + p.velSpreadX * t * 1.5;
          const curY = THREE.MathUtils.lerp(-0.25, this.anchorPosition.y + 0.1, t) + p.velSpreadY * t * 1.2;
          const curZ = THREE.MathUtils.lerp(-0.6, this.anchorPosition.z, t) + p.velSpreadZ * t * 1.5;

          pos[i * 3] = curX;
          pos[i * 3 + 1] = curY;
          pos[i * 3 + 2] = curZ;
        } else {
          pos[i * 3 + 1] = -100;
        }
      }
      this.dcpParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  reduceIntensity(amount = 0.25) {
    this.fireIntensity = Math.max(0, this.fireIntensity - amount);
    if (this.fireIntensity <= 0.05) {
      this.extinguishCompletely();
    }
  }

  extinguishCompletely() {
    this.fireIntensity = 0;
    this.isExtinguished = true;
    this.stopDCPDischarge();
  }

  dispose() {
    if (this.fireParticles) {
      this.scene.remove(this.fireParticles);
      this.fireParticles.geometry.dispose();
      this.fireParticles.material.dispose();
    }
    if (this.smokeParticles) {
      this.scene.remove(this.smokeParticles);
      this.smokeParticles.geometry.dispose();
      this.smokeParticles.material.dispose();
    }
    if (this.dcpParticles) {
      this.scene.remove(this.dcpParticles);
      this.dcpParticles.geometry.dispose();
      this.dcpParticles.material.dispose();
    }
  }
}
