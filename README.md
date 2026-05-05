# 🌌 Kinetic Ether: Luminous Energy Management

**Kinetic Ether** is a state-of-the-art energy management system designed for the futuristic utility grid. It reimagines static, mechanical interfaces as a fluid, luminous dashboard where data is treated as "captured light."

Built for the **CodeQuest Hackathon**, Kinetic Ether combines real-time hardware telemetry, Kaggle-driven simulations, and AI-powered analytics into a premium, interactive experience.

![Kinetic Ether Dashboard](https://raw.githubusercontent.com/shreyash398/Codequest-hackathon-/main/ref%20images/dashboard_preview.png)

## ✨ Core Features

### 🔋 Real-Time Telemetry & Hardware Sync
- **Live Monitoring**: Track Solar Generation, Grid Load, and Battery Storage with sub-second latency.
- **Hardware Integration**: Synchronized with real smart-meter hardware via **Firebase Realtime Database**.

### 🤖 AI Anomaly Detection & Forecasting
- **Thermal Leakage Identification**: Intelligent detection of energy waste using sliding-window baseline models.
- **Predictive Forecasting**: 24-hour consumption predictions based on historical trends and environmental factors.
- **Efficiency Scoring**: Real-time health scoring of the energy grid vs. predicted baselines.

### 🌿 Intelligent Control Center
- **Eco-Mode Optimization**: Dynamic power throttling and peak-shaving to minimize carbon footprint and grid strain.
- **Remote Management**: Granular control over appliances (HVAC, Lighting, EV Charging, Production Lines).
- **Anomaly Injection**: Interactive testing mode to simulate grid failures and thermal leaks for system validation.

### 📊 Advanced Analytics
- **D3.js Energy Mix**: Interactive sunburst/radial visualizations for multi-source energy distribution.
- **Plotly Flow Analysis**: Sankey-style energy flow diagrams and high-performance time-series charts.
- **Weekly Performance**: Comparative analysis of generation vs. consumption trends.

### 💬 Neural Chat Interface
- **AI Assistant**: Query system status, get savings tips, and control the grid using natural language.
- **Actionable Insights**: Personalized recommendations for reducing energy waste and lowering costs.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, D3.js, Plotly |
| **Backend** | Flask (Python 3.11), Gunicorn, Threaded Firebase Sync |
| **Database** | SQLite (Telemetry Logging), InfluxDB (Optional Time-Series) |
| **Design** | Kinetic Ether Glassmorphism (Vanilla CSS + Tonal Layering) |
| **Deployment** | Docker, Docker Compose, Vercel Serverless |

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **Docker** (Optional, for containerized setup)

### Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shreyash398/Codequest-hackathon-.git
   cd Codequest-hackathon-
   ```

2. **Backend Setup**:
   ```bash
   # Create and activate virtual environment
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Start the Flask server
   python app.py
   ```
   *The API will be available at [http://localhost:5000](http://localhost:5000)*

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The Dashboard will be live at [http://localhost:5173](http://localhost:5173)*

### Docker Quickstart
Launch the full stack (Backend + InfluxDB + Frontend) in one command:
```bash
docker-compose up --build
```

---

## 📐 Design Philosophy

The system follows the **"Kinetic Ether" Design Specification**:
- **No-Line Rule**: Boundaries are defined by background color shifts and tonal layering rather than borders.
- **Glassmorphism**: Translucent panels with backdrop blurs (24px) mimic captured light within glass.
- **Luminous Spectrum**: High-chroma energy signals (Electric Blue, Neon Green, Vibrant Purple) against a deep space void background (`#02040a`).
- **Tactile Motion**: Every interaction triggers a subtle luminescence shift or fluid transition.

---

## 📂 Project Structure

```
Codequest-hackathon-/
├── app.py              # Flask API Entry Point
├── generator.py        # AI Simulation & Telemetry Engine
├── telemetry.db        # SQLite Local Storage
├── frontend/
│   ├── src/
│   │   ├── components/ # D3 & Plotly Visualizations
│   │   ├── pages/      # Dashboard & Control Center
│   │   └── index.css   # Kinetic Ether Design Tokens
│   └── vite.config.js
└── Dockerfile          # Multi-stage Container Build
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

Built with ⚡ by the **Kinetic Ether Team** for **CodeQuest 2026**.

