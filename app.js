// ENSO & IOD Climatological Explorer - Main Logic Engine

// Educational Descriptions for Intensity Phases & Combinations
const EVENT_DESCRIPTIONS = {
  "Weak El Niño": {
    title: "Weak El Niño Phase (13 Years)",
    body: "Climatological study of 13 Weak El Niño years (1951, 1953, 1963, 1968, 1969, 1976, 1977, 1979, 1994, 2004, 2006, 2014, 2018). Weak Pacific warming often leads to localized rainfall deficits across South Interior and North Interior Karnataka."
  },
  "Moderate El Niño": {
    title: "Moderate El Niño Phase (7 Years)",
    body: "Climatological study of 7 Moderate El Niño years (1957, 1965, 1972, 1987, 1991, 2002, 2009). Moderate El Niño events significantly weaken the South-West Monsoon winds, resulting in widespread agricultural drought."
  },
  "Strong El Niño": {
    title: "Strong El Niño Phase (3 Major Events)",
    body: "Study of major historical events (1982, 1997, 2015). Intense Pacific warming shifts global circulation. Noticeably, 1997 was cushioned by a co-occurring Positive IOD, whereas 1982 & 2015 caused severe monsoon shortfalls."
  },
  "Weak La Niña": {
    title: "Weak La Niña Phase (12 Years)",
    body: "Study of 12 Weak La Niña years (1954, 1964, 1971, 1974, 1983, 1984, 1995, 2000, 2005, 2008, 2016, 2017). Weak La Niña usually supports near-normal to slightly excess monsoon rainfall across Coastal & Malnad regions."
  },
  "Moderate La Niña": {
    title: "Moderate La Niña Phase (10 Years)",
    body: "Study of 10 Moderate La Niña years (1955, 1970, 1973, 1988, 1998, 1999, 2007, 2010, 2011, 2020). Strong moisture convergence typically boosts post-monsoon (NEMS) rainfall in South Interior Karnataka."
  },
  "Strong La Niña": {
    title: "Strong La Niña Phase (3 Major Events)",
    body: "Study of major La Niña events (1950, 1975, 1989). Enhanced Pacific trade winds and cold upwelling drive heavy monsoon rains across peninsular India."
  },
  "Neutral": {
    title: "Neutral Baseline Phase (23 Years)",
    body: "Analysis of 23 Neutral baseline years (1952, 1956, 1958, 1959, 1960, 1961, 1962, 1966, 1967, 1978, 1980, 1981, 1985, 1986, 1990, 1992, 1993, 1996, 2001, 2003, 2012, 2013, 2019)."
  },
  "El Niño": {
    title: "All El Niño Events Combined",
    body: "Aggregate study of all 23 El Niño years across Weak, Moderate, and Strong intensities."
  },
  "La Niña": {
    title: "All La Niña Events Combined",
    body: "Aggregate study of all 25 La Niña years across Weak, Moderate, and Strong intensities."
  },
  "Positive": {
    title: "Positive IOD Phase",
    body: "Climatological study of Positive Indian Ocean Dipole (IOD) events. Warm SST anomalies in the western Indian Ocean enhance moisture transport towards peninsular India."
  },
  "Negative": {
    title: "Negative IOD Phase",
    body: "Climatological study of Negative Indian Ocean Dipole (IOD) events. Cool SST anomalies in the western Indian Ocean tend to reduce moisture transport over peninsular India."
  }
};

