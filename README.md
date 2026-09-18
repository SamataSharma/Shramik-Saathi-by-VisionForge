# VisionForge - MineAR (Shramik Saathi) ⛏️🛡️

> **SIH Problem Statement SIH26041**: Vocational Safety Training & Emergency Response Simulator for Underground Coal Mines.  
> **Statutory Compliance**: Fully compliant with the **Directorate General of Mines Safety (DGMS)** guidelines and **Coal Mines Regulations 2017 (CMR 2017)** (Dhanbad, Jharia, Bokaro Coalfields).

---

## 📌 Project Overview

**VisionForge - MineAR (Shramik Saathi)** is an offline-first, Augmented Reality (AR) vocational safety training simulator designed specifically for underground coal mine workers and safety supervisors. The system combines realistic 3D hazard simulations, interactive gamified safety drills, trilingual voice/text coaching, and automated statutory certificate issuance with QR verification.

---

## ✨ Key Features

### 🥽 1. Underground Coal Mine AR Simulations
Simulates real-world hazardous underground coal mining scenarios with step-by-step procedural evaluation:
- **Conveyor Belt Fire & Dust Explosion Response**: PASS Extinguisher deployment, upwind intake airway positioning, and power isolation.
- **Methane Gas Leak & Confined Space Safety**: Multi-gas detector operation, CH₄ alarm response (1.35% threshold), and electrical isolation.
- **Continuous Miner & Machinery LOTO**: 3.3kV cable safety, gate-end box Lockout/Tagout (LOTO), and boom clearance verification (<1.5m).
- **Emergency Mine Evacuation & Lifeline Navigation**: SCSR (Self-Contained Self-Rescuer) donning, airlock crossing, and tactile escapeway lifeline navigation.
- **Strata Spalling & Roof Fall Prevention**: Sound-and-tap testing, drummy strata identification, and prop support installation.

---

### 🎮 2. Interactive Safety Training Games & Activities
- **7 Visual Safety Challenges**: Hazard Hunt, Airway Navigation, PASS Protocol Speed Drills, Cable Isolation, and Gas Testing.
- **Instant Diagnostic Feedback**: Statutory explanations for incorrect choices to reinforce proper safety doctrine.
- **Gamified Progression**: Worker XP, level titles (*Mining Trainee*, *Miner Grade II*, *Safety Specialist*, *Mine Rescue Master*), and achievement badges.

---

### 📜 3. Statutory DGMS Digital Certificates & QR Verification
- **Automated Generation**: Automatically issued upon worker reaching the benchmark competency threshold (70%+ score).
- **Formal White Paper Certificate Layout**: Professional white-background certificate featuring DGMS emblem, worker details, completed safety levels, completion/issue dates, final score, and digital verification seal.
- **Unique Non-Guessable Certificate ID**: Cryptographically secure reference (e.g. `CERT-DGMS-2026-8941`) and SHA-256 hash.
- **QR Code Verification**: Large QR code linking directly to the public verification endpoint (`/#verify/{certificate_id}`).
- **Public Verification Portal**: Accessible without login to validate certificate authenticity (`VALID`, `REVOKED`, `INVALID`, or `NOT_FOUND`).
- **PDF Export**: Single-click **"Download Certificate (PDF)"** action.

---

### 🛡️ 4. Supervisor Control Center & Analytics
- **Roster Management**: Tracks all 6 trainee profiles with competency scores, activity history, and retraining status.
- **Mandatory Retraining Assignment**: Supervisors can assign targeted retraining modules for low-performing safety pillars.
- **Certificate Authority Control**: Supervisors can issue, reissue, or revoke statutory certificates with audit trail logging.
- **Statutory Audit Log**: Immutable record of all logins, drill attempts, retraining assignments, and certificate operations.

---

### 🌐 5. Trilingual Localization
Built-in instant language switching for regional coalfield workforces:
- **English**
- **Hindi (हिन्दी)**
- **Santali (ᱥᱟᱱᱛᱟᱲᱤ)**

---

### 📶 6. Offline-First Architecture
- **Local Storage**: Complete app operation using IndexedDB and LocalStorage when underground without cellular/Wi-Fi connection.
- **Pending Sync Management**: Offline drill completions and certificates are marked as `PENDING_SYNC` locally and automatically synchronized with the FastAPI backend when connectivity returns.

---

## 🏗️ Project Architecture

