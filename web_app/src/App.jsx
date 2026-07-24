import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  MapPin, 
  TrendingUp, 
  Table, 
  Info, 
  Activity, 
  Calendar,
  CloudRain,
  Compass,
  AlertTriangle,
  Maximize2
} from 'lucide-react';
import L from 'leaflet';
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Map recasting helper to fit geojson bounds perfectly at the center
function MapRecenter({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (geojson && map) {
      try {
        const geojsonLayer = L.geoJSON(geojson);
        map.fitBounds(geojsonLayer.getBounds(), { padding: [12, 12] });
      } catch (e) {
        console.error("Error centering map bounds:", e);
      }
    }
  }, [geojson, map]);
  return null;
}

// ENSO Phase Colors Matching Custom Sunset-Ocean Palette
const PHASE_COLORS = {
  'El Niño - Positive': '#ff734f', // Sunset Coral
  'El Niño - Negative': '#ef527a', // Vibrant Rose
  'El Niño - Neutral': '#ff734f',  // Sunset Coral
  'La Niña - Positive': '#003d5c', // Deep Ocean Blue
  'La Niña - Negative': '#394a82', // Slate Blue
  'La Niña - Neutral': '#394a82',  // Slate Blue
  'Neutral - Positive': '#bc4c96', // Orchid Pink
  'Neutral - Negative': '#7a4f99', // Deep Violet
  'Neutral - Neutral': '#ffa600'   // Vibrant Orange
};