// Phase accent colors (matching CSS badges)
const PHASE_COLORS = {
  'Weak El Niño':    { color: '#d97706', bg: '#fef3c7' },
  'Moderate El Niño':{ color: '#ea580c', bg: '#ffedd5' },
  'Strong El Niño':  { color: '#dc2626', bg: '#fee2e2' },
  'El Niño':         { color: '#b91c1c', bg: '#fce7e7' },
  'Weak La Niña':    { color: '#0d9488', bg: '#ccfbf1' },
  'Moderate La Niña':{ color: '#059669', bg: '#d1fae5' },
  'Strong La Niña':  { color: '#0284c7', bg: '#e0f2fe' },
  'La Niña':         { color: '#047857', bg: '#d1fae5' },
  'Neutral':         { color: '#7c3aed', bg: '#ede9fe' },
  'El Niño + Positive IOD': { color: '#f59e0b', bg: '#fef9c3' },
  'El Niño + Neutral IOD':  { color: '#ef4444', bg: '#fee2e2' },
  'El Niño + Negative IOD': { color: '#a855f7', bg: '#f3e8ff' },
  'La Niña + Positive IOD': { color: '#06b6d4', bg: '#cffafe' },
  'La Niña + Neutral IOD':  { color: '#10b981', bg: '#dcfce7' },
  'La Niña + Negative IOD': { color: '#3b82f6', bg: '#dbeafe' },
  'Neutral + Positive IOD': { color: '#84cc16', bg: '#f7fee7' },
  'Neutral + Neutral IOD':  { color: '#6b7280', bg: '#f1f5f9' },
  'Neutral + Negative IOD': { color: '#f97316', bg: '#fff7ed' },
  'Positive': { color: '#0ea5e9', bg: '#e0f2fe' },
  'Negative': { color: '#db2777', bg: '#fce7f3' },
};

function getPhaseColor(event) {
  return PHASE_COLORS[event] || { color: '#1e40af', bg: '#eff6ff' };
}

let appData = null;
let state = {
  mode: 'intensity',
  event: 'Strong El Niño',
  season: 'SWMS',
  region: 'ALL',
  metric: 'dev',
  district: null
};

let yearwiseChart = null;
let mapZoomLevel = 1;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.ENSO_DATA) {
      appData = window.ENSO_DATA;
    } else {
      const res = await fetch('enso_iod_karnataka_data.json');
      appData = await res.json();
    }
    console.log('Enriched dataset loaded:', Object.keys(appData).length, 'locations');

    initMap();
    initEventListeners();
    initZoomControls();
    updateUI();
  } catch (err) {
    console.error('Error loading dataset:', err);
  }
});

// Zoom Controls
function initZoomControls() {
  const map = document.getElementById('karnataka-map');
  document.getElementById('zoom-in-btn').addEventListener('click', () => {
    mapZoomLevel = Math.min(mapZoomLevel + 0.25, 4);
    map.style.transform = `scale(${mapZoomLevel})`;
  });
  document.getElementById('zoom-out-btn').addEventListener('click', () => {
    mapZoomLevel = Math.max(mapZoomLevel - 0.25, 0.5);
    map.style.transform = `scale(${mapZoomLevel})`;
  });
  document.getElementById('zoom-reset-btn').addEventListener('click', () => {
    mapZoomLevel = 1;
    map.style.transform = 'scale(1)';
  });
}

// Render SVG Karnataka Map
function initMap() {
  const svgMap = document.getElementById('karnataka-map');
  svgMap.innerHTML = `<defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>`;

  const mapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  mapGroup.setAttribute('id', 'map-district-group');

  for (const [distName, distInfo] of Object.entries(KARNATAKA_DISTRICT_SVG)) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', distInfo.path);
    path.setAttribute('class', 'district-path');
    path.setAttribute('data-district', distName);
    path.setAttribute('data-region', distInfo.region);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', distInfo.centroid[0]);
    text.setAttribute('y', distInfo.centroid[1]);
    text.setAttribute('class', 'district-label');
    text.textContent = getShortName(distName);

    path.addEventListener('mouseenter', (e) => showTooltip(e, distName));
    path.addEventListener('mousemove', (e) => moveTooltip(e));
    path.addEventListener('mouseleave', () => hideTooltip());
    path.addEventListener('click', () => selectDistrict(distName));

    mapGroup.appendChild(path);
    mapGroup.appendChild(text);
  }

  svgMap.appendChild(mapGroup);
}

function getShortName(name) {
  const map = {
    'Bangalore rural': 'BLR R',
    'Bangalore urban': 'BLR U',
    'chamarajanagara': 'Ch.Ngr',
    'Dakshina Kannada': 'DK',
    'Uttara kannada': 'UK',
    'Chikkamaga': 'Chikmaglur',
    'Vijayapura': 'Vijayapur',
    'Shivamogga': 'Shimoga',
    'Belagavi': 'Belgaum',
    'Kalburgi': 'Gulbarga'
  };
  return map[name] || name;
}

