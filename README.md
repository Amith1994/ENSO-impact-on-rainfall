# 🗺️ ENSO & IOD Climate Explorer: Karnataka Spatial Analysis

> **An interactive climatological explorer for analyzing El Niño–Southern Oscillation (ENSO) and Indian Ocean Dipole (IOD) impacts across Karnataka's districts (1951–2020) alongside a Real-Time Climate Events Timeline for the current year.**

[![Live Demo](https://img.shields.io/badge/Live%20App-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://amith1994.github.io/enso-iod-karnataka-rainfall/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Amith1994/enso-iod-karnataka-rainfall)

---

## 🌟 Key Features

### 1. 🗺️ Interactive District Spatial Map
- **30 District Vector SVG Map**: Fully interactive map of Karnataka with dynamic hover tooltips, zoom controls (`+`, `−`, `⟳`), and color-coded rainfall deviation fills.
- **Regional Filters**: Filter by **Coastal Karnataka**, **North Interior (NIK)**, **South Interior (SIK)**, and **Malnad Region**.
- **Time Resolutions**: Switch across **SW Monsoon (Jun–Sep)**, **NE Monsoon (Oct–Dec)**, **Annual Total**, **Summer**, **Winter**, or any individual month (Jan–Dec).
- **Metric Toggle**: Switch between **% Deviation** and **Rainfall (mm)**.

### 2. ⚡ 3 Selection Matrices
- **🔥 ENSO Intensity Phases (9)**: Weak, Moderate, Strong El Niño | Weak, Moderate, Strong La Niña | Neutral Baseline | All El Niño Combined | All La Niña Combined.
- **⚡ 9-Coupled ENSO + IOD Combinations**: El Niño + Positive/Neutral/Negative IOD | La Niña + Positive/Neutral/Negative IOD | Neutral + Positive/Neutral/Negative IOD.
- **🌴 IOD Phases (3)**: Positive IOD, Negative IOD, Neutral IOD.

### 3. 📊 Year-wise Historical Time Series Graph
- Interactive Chart.js graph displaying historical event rainfall years plotted against the **Baseline Normal Line (mm)** with automated deviation calculations on tooltip hover.

### 4. 🌊 Ocean Circulation Mechanism Schematic
- SVG diagram visualizing sea surface temperature (SST) thermal anomalies and Walker circulation couplings across the Pacific (ENSO) and Indian Ocean (IOD).

### 5. 📋 Climatological Breakdown Table & Formula Banner
- Detailed breakdown table comparing **Normal Baseline (mm)** vs **Event Rainfall (mm)**, **Deviation (%)**, and **Impact Assessment** for all seasons and months.
- Styled **% Departure Formula** display:

$$\% \text{Departure} = \left( \frac{\text{Actual Rainfall} - \text{Normal Rainfall}}{\text{Normal Rainfall}} \right) \times 100$$

### 6. 📋 Executive Phase Impact Summary Banner
- Dynamically generated summary providing:
  - 🇮🇳 **Karnataka Statewide Summary**: Total rainfall vs normal baseline & official impact classification.
  - 🗺️ **Regional Performance**: Individual `% deviation` for Coastal, NIK, SIK, and Malnad regions.
  - 📍 **District Highlights**: Top surplus districts, most severe deficit districts, and count distribution (Excess / Normal / Deficit).

### 7. 🌏 Real-Time Climate Events Timeline (Current Year)
- Month-wise timeline monitoring key climate drivers for the Indian monsoon:
  - **ENSO Phase**, **ONI Index**, **Niño 3.4 SST**
  - **IOD Phase**, **DMI Index**
  - **MJO Phase & Amplitude**
  - **Arabian Sea & Bay of Bengal SST Anomalies**, **PDO**, **QBO**
  - **Monsoon Onset Status** & **Active / Break Spells**
  - **Cyclone Activity** (LPS, Depressions, Cyclonic Storms) & **Extreme Events** (Heatwaves, Coldwaves, WDs)
  - **IMD Seasonal Outlooks** & **NOAA CPC live data integration**
- **🔮 4-Card Assessment & Forecast Summary**:
  - Active ENSO & IOD Phase State (with explicit badges)
  - Monsoon Progress & Onset Status
  - Net Impact on Karnataka
  - **Forecast Probabilities**: Current Month, Next Month, and Next Season (NE Monsoon)

---

## 📡 Data Sources & Attribution

Data compiled from trusted meteorological research institutes and climate centers:
- 🇮🇳 **IMD** — India Meteorological Department
- 📡 **NOAA CPC** — Climate Prediction Center (Oceanic Niño Index)
- 🌊 **NOAA PSL** — Physical Sciences Laboratory
- 🇦🇺 **BoM** — Bureau of Meteorology, Australia
- 🔬 **IITM** — Indian Institute of Tropical Meteorology, Pune
- 🌍 **ECMWF** — European Centre for Medium-Range Weather Forecasts (Copernicus)
- 🌊 **JAMSTEC** — Japan Agency for Marine-Earth Science and Technology

---

## 🚀 Getting Started

### Prerequisites
A modern web browser (Chrome, Firefox, Edge, Safari). No backend or database installation required.

### Local Installation & Preview

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Amith1994/enso-iod-karnataka-rainfall.git
   cd enso-iod-karnataka-rainfall
   ```

2. **Serve the Application**:
   Using `npx serve`:
   ```bash
   npx serve .
   ```
   Or using Python:
   ```bash
   python -m http.server 3000
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

---

## 📁 Repository File Structure

```
enso-iod-karnataka-rainfall/
├── index.html                  # Main application HTML structure
├── style.css                   # Custom Vanilla CSS design system
├── app.js                      # Main logic engine, map renderer & dynamic summaries
├── climate_timeline.js         # Real-Time Climate Events Timeline engine
├── karnataka_svg.js            # District vector SVG paths & centroids
├── enso_iod_karnataka_data.json# Climatological dataset (1951–2020)
├── .gitignore                  # Git ignore configuration
└── README.md                   # Project documentation
```

---

## 👤 Author

**Amith Naik (Amith1994)**
- GitHub: [@Amith1994](https://github.com/Amith1994)
- Live Dashboard: [amith1994.github.io/enso-iod-karnataka-rainfall](https://amith1994.github.io/enso-iod-karnataka-rainfall/)