const SEASONS = ['SW Monsoon', 'NE Monsoon', 'Annual'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function App() {
  const [districtList, setDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('State');
  const [selectedPhase, setSelectedPhase] = useState('El Niño - Positive');
  const [selectedSeason, setSelectedSeason] = useState('SW Monsoon');
  const [enlargedChart, setEnlargedChart] = useState(null); // 'monthly', 'weekly', 'annual', or null
  
  // Data States
  const [geojson, setGeojson] = useState(null);
  const [ensoSummary, setEnsoSummary] = useState([]);
  const [anovaData, setAnovaData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [annualDep, setAnnualDep] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [seasonalDep, setSeasonalDep] = useState([]);

  // Load datasets on startup
  useEffect(() => {
    const cleanRecord = (r) => {
      if (r.ENSO_Phase) {
        r.ENSO_Phase = r.ENSO_Phase
          .replace(/\uFFFD/g, 'ñ')
          .replace(/Nio/g, 'Niño')
          .replace(/Nia/g, 'Niña');
      }
      return r;
    };

    // 1. Fetch GeoJSON
    fetch('/data/karnataka_districts.geojson')
      .then(res => res.json())
      .then(data => setGeojson(data))
      .catch(err => console.error("Error loading geojson:", err));

    // 2. Fetch combined ENSO Summary
    fetch('/data/combined_enso_summary.json')
      .then(res => res.json())
      .then(data => {
        const cleaned = data.map(cleanRecord);
        setEnsoSummary(cleaned);
        // Compile unique district list
        const districts = Array.from(new Set(cleaned.map(d => d.District))).sort();
        const filteredDistricts = districts.filter(d => d !== 'State');
        setDistrictList(['State', ...filteredDistricts]);
      })
      .catch(err => console.error("Error loading ENSO summary:", err));

    // 3. Fetch ANOVA data
    fetch('/data/anova_kruskal_results.json')
      .then(res => res.json())
      .then(data => setAnovaData(data))
      .catch(err => console.error("Error loading ANOVA results:", err));

    // 4. Fetch Trend data
    fetch('/data/mann_kendall_trends.json')
      .then(res => res.json())
      .then(data => setTrendsData(data))
      .catch(err => console.error("Error loading Trends:", err));

    // 5. Fetch Correlations data
    fetch('/data/correlation_regression_results.json')
      .then(res => res.json())
      .then(data => setCorrelationData(data))
      .catch(err => console.error("Error loading Correlation/Regression results:", err));

    // 6. Fetch Annual departures
    fetch('/data/district_annual_departures.json')
      .then(res => res.json())
      .then(data => setAnnualDep(data))
      .catch(err => console.error("Error loading annual departures:", err));

    // 7. Fetch Monthly summaries
    fetch('/data/district_monthly_summary.json')
      .then(res => res.json())
      .then(data => {
        setMonthlySummary(data.map(cleanRecord));
      })
      .catch(err => console.error("Error loading monthly summary:", err));

    // 8. Fetch Weekly summaries
    fetch('/data/district_weekly_summary.json')
      .then(res => res.json())
      .then(data => {
        setWeeklySummary(data.map(cleanRecord));
      })
      .catch(err => console.error("Error loading weekly summary:", err));

    // 9. Fetch Seasonal departures
    fetch('/data/district_seasonal_departures.json')
      .then(res => res.json())
      .then(data => {
        setSeasonalDep(data.map(cleanRecord));
      })
      .catch(err => console.error("Error loading seasonal departures:", err));
  }, []);

  // Filter handlers
  const handleMapDistrictClick = (districtName) => {
    setSelectedDistrict(districtName);
  };

  // Helper: map departures to color for GeoJSON Choropleth
  const getDepartureColor = (value) => {
    if (value === undefined || value === null) return '#e2e8f0'; // Slate-200
    if (value > 20) return '#003d5c';      // Excess (Deep Ocean Blue)
    if (value >= -19 && value <= 19) return '#bc4c96'; // Normal (Orchid Pink)
    if (value < -20 && value >= -59) return '#ffa600'; // Deficient (Orange/Yellow)
    return '#ff5f66'; // Scanty (Coral Red)
  };

  // Map style selector
  const mapStyle = (feature) => {
    let name = feature.properties.district || feature.properties.NAME_2 || feature.properties.name;
    if (name) {
      name = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    }
    
    // Find departure in ensoSummary for this district, selected ENSO phase, and selected season
    const summary = ensoSummary.find(s => 
      s.District && name &&
      s.District.toLowerCase() === name.toLowerCase() &&
      s.ENSO_Phase === selectedPhase &&
      s.Period === selectedSeason
    );
    
    const depVal = summary ? summary.Departure : null;
    return {
      fillColor: getDepartureColor(depVal),
      weight: 1.5,
      opacity: 1,
      color: '#2e303a',
      fillOpacity: 0.75
    };
  };

  const onEachDistrict = (feature, layer) => {
    let name = feature.properties.district || feature.properties.NAME_2 || feature.properties.name;
    if (name) {
      name = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    }
    
    const summary = ensoSummary.find(s => 
      s.District && name &&
      s.District.toLowerCase() === name.toLowerCase() &&
      s.ENSO_Phase === selectedPhase &&
      s.Period === selectedSeason
    );
    const meanVal = (summary && summary.Mean !== undefined && summary.Mean !== null) ? summary.Mean.toFixed(1) + ' mm' : 'N/A';
    const depVal = (summary && summary.Departure !== undefined && summary.Departure !== null) ? summary.Departure.toFixed(1) + '%' : 'N/A';
    
    layer.bindTooltip(
      `<strong>${name}</strong><br/>
       Rainfall: ${meanVal}<br/>
       Departure: ${depVal}`,
      { permanent: false, sticky: true }
    );

    layer.on({
      click: () => handleMapDistrictClick(name),
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.95,
          weight: 2.5,
          color: '#22c55e'
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.75,
          weight: 1.5,
          color: '#2e303a'
        });
      }
    });
  };

  // Compile Chart Data
  // 1. Monthly Chart (Adding baselines)
  const getMonthlyChartData = () => {
    const distData = monthlySummary.filter(r => 
      r.District.toLowerCase() === selectedDistrict.toLowerCase() &&
      r.ENSO_Phase === selectedPhase
    );

    const actuals = Array(12).fill(0);
    const normals = Array(12).fill(0);
    
    for (let i = 1; i <= 12; i++) {
      const rec = distData.find(d => d.Month === i);
      actuals[i - 1] = rec ? rec.Actual : 0;
      normals[i - 1] = rec ? rec.Normal : 0;
    }

    // Calculate baseline means
    const annualMean = actuals.reduce((a, b) => a + b, 0) / 12;
    const swMean = [5, 6, 7, 8].reduce((a, b) => a + actuals[b], 0) / 4; // June-Sep (index 5-8)
    const neMean = [9, 10, 11].reduce((a, b) => a + actuals[b], 0) / 3; // Oct-Dec (index 9-11)

    return {
      labels: MONTHS,
      datasets: [
        {
          label: 'Normal Rainfall',
          data: normals,
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          borderColor: 'rgba(148, 163, 184, 0.5)',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Actual Rainfall',
          data: actuals,
          backgroundColor: PHASE_COLORS[selectedPhase] || '#d97706',
          borderColor: PHASE_COLORS[selectedPhase] || '#d97706',
          borderWidth: 1.5,
          borderRadius: 4
        }
      ]
    };
  };

  // 2. Weekly Chart (Adding baselines)
  const getWeeklyChartData = () => {
    const distData = weeklySummary.filter(r => 
      r.District.toLowerCase() === selectedDistrict.toLowerCase() &&
      r.ENSO_Phase === selectedPhase
    );

    const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
    const actuals = Array(52).fill(0);
    const normals = Array(52).fill(0);
    
    weeks.forEach(w => {
      const rec = distData.find(d => d.SMW === w);
      actuals[w - 1] = rec ? rec.Actual : 0;
      normals[w - 1] = rec ? rec.Normal : 0;
    });

    const annWeeklyMean = actuals.reduce((a, b) => a + b, 0) / 52;
    const swWeeklyMean = actuals.slice(21, 39).reduce((a, b) => a + b, 0) / 18; // Weeks 22-39
    const neWeeklyMean = actuals.slice(39, 52).reduce((a, b) => a + b, 0) / 13; // Weeks 40-52

    return {
      labels: weeks.map(w => `W${w}`),
      datasets: [
        {
          label: 'Normal Weekly',
          data: normals,
          borderColor: 'rgba(148, 163, 184, 0.4)',
          backgroundColor: 'rgba(148, 163, 184, 0.05)',
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 1.5
        },
        {
          label: 'Actual Weekly',
          data: actuals,
          borderColor: PHASE_COLORS[selectedPhase] || '#22c55e',
          backgroundColor: (PHASE_COLORS[selectedPhase] || '#22c55e') + '0D', // Soft translucent fill
          fill: true,
          tension: 0.35,
          pointRadius: 1.5,
          borderWidth: 2.5
        }
      ]
    };
  };

  // 3. Annual Trend Chart (Adding multiple seasonal series simultaneously)
  const getAnnualChartData = () => {
    const annRecs = annualDep.filter(r => r.District.toLowerCase() === selectedDistrict.toLowerCase());
    const swRecs = seasonalDep.filter(r => r.District.toLowerCase() === selectedDistrict.toLowerCase() && r.Season === 'SW Monsoon');
    const neRecs = seasonalDep.filter(r => r.District.toLowerCase() === selectedDistrict.toLowerCase() && r.Season === 'NE Monsoon');

    annRecs.sort((a, b) => a.Year - b.Year);
    swRecs.sort((a, b) => a.Year - b.Year);
    neRecs.sort((a, b) => a.Year - b.Year);

    const years = annRecs.map(r => r.Year);
    const annActuals = annRecs.map(r => r.Actual);
    const swActuals = swRecs.map(r => r.Actual);
    const neActuals = neRecs.map(r => r.Actual);

    // Get Sen's Slope parameters
    const trendRec = trendsData.find(t => t.District.toLowerCase() === selectedDistrict.toLowerCase() && t.Period === selectedSeason);
    const slope = trendRec ? trendRec.sens_slope : 0;
    
    let activeActuals = annActuals;
    if (selectedSeason === 'SW Monsoon') activeActuals = swActuals;
    if (selectedSeason === 'NE Monsoon') activeActuals = neActuals;

    const meanX = years.reduce((a, b) => a + b, 0) / (years.length || 1);
    const meanY = activeActuals.reduce((a, b) => a + b, 0) / (activeActuals.length || 1);
    const trendline = years.map(y => meanY + slope * (y - meanX));

    return {
      labels: years,
      datasets: [
        {
          label: 'Annual Rainfall',
          data: annActuals,
          borderColor: '#ffa600', // Orange/Yellow
          backgroundColor: 'rgba(255, 166, 0, 0.02)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: 'SW Monsoon (JJAS)',
          data: swActuals,
          borderColor: '#003d5c', // Deep Ocean Blue
          backgroundColor: 'rgba(0, 61, 92, 0.02)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: 'NE Monsoon (OND)',
          data: neActuals,
          borderColor: '#ef527a', // Vibrant Rose
          backgroundColor: 'rgba(239, 82, 122, 0.02)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: `Trendline (${selectedSeason}: ${slope.toFixed(2)})`,
          data: trendline,
          borderColor: '#475569', // Dark Slate Gray
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          borderWidth: 2
        }
      ]
    };
  };

  // Compile ENSO Phase aggregate comparison table data
  const getEnsoComparisonData = () => {
    const distData = ensoSummary.filter(s => 
      s.District.toLowerCase() === selectedDistrict.toLowerCase() &&
      s.Period === selectedSeason
    );

    const categories = {
      'El Niño': { count: 0, mean: 0, departure: 0 },
      'La Niña': { count: 0, mean: 0, departure: 0 },
      'Neutral': { count: 0, mean: 0, departure: 0 }
    };

    distData.forEach(s => {
      let cat = null;
      if (s.ENSO_Phase.startsWith('El Niño')) cat = 'El Niño';
      else if (s.ENSO_Phase.startsWith('La Niña')) cat = 'La Niña';
      else if (s.ENSO_Phase.startsWith('Neutral')) cat = 'Neutral';

      if (cat) {
        categories[cat].count += 1;
        categories[cat].mean += s.Mean;
        categories[cat].departure += s.Departure;
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      Phase: name,
      Mean: data.count > 0 ? data.mean / data.count : 0,
      Departure: data.count > 0 ? data.departure / data.count : 0
    }));
  };

  const getActiveStats = () => {
    const summary = ensoSummary.find(s => 
      s.District && selectedDistrict &&
      s.District.toLowerCase() === selectedDistrict.toLowerCase() &&
      s.ENSO_Phase === selectedPhase &&
      s.Period === selectedSeason
    );
    const anova = anovaData.find(a => 
      a.District && selectedDistrict &&
      a.District.toLowerCase() === selectedDistrict.toLowerCase() &&
      a.Variable === selectedSeason
    );
    const trend = trendsData.find(t => 
      t.District && selectedDistrict &&
      t.District.toLowerCase() === selectedDistrict.toLowerCase() &&
      t.Period === selectedSeason
    );

    return {
      mean: summary && summary.Mean !== undefined && summary.Mean !== null ? summary.Mean.toFixed(1) + ' mm' : 'N/A',
      departure: summary && summary.Departure !== undefined && summary.Departure !== null ? summary.Departure.toFixed(1) + '%' : 'N/A',
      depVal: summary && summary.Departure !== undefined && summary.Departure !== null ? summary.Departure : 0,
      anovaP: anova && anova.ANOVA_p !== undefined ? anova.ANOVA_p : null,
      slope: trend && trend.sens_slope !== undefined && trend.sens_slope !== null ? trend.sens_slope.toFixed(2) + ' mm/yr' : 'N/A',
      trendType: trend && trend.trend !== undefined ? trend.trend : 'N/A'
    };
  };

  // Filter ANOVA data for display
  const districtAnova = anovaData.filter(a => a.District === selectedDistrict);
  const districtMK = trendsData.filter(t => t.District === selectedDistrict);
  const districtCorr = correlationData.filter(c => c.District === selectedDistrict);

  return (
    <div id="root">
      <div className="app-container">
        
        {/* Header Section */}
        <header>
          <div className="header-title-container">
            <span className="header-subtitle">Meteorological Dashboard</span>
            <h1>Karnataka ENSO-IOD Phase-wise Rainfall Explorer</h1>
          </div>
          <div className="welcome-banner">
            Analyzing historical rainfall variability <strong>(1981–2015)</strong> across 9 distinct global climate modes.
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="dashboard-grid">
          
          {/* Left Panel: Selectors & Choropleth Map */}
          <div className="main-content-area" style={{ gap: '20px' }}>
            
            {/* Filters panel */}
            <div className="card-panel">
              <h2 className="card-title"><Compass size={18} /> Exploration Filters</h2>
              
              <div className="filter-group">
                <label className="filter-label">Selected District</label>
                <select 
                  className="custom-select" 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {districtList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Selected Climate Phase</label>
                <select 
                  className="custom-select" 
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                >
                  {Object.keys(PHASE_COLORS).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="filter-group" style={{ marginBottom: 0 }}>
                <label className="filter-label">Spatial Map Layer (Season)</label>
                <select 
                  className="custom-select" 
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Map Panel */}
            <div className="card-panel">
              <h2 className="card-title">
                <MapPin size={18} /> Karnataka Districts Choropleth
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Colors display departures for <strong>{selectedSeason}</strong> during <strong>{selectedPhase}</strong>. Click on any district to inspect.
              </p>
              
              <div className="map-container-wrapper">
                {geojson && (
                  <MapContainer 
                    center={[15.3173, 75.7139]} 
                    zoom={6.2} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <GeoJSON 
                      key={`${selectedPhase}-${selectedSeason}`}
                      data={geojson} 
                      style={mapStyle} 
                      onEachFeature={onEachDistrict}
                    />
                    <MapRecenter geojson={geojson} />
                  </MapContainer>
                )}
              </div>

              {/* Map Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px', fontSize: '11px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#003d5c', marginRight: '4px', borderRadius: '2px' }}></span>
                  <span>Excess (&gt; 20%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#bc4c96', marginRight: '4px', borderRadius: '2px' }}></span>
                  <span>Normal (-19% to 19%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ffa600', marginRight: '4px', borderRadius: '2px' }}></span>
                  <span>Deficient (-20% to -59%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ff5f66', marginRight: '4px', borderRadius: '2px' }}></span>
                  <span>Scanty (&lt; -60%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Charts & Stats Dashboard */}
          <div className="main-content-area">
            
            {/* Quick Stats Summary Banner */}
            <div className="stats-summary-banner">
              <div className="summary-card">
                <span className="summary-label">Average Rainfall</span>
                <span className="summary-value">{getActiveStats().mean}</span>
                <span className="summary-subtext">For {selectedSeason} under {selectedPhase}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Rainfall Departure</span>
                <span className="summary-value" style={{ color: getActiveStats().depVal > 20 ? 'var(--accent-cyan)' : getActiveStats().depVal < -19 ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                  {getActiveStats().departure}
                </span>
                <span className="summary-subtext">Compared to long-term normal</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">ANOVA Significance</span>
                <span className="summary-value" style={{ color: getActiveStats().anovaP !== null && getActiveStats().anovaP < 0.05 ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                  {getActiveStats().anovaP !== null ? (getActiveStats().anovaP < 0.05 ? 'Significant' : 'Not Significant') : 'N/A'}
                </span>
                <span className="summary-subtext">{getActiveStats().anovaP !== null ? `p-value: ${getActiveStats().anovaP.toFixed(4)}` : 'No ANOVA records'}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Mann-Kendall Trend</span>
                <span className="summary-value" style={{ textTransform: 'capitalize' }}>{getActiveStats().trendType}</span>
                <span className="summary-subtext">Sen's Slope: {getActiveStats().slope}</span>
              </div>
            </div>
            
            {/* Visual Charts Row */}
            <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              
              {/* Monthly normals comparison */}
              <div 
                className="card-panel graph-card" 
                onClick={() => setEnlargedChart('monthly')} 
                style={{ cursor: 'zoom-in', position: 'relative' }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)' }}>
                  <Maximize2 size={14} />
                </div>
                <h2 className="card-title"><CloudRain size={18} /> Monthly Climatology Comparison</h2>
                <div style={{ height: '240px', position: 'relative', pointerEvents: 'none' }}>
                  {monthlySummary.length > 0 && (
                    <Bar 
                      data={getMonthlyChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { labels: { color: '#0f172a', font: { size: 9 } } },
                        },
                        scales: {
                          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' } },
                          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' }, title: { display: true, text: 'Rainfall (mm)', color: '#475569' } }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Weekly SMW 1-52 Comparison */}
              <div 
                className="card-panel graph-card" 
                onClick={() => setEnlargedChart('weekly')} 
                style={{ cursor: 'zoom-in', position: 'relative' }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)' }}>
                  <Maximize2 size={14} />
                </div>
                <h2 className="card-title"><Activity size={18} /> Standard Meteorological Week (SMW)</h2>
                <div style={{ height: '240px', position: 'relative', pointerEvents: 'none' }}>
                  {weeklySummary.length > 0 && (
                    <Line 
                      data={getWeeklyChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { labels: { color: '#0f172a', font: { size: 8 } } }
                        },
                        scales: {
                          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 9 } } },
                          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' }, title: { display: true, text: 'Rainfall (mm)', color: '#475569' } }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Annual/Seasonal Long term trends */}
              <div 
                className="card-panel graph-card" 
                onClick={() => setEnlargedChart('annual')} 
                style={{ cursor: 'zoom-in', position: 'relative' }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)' }}>
                  <Maximize2 size={14} />
                </div>
                <h2 className="card-title"><TrendingUp size={18} /> Long-Term Climatological Trendline</h2>
                <div style={{ height: '240px', position: 'relative', pointerEvents: 'none' }}>
                  {annualDep.length > 0 && (
                    <Line 
                      data={getAnnualChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { labels: { color: '#0f172a', font: { size: 8 } } }
                        },
                        scales: {
                          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' } },
                          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' }, title: { display: true, text: 'Rainfall (mm)', color: '#475569' } }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Statistics Tabs & Tables */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              
              {/* ENSO Comparison Table */}
              <div className="card-panel">
                <h2 className="card-title"><Table size={18} /> ENSO Phase Comparison ({selectedSeason})</h2>
                <div className="stats-table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>ENSO Phase</th>
                        <th>Mean Rainfall (mm)</th>
                        <th>Mean Departure (%)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getEnsoComparisonData().map((item, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 'bold' }}>{item.Phase}</td>
                          <td>{item.Mean.toFixed(1)} mm</td>
                          <td className={item.Departure < -19 ? 'significant-cell' : ''}>
                            {item.Departure.toFixed(1)}%
                          </td>
                          <td>
                            <span className={`metric-badge ${
                              item.Departure > 20 ? 'badge-sig' : 
                              item.Departure < -20 ? 'badge-ns' : 'badge-neutral'
                            }`} style={{ 
                              backgroundColor: item.Departure > 20 ? '#22c55e' : item.Departure < -20 ? '#ef4444' : '#eab308',
                              color: item.Departure < -20 || item.Departure > 20 ? '#fff' : '#000'
                            }}>
                              {item.Departure > 20 ? 'Excess' : item.Departure < -20 ? 'Deficient' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ANOVA & KW hypothesis panel */}
              <div className="card-panel">
                <h2 className="card-title"><Table size={18} /> Group Differences (ANOVA)</h2>
                <div className="stats-table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Season / Variable</th>
                        <th>ANOVA F</th>
                        <th>ANOVA p</th>
                        <th>Kruskal H</th>
                        <th>KW p</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtAnova.map((a, i) => (
                        <tr key={i}>
                          <td>{a.Variable}</td>
                          <td>{a.ANOVA_F.toFixed(2)}</td>
                          <td className={a.ANOVA_p < 0.05 ? 'significant-cell' : ''}>
                            {a.ANOVA_p.toFixed(4)}
                          </td>
                          <td>{a.KW_H.toFixed(2)}</td>
                          <td className={a.KW_p < 0.05 ? 'significant-cell' : ''}>
                            {a.KW_p.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                      {districtAnova.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No statistical summary available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mann-Kendall Trend statistics panel */}
              <div className="card-panel">
                <h2 className="card-title"><Activity size={18} /> Mann-Kendall Trend Parameters</h2>
                <div className="stats-table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Trend Type</th>
                        <th>p-value</th>
                        <th>Sen's Slope</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtMK.map((m, i) => (
                        <tr key={i}>
                          <td>{m.Period}</td>
                          <td>{m.trend}</td>
                          <td>{m.p_value?.toFixed(4)}</td>
                          <td>{m.sens_slope?.toFixed(3)}</td>
                          <td>
                            <span className={`metric-badge ${m.significance !== 'Not Significant' && m.significance !== 'ns' ? 'badge-sig' : 'badge-ns'}`}>
                              {m.significance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Regression and Correlations */}
            <div className="card-panel">
              <h2 className="card-title"><Calendar size={18} /> Regression Models & Phase Coefficients</h2>
              <div className="stats-table-container">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Climate Window</th>
                      <th>Pearson r</th>
                      <th>Spearman ρ</th>
                      <th>OLS R²</th>
                      <th>ENSO Coefficient</th>
                      <th>IOD Coefficient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districtCorr.map((c, i) => (
                      <tr key={i}>
                        <td>{c.Variable}</td>
                        <td className={c.pearson_enso_p < 0.05 ? 'significant-cell' : ''}>
                          {c.pearson_enso?.toFixed(3)} (p={c.pearson_enso_p?.toFixed(3)})
                        </td>
                        <td className={c.spearman_enso_p < 0.05 ? 'significant-cell' : ''}>
                          {c.spearman_enso?.toFixed(3)} (p={c.spearman_enso_p?.toFixed(3)})
                        </td>
                        <td>{c.r2?.toFixed(3)}</td>
                        <td>{c.coef_enso?.toFixed(2)} (p={c.p_enso?.toFixed(3)})</td>
                        <td>{c.coef_iod?.toFixed(2)} (p={c.p_iod?.toFixed(3)})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Full-Screen Glassmorphic Enlarged Chart Modal */}
      {enlargedChart && (
        <div 
          className="modal-backdrop"
          onClick={() => setEnlargedChart(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(244, 241, 234, 0.95)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
          }}
        >
          <div 
            className="card-panel graph-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{
              width: '100%',
              maxWidth: '960px',
              height: 'auto',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setEnlargedChart(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                zIndex: 10
              }}
            >
              ×
            </button>
            
            {enlargedChart === 'monthly' && (
              <>
                <h2 className="card-title" style={{ borderBottom: 'none', marginBottom: '8px' }}><CloudRain size={20} /> Monthly Climatology Comparison</h2>
                <div style={{ height: '300px', position: 'relative', width: '100%' }}>
                  <Bar 
                    data={getMonthlyChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: '#0f172a', font: { size: 11 } } },
                      },
                      scales: {
                        x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 12 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 12 } }, title: { display: true, text: 'Rainfall (mm)', color: '#475569', font: { size: 12 } } }
                      }
                    }}
                  />
                </div>
                <div className="stats-table-container" style={{ marginTop: '20px', maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Normal Rainfall (mm)</th>
                        <th>Actual Rainfall (mm)</th>
                        <th>Difference (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MONTHS.map((m, i) => {
                        const mData = getMonthlyChartData();
                        const norm = mData.datasets[0].data[i];
                        const act = mData.datasets[1].data[i];
                        const diff = norm > 0 ? ((act - norm) / norm) * 100 : 0;
                        return (
                          <tr key={i}>
                            <td>{m}</td>
                            <td>{norm.toFixed(2)}</td>
                            <td>{act.toFixed(2)}</td>
                            <td className={diff > 0 ? 'significant-cell' : ''}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {enlargedChart === 'weekly' && (
              <>
                <h2 className="card-title" style={{ borderBottom: 'none', marginBottom: '8px' }}><Activity size={20} /> Standard Meteorological Week (SMW)</h2>
                <div style={{ height: '300px', position: 'relative', width: '100%' }}>
                  <Line 
                    data={getWeeklyChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: '#0f172a', font: { size: 11 } } }
                      },
                      scales: {
                        x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 11 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 12 } }, title: { display: true, text: 'Rainfall (mm)', color: '#475569', font: { size: 12 } } }
                      }
                    }}
                  />
                </div>
                <div className="stats-table-container" style={{ marginTop: '20px', maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Normal Weekly Rainfall (mm)</th>
                        <th>Actual Weekly Rainfall (mm)</th>
                        <th>Difference (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => {
                        const wData = getWeeklyChartData();
                        const norm = wData.datasets[0].data[w - 1];
                        const act = wData.datasets[1].data[w - 1];
                        const diff = norm > 0 ? ((act - norm) / norm) * 100 : 0;
                        return (
                          <tr key={w}>
                            <td>Week {w}</td>
                            <td>{norm.toFixed(2)}</td>
                            <td>{act.toFixed(2)}</td>
                            <td className={diff > 0 ? 'significant-cell' : ''}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {enlargedChart === 'annual' && (
              <>
                <h2 className="card-title" style={{ borderBottom: 'none', marginBottom: '8px' }}><TrendingUp size={20} /> Long-Term Climatological Trendline</h2>
                <div style={{ height: '300px', position: 'relative', width: '100%' }}>
                  <Line 
                    data={getAnnualChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: '#0f172a', font: { size: 11 } } }
                      },
                      scales: {
                        x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 12 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569', font: { size: 12 } }, title: { display: true, text: 'Rainfall (mm)', color: '#475569', font: { size: 12 } } }
                      }
                    }}
                  />
                </div>
                <div className="stats-table-container" style={{ marginTop: '20px', maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Annual Rainfall (mm)</th>
                        <th>SW Monsoon (mm)</th>
                        <th>NE Monsoon (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAnnualChartData().labels.map((y, i) => {
                        const aData = getAnnualChartData();
                        const ann = aData.datasets[0].data[i];
                        const sw = aData.datasets[1].data[i];
                        const ne = aData.datasets[2].data[i];
                        return (
                          <tr key={i}>
                            <td>{y}</td>
                            <td>{ann.toFixed(2)}</td>
                            <td>{sw.toFixed(2)}</td>
                            <td>{ne.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