// Event Listeners
function initEventListeners() {
  // Mode pills
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;

      const intensityContainer = document.getElementById('intensity-matrix-container');
      const comboContainer = document.getElementById('combo-matrix-container');
      const singleContainer = document.getElementById('single-event-container');

      intensityContainer.classList.add('hidden');
      comboContainer.classList.add('hidden');
      singleContainer.classList.add('hidden');

      // Clear all active matrix-btns across all containers to prevent duplicate active styles
      document.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('active'));

      if (state.mode === 'intensity') {
        intensityContainer.classList.remove('hidden');
        state.event = 'Strong El Niño';
        // re-activate first btn
        intensityContainer.querySelector('.btn-strong-el')?.classList.add('active');
      } else if (state.mode === 'combo') {
        comboContainer.classList.remove('hidden');
        state.event = 'El Niño + Positive IOD';
        comboContainer.querySelectorAll('.matrix-btn')[0]?.classList.add('active');
      } else {
        singleContainer.classList.remove('hidden');
        state.event = 'Positive';
        singleContainer.querySelectorAll('.matrix-btn')[0]?.classList.add('active');
      }
      updateUI();
    });
  });

  // Matrix Event buttons
  document.querySelectorAll('.matrix-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.matrix-container') || btn.closest('.single-event-container');
      if (parent) {
        parent.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');
      state.event = btn.dataset.event;
      updateUI();
    });
  });

  // Season & Month dropdown selector
  document.getElementById('season-select').addEventListener('change', (e) => {
    state.season = e.target.value;
    updateUI();
  });

  // Region chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.region = chip.dataset.region;
      updateUI();
    });
  });

  // Metric toggle
  document.querySelectorAll('.toggle-btn').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      t.classList.add('active');
      state.metric = t.dataset.metric;
      updateUI();
    });
  });

  // Reset district button
  document.getElementById('reset-district-btn').addEventListener('click', () => {
    selectDistrict(null);
  });
}

// Master UI Update Engine
function updateUI() {
  if (!appData) return;

  updateMapColors();
  updateHeaderStats();
  updateRegionalSummaries();
  updateOceanSchematic();
  updateEduCard();
  updateYearwiseChart();
  updateDetailTable();
  updatePhaseSummary();
}

function updateMapColors() {
  const paths = document.querySelectorAll('.district-path');
  paths.forEach(path => {
    const distName = path.dataset.district;
    const distRegion = path.dataset.region;

    if (state.region !== 'ALL' && distRegion !== state.region) {
      path.style.opacity = '0.22';
    } else {
      path.style.opacity = '1.0';
    }

    if (state.district === distName) {
      path.classList.add('selected');
    } else {
      path.classList.remove('selected');
    }

    const dData = getDistrictData(distName);
    if (dData) {
      path.style.fill = getColorForDev(dData.dev);
    } else {
      path.style.fill = '#334155';
    }
  });
}

function getColorForDev(dev) {
  if (dev <= -20) return '#dc2626'; // Severe Deficit (Red)
  if (dev <= -10) return '#f97316'; // Deficit (Orange)
  if (dev <= 10) return '#10b981';  // Normal (Emerald Green)
  if (dev <= 20) return '#06b6d4';  // Excess (Cyan)
  return '#2563eb';                 // High Excess (Deep Blue)
}

function getEventDataObject(locData, mode, event) {
  if (!locData) return null;
  const primaryModeKey = mode === 'intensity' ? 'intensity' : (mode === 'combo' ? 'combo' : (mode === 'enso' ? 'enso' : 'iod'));

  // 1. Primary mode lookup
  if (locData[primaryModeKey]?.[event]) {
    return locData[primaryModeKey][event];
  }
  // 2. Fallbacks for cross-mode event keys like "El Niño" / "La Niña" (stored in 'enso')
  if (locData['enso']?.[event]) return locData['enso'][event];
  if (locData['intensity']?.[event]) return locData['intensity'][event];
  if (locData['iod']?.[event]) return locData['iod'][event];
  if (locData['combo']?.[event]) return locData['combo'][event];

  return null;
}

