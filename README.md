# 🌌 Kinetic Ether: Luminous Energy Management

**Kinetic Ether** is a state-of-the-art energy management system designed for the futuristic utility grid. It moves away from static, mechanical interfaces into a fluid, luminous dashboard where data is treated as "captured light."

![Kinetic Ether Dashboard](file:///C:/Users/hp/.gemini/antigravity/brain/504cd8ec-92d3-4884-9146-53e58d706392/localhost_initial_load_1775936183332.png)

## ✨ Features

-   **🔋 Real-Time Monitoring**: Live telemetry of Solar Generation, Grid Load, and Battery Storage Status.
-   **🤖 AI Anomaly Detection**: Intelligent identification of energy waste and thermal leakage using sliding-window machine learning models.
-   **🌿 Eco-Mode Optimization**: Dynamic power throttling and peak-shaving to minimize carbon footprint and grid strain.
-   **📊 Advanced Analytics**: High-performance D3.js and Plotly visualizations for deep energy flow analysis.
-   **⚡ Control Center**: Remote appliance management (HVAC, Production Lines, Data Centers) with simulated anomaly injection for testing.
-   **🧪 Simulation Engine**: Drives dashboard data using real smart-meter datasets from Kaggle.

## 🛠️ Technology Stack

-   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion (Animations), D3.js, Plotly.
-   **Backend**: Flask (Python), Gunicorn (Production), SQLite (Telemetry Logging).
-   **Deployment**: Docker, Docker Compose, Vercel Serverless.

## 🚀 Getting Started

### Prerequisites

-   Python 3.11+
-   Node.js 18+
-   Docker (Optional, for containerized setup)

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shreyash398/Codequest-hackathon-.git
    cd Codequest-hackathon-
    ```

2.  **Start the Backend**:
    ```bash
    pip install -r requirements.txt
    python app.py
    ```
    *Backend will run on [http://localhost:5000](http://localhost:5000)*

3.  **Start the Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Frontend will run on [http://localhost:5173](http://localhost:5173)*

### Docker Deployment

To launch the full system (including InfluxDB and the Backend) via Docker:
```bash
docker-compose up --build
```

## 📐 Design Philosophy

The system follows the **"Kinetic Ether" Design Specification**:
-   **No-Line Rule**: Boundaries are defined by background color shifts and tonal layering rather than borders.
-   **Glassmorphism**: Translucent panels with backdrop blurs (24px) mimic captured light within glass.
-   **Luminous Spectrum**: High-chroma energy signals (Electric Blue, Neon Green, Vibrant Purple) against a deep space void background.

---

Built for **CodeQuest Hackathon**.