```
final sih vision fordge/
├── android/                          # Native Android Studio Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/www/           # Bundled PWA Web Assets (HTML, CSS, JS)
│   │   │   ├── java/org/visionforge/minear/MainActivity.java  # WebView Container
│   │   │   ├── res/                  # Mipmap App Icons & Styles
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle              # App Module Gradle Configuration
│   └── build.gradle                  # Root Gradle Build File
├── app/                              # Primary Frontend Web Application Source
│   ├── assets/                       # Images, SVG Icons, 3D Assets, Videos
│   ├── css/                          # Application Stylesheets (main.css, ar.css, dashboard.css)
│   ├── js/
│   │   ├── app.js                    # Main Entry Controller & State Manager
│   │   ├── router.js                 # Hash Router & Access Control
│   │   ├── i18n.js                   # Trilingual Localization Engine
│   │   ├── db.js                     # IndexedDB Offline Storage
│   │   ├── sync.js                   # Cloud Data Sync Manager
│   │   └── screens/                  # Screen View Controllers
│   │       ├── home.js               # Worker Dashboard
│   │       ├── login.js              # Portal Login Screen
│   │       ├── supervisor.js         # Supervisor Control Center
│   │       ├── certificate-view.js   # White Paper Certificate & PDF Downloader
│   │       ├── verify.js             # Public QR Verification Portal
│   │       ├── ar-sim.js             # 3D Three.js AR Simulator
│   │       ├── games.js              # Training Games
│   │       └── ...
│   └── index.html                    # PWA Shell Entry Point
├── backend/                          # Python FastAPI Backend Server
│   ├── server.py                     # REST API Endpoints & Auth Rules
│   ├── database.py                   # SQLite/PostgreSQL Database & Seeding
│   └── models.py                     # Pydantic Data Schemas
├── build_apk.py                      # Standalone Python Build & Signing Script
├── run.py                            # FastAPI Backend Launcher
├── MineAR-v2.0-debug.apk             # Output Debug APK
└── MineAR-v2.0-release.apk           # Output Signed Release APK
```

---

## 🔑 Demo Credentials & Accounts

| Account Role | Username | Password | Profile Description |
| :--- | :--- | :--- | :--- |
| **Worker Trainee** | `anik01` | `mine123` | Anik Mondol — Underground Conveyor Belt Operator |
| **Worker Trainee** | `sahnik01` | `mine123` | Sahnik Barui — Electrical Technician |
| **Worker Trainee** | `abhay01` | `mine123` | Abhay — Mine Rescue Brigade Captain |
| **Worker Trainee** | `arkdip01` | `mine123` | Arkadip Ghosh — Ventilation Safety Officer |
| **Worker Trainee** | `samata01` | `mine123` | Samata Sharma — Senior Continuous Miner Operator |
| **Worker Trainee** | `shambhavi01` | `mine123` | Shambhavi — Haulage & Trimming Attendant |
| **Safety Supervisor** | `supervisor01` | `admin123` | Er. R. K. Verma — Director of Mine Safety (DGMS Dhanbad) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Java JDK 17+ / Android Studio JBR**
- **Android SDK (API Level 34 / 36)**

---

### 2. Running the Backend & Web Application
To start the FastAPI backend server and launch the web interface locally:

```bash
python3 run.py
```
- **Web App URL**: `http://127.0.0.1:8000`
- **Interactive API Docs**: `http://127.0.0.1:8000/docs`

---

### 3. Building the Android APK

#### Option A: Building with Gradle
```bash
cd android
./gradlew assembleDebug assembleRelease
```

#### Option B: Standalone Build Script
```bash
python3 build_apk.py
```

Outputs generated in workspace root:
- [`MineAR-v2.0-debug.apk`](file:///Users/sahnikbarui/Downloads/final%20sih%20vision%20fordge/MineAR-v2.0-debug.apk)
- [`MineAR-v2.0-release.apk`](file:///Users/sahnikbarui/Downloads/final%20sih%20vision%20fordge/MineAR-v2.0-release.apk)

---

## 🔒 Security & Privacy Features

1. **Token Reference in QR Codes**: QR codes contain only reference URLs (`/#verify/{certificate_id}`), ensuring private personal information is never directly encoded inside the image.
2. **Role-Based Authorization**: Supervisor functions (certificate issuance, revocation, retraining assignment) enforce bearer session verification server-side.
3. **Backend Competency Validation**: The backend independently verifies that worker completion scores meet statutory thresholds before issuing a valid certificate.
4. **Immutable Audit Logs**: All statutory actions are recorded in the audit trail.

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH26041)** — *VisionForge Team*.  
Compliant with **Directorate General of Mines Safety (DGMS)** standards and **Coal Mines Regulations 2017 (CMR 2017)**.