function getDistrictData(distName) {
  const locData = appData[distName];
  if (!locData) return null;

  const eventObj = getEventDataObject(locData, state.mode, state.event);
  const timeObj = eventObj?.[state.season];
  const normVal = locData.normal?.[state.season] || 0;

  if (timeObj) {
    return {
      rf: timeObj.rf,
      dev: timeObj.dev,
      norm: normVal,
      count: timeObj.count,
      years: timeObj.years || [],
      year_vals: timeObj.year_vals || {}
    };
  }
  return null;
}

// Tooltip engine
function showTooltip(e, distName) {
  const tooltip = document.getElementById('map-tooltip');
  const dData = getDistrictData(distName);
  const distInfo = KARNATAKA_DISTRICT_SVG[distName];

  document.getElementById('tt-district').textContent = distName;
  document.getElementById('tt-region').textContent = distInfo?.region || 'Karnataka';

  if (dData) {
    document.getElementById('tt-normal').textContent = `${dData.norm} mm`;
    document.getElementById('tt-event').textContent = `${dData.rf} mm`;
    const devElem = document.getElementById('tt-dev');
    devElem.textContent = `${dData.dev >= 0 ? '+' : ''}${dData.dev}%`;
    devElem.style.color = getColorForDev(dData.dev);
  }

  tooltip.classList.remove('hidden');
  moveTooltip(e);
}

function moveTooltip(e) {
  const tooltip = document.getElementById('map-tooltip');
  const wrapper = document.querySelector('.svg-map-wrapper').getBoundingClientRect();
  const x = e.clientX - wrapper.left;
  const y = e.clientY - wrapper.top;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip() {
  document.getElementById('map-tooltip').classList.add('hidden');
}

function selectDistrict(distName) {
  state.district = distName;
  const resetBtn = document.getElementById('reset-district-btn');

  if (distName) {
    resetBtn.classList.remove('hidden');
  } else {
    resetBtn.classList.add('hidden');
  }

  updateMapColors();
  updateYearwiseChart();
  updateDetailTable();
}

function updateHeaderStats() {
  const target = getTargetLocation();
  const targetDisplay = getTargetLocationDisplay(target);
  const stateData = getDistrictData(target);

  const avgElem = document.getElementById('state-avg-val');
  const normElem = document.getElementById('state-norm-val');
  const avgLbl = document.getElementById('state-avg-lbl');

  let eventDisplay = state.event;
  if (state.mode === 'iod' || state.event === 'Positive' || state.event === 'Negative' || state.event === 'Neutral') {
    eventDisplay = `${state.event} IOD`;
  }

  // Dynamic stat label based on selection (District vs Region vs State) & metric
  if (avgLbl) {
    if (state.district) {
      avgLbl.textContent = `${getShortName(state.district)} ${state.metric === 'dev' ? 'Dev' : 'Rainfall'}`;
    } else if (state.region !== 'ALL') {
      const regName = REGION_DISPLAY_NAMES[state.region] || state.region;
      avgLbl.textContent = `${regName} ${state.metric === 'dev' ? 'Avg' : 'Rainfall'}`;
    } else {
      avgLbl.textContent = state.metric === 'dev' ? 'State Avg' : 'State Rainfall';
    }
  }

  if (stateData) {
    if (state.metric === 'dev') {
      avgElem.textContent = `${stateData.dev >= 0 ? '+' : ''}${stateData.dev}%`;
      avgElem.className = `stat-val ${stateData.dev >= 0 ? 'positive' : 'negative'}`;
      avgElem.style.color = '';
    } else {
      avgElem.textContent = `${stateData.rf} mm`;
      avgElem.className = 'stat-val';
      avgElem.style.color = '#38bdf8'; // clear bright sky blue
    }
    normElem.textContent = `${stateData.norm} mm`;
  } else {
    avgElem.textContent = '--';
    avgElem.className = 'stat-val';
    normElem.textContent = '-- mm';
  }

  const metricTitle = state.metric === 'dev' ? 'Rainfall Deviation (%)' : 'Actual Rainfall (mm)';
  document.getElementById('map-card-subtitle').textContent =
    `Spatial ${state.season} ${metricTitle} during ${eventDisplay} (${targetDisplay})`;

  // Update Map Legend Label
  const legendLabel = document.querySelector('.map-legend .legend-label');
  if (legendLabel) {
    legendLabel.textContent = state.metric === 'dev' ? 'Deviation:' : 'Rainfall Category (by Dev):';
  }
}

function updateRegionalSummaries() {
  const regions = [
    { id: 'region-val-coastal', name: 'Costal Kar' },
    { id: 'region-val-nik', name: 'NIK' },
    { id: 'region-val-sik', name: 'SIK' },
    { id: 'region-val-malnad', name: 'Malnad Kar' }
  ];

  regions.forEach(r => {
    const data = getDistrictData(r.name);
    const elem = document.getElementById(r.id);

    // Always reset first — prevents stale values when season/region has no data
    if (!data) {
      elem.textContent = '--';
      elem.style.color = '#a0aec0';
      return;
    }

    if (state.metric === 'dev') {
      elem.textContent = `${data.dev >= 0 ? '+' : ''}${data.dev}%`;
      elem.style.color = getColorForDev(data.dev);
    } else {
      elem.textContent = `${data.rf} mm`;
      elem.style.color = '#38bdf8'; // bright clear blue for mm
    }
  });
}

// Ocean schematic
function updateOceanSchematic() {
  const svg = document.getElementById('ocean-svg');
  let PacificWarm = true;
  let IndianWarmWest = true;

  if (state.event.includes('La Niña')) PacificWarm = false;
  if (state.event.includes('Negative')) IndianWarmWest = false;

  const indWestColor = IndianWarmWest ? '#f43f5e' : '#0284c7';
  const indEastColor = IndianWarmWest ? '#0284c7' : '#f43f5e';
  const pacWestColor = PacificWarm ? '#0284c7' : '#f43f5e';
  const pacEastColor = PacificWarm ? '#f43f5e' : '#0284c7';

  svg.innerHTML = `
    <rect x="20" y="110" width="280" height="60" rx="10" fill="url(#ind-g)" stroke="rgba(255,255,255,0.2)"/>
    <rect x="380" y="110" width="280" height="60" rx="10" fill="url(#pac-g)" stroke="rgba(255,255,255,0.2)"/>

    <defs>
      <linearGradient id="ind-g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${indWestColor}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${indEastColor}" stop-opacity="0.85"/>
      </linearGradient>
      <linearGradient id="pac-g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${pacWestColor}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${pacEastColor}" stop-opacity="0.85"/>
      </linearGradient>
    </defs>

    <text x="160" y="145" fill="#fff" font-size="13" font-weight="700" text-anchor="middle">INDIAN OCEAN (IOD)</text>
    <text x="520" y="145" fill="#fff" font-size="13" font-weight="700" text-anchor="middle">PACIFIC OCEAN (ENSO)</text>

    <path d="M 70 100 C 70 50, 160 30, 250 100" stroke="${IndianWarmWest ? '#38bdf8' : '#f43f5e'}" stroke-width="2.5" fill="none" stroke-dasharray="5,5"/>
    <path d="M 430 100 C 430 50, 520 30, 610 100" stroke="${PacificWarm ? '#f43f5e' : '#38bdf8'}" stroke-width="2.5" fill="none" stroke-dasharray="5,5"/>
  `;
}

function updateEduCard() {
  let eventDisplay = state.event;
  if (state.mode === 'iod' || state.event === 'Positive' || state.event === 'Negative' || state.event === 'Neutral') {
    eventDisplay = `${state.event} IOD Phase`;
  }

  const card = EVENT_DESCRIPTIONS[state.event] || {
    title: `${eventDisplay} Impact Analysis`,
    body: `Evaluating spatial rainfall distribution across Karnataka for ${eventDisplay}.`
  };

  document.getElementById('edu-title').innerHTML = card.title;
  document.getElementById('edu-body').innerHTML = card.body;
}

// YEAR-WISE TIME SERIES GRAPH ENGINE WITH BASELINE NORMAL LINE
function updateYearwiseChart() {
  const ctx = document.getElementById('yearwise-line-chart').getContext('2d');
  const targetLoc = getTargetLocation();
  const targetLocDisplay = getTargetLocationDisplay(targetLoc);

  let eventDisplay = state.event;
  if (state.mode === 'iod' || state.event === 'Positive' || state.event === 'Negative' || state.event === 'Neutral') {
    eventDisplay = `${state.event} IOD`;
  }

  document.getElementById('chart-main-title').textContent = 
    `Year-wise Historical Rainfall (${targetLocDisplay})`;
  document.getElementById('chart-main-subtitle').textContent = 
    `Comparing ${eventDisplay} Years vs Baseline Normal Line for ${state.season}`;

  // Update phase badge with phase color
  const phasePalette = getPhaseColor(state.event);
  const badge = document.getElementById('chart-phase-badge');
  badge.textContent = eventDisplay;
  badge.style.background = phasePalette.bg;
  badge.style.color = phasePalette.color;
  badge.style.borderColor = phasePalette.color;

  const dData = getDistrictData(targetLoc);
  if (!dData) return;

  const years = dData.years || [];
  const yearVals = dData.year_vals || {};
  const normBaseline = dData.norm;

  const labels = years.map(y => y.toString());
  const rfData = years.map(y => yearVals[y] !== undefined ? yearVals[y] : 0);
  const normLineData = years.map(() => normBaseline);

  if (yearwiseChart) {
    yearwiseChart.destroy();
  }

  // Get color from phase palette
  const palette = getPhaseColor(state.event);
  let accentColor = palette.color;

  yearwiseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: `Baseline Normal Line (${normBaseline} mm)`,
          data: normLineData,
          borderColor: '#f43f5e',
          borderWidth: 3,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
          order: 1
        },
        {
          type: 'bar',
          label: `${state.season} Event Rainfall (mm)`,
          data: rfData,
          backgroundColor: accentColor,
          borderColor: accentColor,
          borderWidth: 1,
          borderRadius: 8,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            afterBody: function(context) {
              const val = context[0].parsed.y;
              const dev = roundTwo((val - normBaseline) / normBaseline * 100);
              return `Deviation from Normal: ${dev >= 0 ? '+' : ''}${dev}%`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1', font: { weight: 'bold' } },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: { display: true, text: 'Rainfall (mm)', color: '#94a3b8' }
        }
      }
    }
  });
}

function roundTwo(num) {
  return Math.round(num * 100) / 100;
}

// Resolve which location key to use for data lookup:
// District selection > Region chip > Karnataka state-wide
const REGION_KEY_MAP = {
  'ALL':        'Karnataka',
  'Costal Kar': 'Costal Kar',
  'NIK':        'NIK',
  'SIK':        'SIK',
  'Malnad Kar': 'Malnad Kar'
};

const REGION_DISPLAY_NAMES = {
  'ALL':        'State',
  'Costal Kar': 'Coastal',
  'NIK':        'NIK',
  'SIK':        'SIK',
  'Malnad Kar': 'Malnad'
};

function getTargetLocation() {
  if (state.district) return state.district;
  return REGION_KEY_MAP[state.region] || 'Karnataka';
}

function getTargetLocationDisplay(locKey) {
  const map = {
    'Karnataka': 'State-wide Karnataka',
    'Costal Kar': 'Coastal Karnataka',
    'NIK': 'North Interior Karnataka (NIK)',
    'SIK': 'South Interior Karnataka (SIK)',
    'Malnad Kar': 'Malnad Region'
  };
  return map[locKey] || locKey;
}

// Detail Table Engine
function updateDetailTable() {
  const targetLoc = getTargetLocation();
  const targetLocDisplay = getTargetLocationDisplay(targetLoc);

  let eventDisplay = state.event;
  if (state.mode === 'iod' || state.event === 'Positive' || state.event === 'Negative' || state.event === 'Neutral') {
    eventDisplay = `${state.event} IOD`;
  }

  document.getElementById('detail-district-name').textContent = targetLocDisplay;
  document.getElementById('detail-district-region').textContent = 
    state.district
      ? `District Climatological Breakdown — ${KARNATAKA_DISTRICT_SVG[targetLoc]?.region || 'Karnataka'} | Phase: ${eventDisplay}`
      : `Location Breakdown (${targetLocDisplay}) | Phase: ${eventDisplay}`;

  // Apply phase color to detail card border
  const phasePalette = getPhaseColor(state.event);
  const detailCard = document.getElementById('district-detail-card');
  detailCard.classList.add('phase-accent');
  detailCard.style.setProperty('--active-phase-color', phasePalette.color);

  const tbody = document.getElementById('detail-table-body');
  tbody.innerHTML = '';

  const timeUnits = [
    { key: 'SWMS',   name: '🌧️ SW Monsoon (Jun–Sep)',  isSeason: true },
    { key: 'NEMS',   name: '🍂 NE Monsoon (Oct–Dec)',   isSeason: true },
    { key: 'Annual', name: '📅 Annual Total (Jan–Dec)',  isSeason: true },
    { key: 'Jun',    name: 'June',    isSeason: false },
    { key: 'Jul',    name: 'July',    isSeason: false },
    { key: 'Aug',    name: 'August',  isSeason: false },
    { key: 'Sep',    name: 'September', isSeason: false },
    { key: 'Oct',    name: 'October',   isSeason: false },
    { key: 'Nov',    name: 'November',  isSeason: false },
    { key: 'Dec',    name: 'December',  isSeason: false }
  ];

  const locData = appData[targetLoc];
  if (!locData) return;

  const eventObj = getEventDataObject(locData, state.mode, state.event);

  timeUnits.forEach(tu => {
    const norm = locData.normal?.[tu.key] || 0;
    const timeObj = eventObj?.[tu.key];
    const rf = timeObj?.rf || 0;
    const dev = timeObj?.dev || 0;

    let impactText = 'Normal Rainfall';
    let impactColor = '#16a34a';
    let impactBg = '#f0fdf4';

    if (dev <= -20)      { impactText = '⬇ Severe Deficit';   impactColor = '#dc2626'; impactBg = '#fff1f2'; }
    else if (dev <= -10) { impactText = '↓ Moderate Deficit'; impactColor = '#ea580c'; impactBg = '#fff7ed'; }
    else if (dev >= 20)  { impactText = '⬆ High Excess';      impactColor = '#4f46e5'; impactBg = '#eef2ff'; }
    else if (dev >= 10)  { impactText = '↑ Moderate Excess';  impactColor = '#0284c7'; impactBg = '#f0f9ff'; }

    const tr = document.createElement('tr');
    if (tu.isSeason) tr.classList.add('season-row');

    // Phase color left stripe via inline border-left on first cell
    const phaseStripe = tu.isSeason
      ? `style="border-left: 4px solid ${phasePalette.color}; padding-left: 10px;"`
      : `style="padding-left: 14px;"`;

    tr.innerHTML = `
      <td ${phaseStripe}><strong>${tu.name}</strong></td>
      <td>${norm} mm</td>
      <td><strong>${rf} mm</strong></td>
      <td><strong style="color:${getColorForDev(dev)}">${dev >= 0 ? '+' : ''}${dev}%</strong></td>
      <td><span style="color:${impactColor}; background:${impactBg}; padding:3px 8px; border-radius:5px; font-size:11.5px; font-weight:700;">${impactText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// Executive Phase Impact Summary Engine
function updatePhaseSummary() {
  const banner = document.getElementById('phase-summary-banner');
  if (!banner || !appData) return;

  const activeEvent = state.event;
  const activeSeason = state.season;

  let eventDisplay = activeEvent;
  if (state.mode === 'iod' || activeEvent === 'Positive' || activeEvent === 'Negative' || activeEvent === 'Neutral') {
    eventDisplay = `${activeEvent} IOD Phase`;
  }

  // Title
  document.getElementById('ps-title').innerHTML = 
    `Rainfall Impact Summary — <strong>${eventDisplay}</strong> (${activeSeason})`;

  // 1. Karnataka State-wide
  const karData = getEventDataObject(appData['Karnataka'], state.mode, activeEvent)?.[activeSeason];
  const karNorm = appData['Karnataka']?.normal?.[activeSeason] || 0;

  const stateValEl = document.getElementById('ps-state-val');
  const stateDescEl = document.getElementById('ps-state-desc');

  if (karData) {
    const dev = karData.dev;
    const rf = karData.rf;
    const sign = dev >= 0 ? '+' : '';
    stateValEl.textContent = `${sign}${dev}%`;
    stateValEl.className = `ps-big-val ${dev >= 0 ? 'positive' : 'negative'}`;

    let category = 'Normal Baseline';
    if (dev <= -20)      category = 'Severe Deficit';
    else if (dev <= -10) category = 'Moderate Deficit';
    else if (dev >= 20)  category = 'High Excess';
    else if (dev >= 10)  category = 'Moderate Excess';

    stateDescEl.innerHTML = 
      `Across Karnataka, total ${activeSeason} rainfall averaged <strong>${rf} mm</strong> vs normal baseline of <strong>${karNorm} mm</strong> (${sign}${dev}% deviation). Overall impact is classified as <strong>${category}</strong>.`;
  } else {
    stateValEl.textContent = '--';
    stateDescEl.textContent = 'Data unavailable for selected parameters.';
  }

  // 2. Regional Performance (Coastal, NIK, SIK, Malnad)
  const regions = [
    { key: 'Costal Kar', name: 'Coastal Karnataka', icon: '🏖️' },
    { key: 'NIK',        name: 'North Interior (NIK)', icon: '🌾' },
    { key: 'SIK',        name: 'South Interior (SIK)', icon: '🌇' },
    { key: 'Malnad Kar', name: 'Malnad Region', icon: '⛰️' }
  ];

  const regGridEl = document.getElementById('ps-regions-grid');
  regGridEl.innerHTML = regions.map(r => {
    const rData = getEventDataObject(appData[r.key], state.mode, activeEvent)?.[activeSeason];
    if (!rData) return `<div class="ps-reg-item"><div class="ps-reg-lbl">${r.icon} ${r.name}</div><div class="ps-reg-val">--</div></div>`;
    const dev = rData.dev;
    const color = getColorForDev(dev);
    const sign = dev >= 0 ? '+' : '';
    return `<div class="ps-reg-item">
      <div class="ps-reg-lbl">${r.icon} ${r.name}</div>
      <div class="ps-reg-val" style="color:${color}">${sign}${dev}% <span class="ps-reg-rf">(${rData.rf} mm)</span></div>
    </div>`;
  }).join('');

  // 3. District Highlights (Surplus, Deficit, Counts)
  const distNames = [
    'Bangalore rural','Bangalore urban','Belagavi','Bellary','Bidar','chamarajanagara',
    'Chikkamaga','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag',
    'Hassan','Haveri','Kalburgi','Kodagu','Kolar','Koppal','Mandya','Mysore','Raichur',
    'Ramanagara','Shivamogga','Tumkur','Udupi','Uttara kannada','Vijayapura','Yadgir'
  ];

  let dists = distNames.map(name => {
    const item = getEventDataObject(appData[name], state.mode, activeEvent)?.[activeSeason];
    return { name: getShortName(name), dev: item ? item.dev : 0, rf: item ? item.rf : 0 };
  }).sort((a,b) => b.dev - a.dev);

  const excessDist = dists.filter(d => d.dev > 10);
  const normalDist = dists.filter(d => d.dev >= -10 && d.dev <= 10);
  const deficitDist = dists.filter(d => d.dev < -10);

  const topSurplus = dists.slice(0, 2);
  const topDeficit = dists.slice(-2).reverse();

  const distContentEl = document.getElementById('ps-districts-content');
  distContentEl.innerHTML = `
    <div class="ps-dist-row">
      <span class="ps-dist-lbl">🟢 Top Excess:</span>
      <span class="ps-dist-val">${topSurplus.map(d => `<strong>${d.name}</strong> (${d.dev > 0 ? '+' : ''}${d.dev}%)`).join(', ')}</span>
    </div>
    <div class="ps-dist-row">
      <span class="ps-dist-lbl">🔴 Top Deficit:</span>
      <span class="ps-dist-val">${topDeficit.map(d => `<strong>${d.name}</strong> (${d.dev > 0 ? '+' : ''}${d.dev}%)`).join(', ')}</span>
    </div>
    <div class="ps-dist-row ps-dist-counts">
      <span class="ps-count-badge excess">${excessDist.length} Excess</span>
      <span class="ps-count-badge normal">${normalDist.length} Normal</span>
      <span class="ps-count-badge deficit">${deficitDist.length} Deficit</span>
    </div>
  `;
}

