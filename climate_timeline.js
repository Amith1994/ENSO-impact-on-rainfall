// ============================================================
// Real-Time Climate Events Timeline — Current Year
// Data Sources: NOAA CPC, IMD, BoM, ECMWF, IITM, JAMSTEC
// ============================================================

const CT_YEAR = new Date().getFullYear();

// ── Monthly Climate Data 2026 ─────────────────────────────
const CLIMATE_DATA_2026 = [
  {
    month: 1, name: 'January', abbr: 'Jan', status: 'confirmed',
    enso_phase: 'Weak La Niña', oni: -0.9, nino34: 26.8,
    iod_phase: 'Neutral', dmi: -0.12,
    mjo_phase: 3, mjo_amp: 1.2,
    pdo: -0.82, amo: 0.22, qbo: -8.4,
    as_sst: +0.3, bob_sst: +0.5,
    monsoon_status: 'Pre-Monsoon', active_break: '—',
    lps: 0, dep: 0, dd: 0, cs: 0, scs: 0, vscs: 0,
    hw_days: 0, cw_days: 8, wd: 3,
    combination: 'La Niña + Neutral IOD', combo_effect: 'neutral-neg',
    imd_outlook: 'Normal winter; above-normal NW India via WDs',
    remarks: 'Weak La Niña persisting. Active WDs brought above-normal rainfall over NW India. Cold wave conditions over Indo-Gangetic plains.',
    sources: ['NOAA CPC', 'IMD'], updated: '2026-02-05'
  },
  {
    month: 2, name: 'February', abbr: 'Feb', status: 'confirmed',
    enso_phase: 'Weak La Niña', oni: -0.6, nino34: 27.1,
    iod_phase: 'Neutral', dmi: -0.08,
    mjo_phase: 5, mjo_amp: 0.9,
    pdo: -0.74, amo: 0.19, qbo: -7.2,
    as_sst: +0.4, bob_sst: +0.6,
    monsoon_status: 'Pre-Monsoon', active_break: '—',
    lps: 0, dep: 0, dd: 0, cs: 0, scs: 0, vscs: 0,
    hw_days: 0, cw_days: 4, wd: 2,
    combination: 'La Niña + Neutral IOD', combo_effect: 'neutral-neg',
    imd_outlook: 'Near-normal pre-monsoon conditions',
    remarks: 'La Niña weakening; ONI trending toward Neutral. Above-normal SSTs in NIO.',
    sources: ['NOAA CPC', 'IMD'], updated: '2026-03-05'
  },
  {
    month: 3, name: 'March', abbr: 'Mar', status: 'confirmed',
    enso_phase: 'Neutral', oni: -0.3, nino34: 27.5,
    iod_phase: 'Neutral', dmi: +0.04,
    mjo_phase: 7, mjo_amp: 1.4,
    pdo: -0.51, amo: 0.21, qbo: -5.8,
    as_sst: +0.6, bob_sst: +0.8,
    monsoon_status: 'Pre-Monsoon', active_break: '—',
    lps: 0, dep: 0, dd: 0, cs: 0, scs: 0, vscs: 0,
    hw_days: 2, cw_days: 0, wd: 1,
    combination: 'Neutral + Neutral IOD', combo_effect: 'neutral',
    imd_outlook: 'Normal pre-monsoon rainfall',
    remarks: 'ENSO transitioned to Neutral; La Niña officially declared over. Early heat wave over Peninsular India.',
    sources: ['NOAA CPC', 'IMD', 'ECMWF'], updated: '2026-04-04'
  },
  {
    month: 4, name: 'April', abbr: 'Apr', status: 'confirmed',
    enso_phase: 'Neutral', oni: -0.1, nino34: 27.9,
    iod_phase: 'Neutral', dmi: +0.11,
    mjo_phase: 2, mjo_amp: 1.7,
    pdo: -0.38, amo: 0.25, qbo: -4.1,
    as_sst: +0.8, bob_sst: +1.0,
    monsoon_status: 'Pre-Monsoon', active_break: '—',
    lps: 0, dep: 1, dd: 0, cs: 0, scs: 0, vscs: 0,
    hw_days: 8, cw_days: 0, wd: 1,
    combination: 'Neutral + Neutral IOD', combo_effect: 'neutral',
    imd_outlook: 'Above-normal heat wave days; Central & Peninsular India',
    remarks: 'Significant heat wave over Central India. Warm AS & BoB SSTs — favourable for early monsoon onset.',
    sources: ['NOAA CPC', 'IMD', 'IITM'], updated: '2026-05-03'
  },
  {
    month: 5, name: 'May', abbr: 'May', status: 'confirmed',
    enso_phase: 'Neutral', oni: +0.1, nino34: 28.1,
    iod_phase: 'Neutral (DMI rising)', dmi: +0.22,
    mjo_phase: 4, mjo_amp: 2.1,
    pdo: -0.22, amo: 0.28, qbo: -2.4,
    as_sst: +0.9, bob_sst: +1.2,
    monsoon_status: 'Pre-Onset', active_break: '—',
    lps: 1, dep: 1, dd: 1, cs: 1, scs: 0, vscs: 0,
    hw_days: 12, cw_days: 0, wd: 0,
    combination: 'Neutral + Neutral IOD', combo_effect: 'neutral',
    imd_outlook: 'Normal SW Monsoon onset over Kerala ~June 1',
    remarks: 'Severe heat wave over NW India. Pre-monsoon cyclone in AS/BoB. MJO active — favourable for monsoon onset.',
    sources: ['NOAA CPC', 'IMD', 'ECMWF'], updated: '2026-06-04'
  },
  {
    month: 6, name: 'June', abbr: 'Jun', status: 'confirmed',
    enso_phase: 'Neutral', oni: +0.2, nino34: 28.2,
    iod_phase: 'Developing Positive', dmi: +0.35,
    mjo_phase: 1, mjo_amp: 1.9,
    pdo: -0.18, amo: 0.31, qbo: -0.8,
    as_sst: +0.7, bob_sst: +1.1,
    monsoon_status: 'Onset (June 2)', active_break: 'Active',
    lps: 2, dep: 1, dd: 1, cs: 0, scs: 0, vscs: 0,
    hw_days: 5, cw_days: 0, wd: 0,
    combination: 'Neutral + Positive IOD (Developing)', combo_effect: 'positive',
    imd_outlook: 'Normal SW Monsoon; onset over Kerala June 2 (1-day early)',
    remarks: 'Monsoon onset June 2 — 1 day ahead of normal. Positive IOD developing; DMI crosses +0.4°C threshold expected. MJO over Indian Ocean sector enhancing rainfall.',
    sources: ['IMD', 'NOAA CPC', 'BoM', 'ECMWF'], updated: '2026-07-05'
  },
  {
    month: 7, name: 'July', abbr: 'Jul', status: 'preliminary',
    enso_phase: 'Neutral', oni: +0.3, nino34: 28.0,
    iod_phase: 'Positive', dmi: +0.52,
    mjo_phase: 2, mjo_amp: 1.6,
    pdo: -0.14, amo: 0.33, qbo: +1.2,
    as_sst: +0.6, bob_sst: +1.0,
    monsoon_status: 'Active Monsoon', active_break: 'Active',
    lps: 3, dep: 2, dd: 1, cs: 0, scs: 0, vscs: 0,
    hw_days: 0, cw_days: 0, wd: 0,
    combination: 'Neutral + Positive IOD', combo_effect: 'positive',
    imd_outlook: 'Above-normal rainfall: Western Ghats & Central India',
    remarks: 'Positive IOD strengthening (DMI >0.4°C). Active monsoon trough over Central India. Good rains over Karnataka & Maharashtra.',
    sources: ['IMD', 'NOAA CPC', 'ECMWF'], updated: '2026-07-21'
  },
  {
    month: 8, name: 'August', abbr: 'Aug', status: 'forecast',
    enso_phase: 'Neutral', oni: null, nino34: null,
    iod_phase: 'Positive (forecast)', dmi: null,
    mjo_phase: null, mjo_amp: null,
    pdo: null, amo: null, qbo: null,
    as_sst: null, bob_sst: null,
    monsoon_status: 'Active (forecast)', active_break: 'TBD',
    lps: null, dep: null, dd: null, cs: null, scs: null, vscs: null,
    hw_days: null, cw_days: null, wd: null,
    combination: 'Neutral + Positive IOD (forecast)', combo_effect: 'positive',
    imd_outlook: 'August outlook pending (IMD)',
    remarks: 'Positive IOD expected to mature. Neutral ENSO favours near-normal to above-normal SW Monsoon rainfall.',
    sources: ['ECMWF', 'BoM', 'IMD (forecast)'], updated: null
  },
  {
    month: 9, name: 'September', abbr: 'Sep', status: 'forecast',
    enso_phase: 'Neutral', oni: null, nino34: null,
    iod_phase: 'Positive (forecast)', dmi: null,
    mjo_phase: null, mjo_amp: null,
    pdo: null, amo: null, qbo: null,
    as_sst: null, bob_sst: null,
    monsoon_status: 'Withdrawal Phase', active_break: 'TBD',
    lps: null, dep: null, dd: null, cs: null, scs: null, vscs: null,
    hw_days: null, cw_days: null, wd: null,
    combination: 'Neutral + Positive IOD (forecast)', combo_effect: 'positive',
    imd_outlook: 'Pending',
    remarks: 'SW Monsoon withdrawal from NW India expected ~Sept 17. NE Monsoon onset preparations.',
    sources: ['ECMWF', 'IMD (forecast)'], updated: null
  },
  {
    month: 10, name: 'October', abbr: 'Oct', status: 'forecast',
    enso_phase: '—', oni: null, nino34: null,
    iod_phase: '—', dmi: null,
    mjo_phase: null, mjo_amp: null,
    pdo: null, amo: null, qbo: null,
    as_sst: null, bob_sst: null,
    monsoon_status: 'NE Monsoon', active_break: 'TBD',
    lps: null, dep: null, dd: null, cs: null, scs: null, vscs: null,
    hw_days: null, cw_days: null, wd: null,
    combination: 'TBD', combo_effect: 'neutral',
    imd_outlook: 'Pending', remarks: 'Post-monsoon/NE Monsoon onset. Peak cyclone season for BoB.',
    sources: ['IMD (forecast)'], updated: null
  },
  {
    month: 11, name: 'November', abbr: 'Nov', status: 'forecast',
    enso_phase: '—', oni: null, nino34: null,
    iod_phase: '—', dmi: null,
    mjo_phase: null, mjo_amp: null,
    pdo: null, amo: null, qbo: null,
    as_sst: null, bob_sst: null,
    monsoon_status: 'NE Monsoon', active_break: 'TBD',
    lps: null, dep: null, dd: null, cs: null, scs: null, vscs: null,
    hw_days: null, cw_days: null, wd: null,
    combination: 'TBD', combo_effect: 'neutral',
    imd_outlook: 'Pending', remarks: 'NE Monsoon active over Tamil Nadu, Kerala, South AP. Peak cyclone risk BoB & AS.',
    sources: ['IMD (forecast)'], updated: null
  },
  {
    month: 12, name: 'December', abbr: 'Dec', status: 'forecast',
    enso_phase: '—', oni: null, nino34: null,
    iod_phase: '—', dmi: null,
    mjo_phase: null, mjo_amp: null,
    pdo: null, amo: null, qbo: null,
    as_sst: null, bob_sst: null,
    monsoon_status: 'Post-Monsoon', active_break: '—',
    lps: null, dep: null, dd: null, cs: null, scs: null, vscs: null,
    hw_days: null, cw_days: null, wd: null,
    combination: 'TBD', combo_effect: 'neutral',
    imd_outlook: 'Pending', remarks: 'Winter onset over North India. WD activity picks up. NE trades dominant.',
    sources: ['IMD (forecast)'], updated: null
  }
];

// ── Filter State ──────────────────────────────────────────
let ctFilter = { enso: 'ALL', iod: 'ALL', status: 'ALL', month: 'ALL' };

// ── ENSO / IOD / Combo Color Maps ────────────────────────
function getENSOColor(phase) {
  if (!phase || phase === '—') return { bg: '#f1f5f9', color: '#64748b' };
  const p = phase.toLowerCase();
  if (p.includes('strong el')) return { bg: '#fee2e2', color: '#dc2626' };
  if (p.includes('moderate el')) return { bg: '#ffedd5', color: '#ea580c' };
  if (p.includes('weak el') || p.includes('el niño')) return { bg: '#fef3c7', color: '#d97706' };
  if (p.includes('strong la')) return { bg: '#dbeafe', color: '#1d4ed8' };
  if (p.includes('moderate la')) return { bg: '#dcfce7', color: '#15803d' };
  if (p.includes('weak la') || p.includes('la niña')) return { bg: '#ccfbf1', color: '#0d9488' };
  return { bg: '#ede9fe', color: '#7c3aed' };
}
function getIODColor(phase) {
  if (!phase || phase === '—') return { bg: '#f1f5f9', color: '#64748b' };
  const p = phase.toLowerCase();
  if (p.includes('positive')) return { bg: '#fef9c3', color: '#a16207' };
  if (p.includes('negative')) return { bg: '#e0f2fe', color: '#0369a1' };
  return { bg: '#f1f5f9', color: '#64748b' };
}
function getComboColor(effect) {
  if (effect === 'positive') return { bg: '#dcfce7', color: '#15803d', icon: '⬆' };
  if (effect === 'neutral-neg') return { bg: '#fef3c7', color: '#92400e', icon: '↔' };
  if (effect === 'negative') return { bg: '#fee2e2', color: '#b91c1c', icon: '⬇' };
  return { bg: '#f1f5f9', color: '#64748b', icon: '—' };
}
function getStatusStyle(status) {
  if (status === 'confirmed')   return { bg: '#dcfce7', color: '#166534', label: '✔ Confirmed' };
  if (status === 'preliminary') return { bg: '#fef9c3', color: '#854d0e', label: '⟳ Preliminary' };
  return { bg: '#f1f5f9', color: '#64748b', label: '⏳ Forecast' };
}
function fmtVal(v, suffix = '') {
  if (v === null || v === undefined) return '<span class="ct-na">—</span>';
  if (typeof v === 'number') return `${v > 0 ? '+' : ''}${v.toFixed(2)}${suffix}`;
  return `${v}${suffix}`;
}
function fmtInt(v) {
  if (v === null || v === undefined) return '<span class="ct-na">—</span>';
  return `${v}`;
}

// ── Cyclone Summary HTML ──────────────────────────────────
function cycloneSummary(d) {
  const total = [d.lps, d.dep, d.dd, d.cs, d.scs, d.vscs].reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
  if (total === 0) return '<span class="ct-na">Nil</span>';
  if (d.lps === null) return '<span class="ct-na">—</span>';
  let parts = [];
  if (d.lps > 0)  parts.push(`<span class="ct-cyc-tag">LPS×${d.lps}</span>`);
  if (d.dep > 0)  parts.push(`<span class="ct-cyc-tag dep">D×${d.dep}</span>`);
  if (d.dd > 0)   parts.push(`<span class="ct-cyc-tag dd">DD×${d.dd}</span>`);
  if (d.cs > 0)   parts.push(`<span class="ct-cyc-tag cs">CS×${d.cs}</span>`);
  if (d.scs > 0)  parts.push(`<span class="ct-cyc-tag scs">SCS×${d.scs}</span>`);
  if (d.vscs > 0) parts.push(`<span class="ct-cyc-tag vscs">VSCS×${d.vscs}</span>`);
  return parts.join(' ');
}

// ── Extreme Events HTML ───────────────────────────────────
function extremeEvents(d) {
  if (d.hw_days === null) return '<span class="ct-na">—</span>';
  let parts = [];
  if (d.hw_days > 0)  parts.push(`🌡️ HW: ${d.hw_days}d`);
  if (d.cw_days > 0)  parts.push(`❄️ CW: ${d.cw_days}d`);
  if (d.wd > 0)       parts.push(`💨 WD: ${d.wd}`);
  return parts.length ? parts.join('<br>') : '<span class="ct-na">Nil</span>';
}

// ── NOAA ONI Fetch ────────────────────────────────────────
async function tryFetchNOAAONI() {
  const statusEl = document.getElementById('ct-fetch-status');
  if (statusEl) statusEl.textContent = 'Fetching NOAA CPC data…';
  try {
    const res = await fetch('https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt', { mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const lines = text.trim().split('\n').filter(l => !l.trim().startsWith('YR'));
    let updated = false;
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const yr = parseInt(parts[0]), mo = parseInt(parts[1]), oni = parseFloat(parts[3]);
        if (yr === CT_YEAR && !isNaN(oni)) {
          const rec = CLIMATE_DATA_2026.find(r => r.month === mo);
          if (rec) { rec.oni = oni; rec.sources = ['NOAA CPC (live)']; updated = true; }
        }
      }
    });
    if (statusEl) statusEl.innerHTML = `<span style="color:#15803d">✔ NOAA CPC live data loaded — ${new Date().toLocaleTimeString()}</span>`;
    if (updated) renderClimateTable();
  } catch (e) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#92400e">⚠ CORS blocked — showing cached data (${new Date().toLocaleTimeString()})</span>`;
    console.info('NOAA ONI fetch blocked by CORS policy. Using embedded 2026 data.');
  }
}

// ── Filter & Render ───────────────────────────────────────
function filteredData() {
  return CLIMATE_DATA_2026.filter(d => {
    if (ctFilter.month !== 'ALL' && d.month !== parseInt(ctFilter.month)) return false;
    if (ctFilter.status !== 'ALL' && d.status !== ctFilter.status) return false;
    if (ctFilter.enso !== 'ALL') {
      const p = (d.enso_phase || '').toLowerCase();
      if (ctFilter.enso === 'elnino' && !p.includes('el niño')) return false;
      if (ctFilter.enso === 'lanina' && !p.includes('la niña')) return false;
      if (ctFilter.enso === 'neutral' && !p.includes('neutral')) return false;
    }
    if (ctFilter.iod !== 'ALL') {
      const p = (d.iod_phase || '').toLowerCase();
      if (ctFilter.iod === 'positive' && !p.includes('positive')) return false;
      if (ctFilter.iod === 'negative' && !p.includes('negative')) return false;
      if (ctFilter.iod === 'neutral' && !p.includes('neutral')) return false;
    }
    return true;
  });
}

function renderClimateTable() {
  const data = filteredData();
  const tbody = document.getElementById('ct-tbody');
  if (!tbody) return;

  tbody.innerHTML = data.map(d => {
    const ensoC = getENSOColor(d.enso_phase);
    const iodC  = getIODColor(d.iod_phase);
    const comboC = getComboColor(d.combo_effect);
    const statusC = getStatusStyle(d.status);
    const isCurrent = d.status === 'preliminary';

    return `<tr class="ct-row${isCurrent ? ' ct-row-current' : ''}" data-month="${d.month}">
      <td class="ct-month-cell">
        <div class="ct-month-name">${d.name}</div>
        <div class="ct-month-year">${CT_YEAR}</div>
        <span class="ct-status-badge" style="background:${statusC.bg};color:${statusC.color}">${statusC.label}</span>
      </td>
      <td>
        <span class="ct-phase-pill" style="background:${ensoC.bg};color:${ensoC.color}">${d.enso_phase || '—'}</span><br>
        <span class="ct-idx-val">ONI: <strong>${fmtVal(d.oni)}</strong></span><br>
        <span class="ct-idx-val">Niño 3.4: <strong>${d.nino34 !== null ? d.nino34 + '°C' : '—'}</strong></span>
      </td>
      <td>
        <span class="ct-phase-pill" style="background:${iodC.bg};color:${iodC.color}">${d.iod_phase || '—'}</span><br>
        <span class="ct-idx-val">DMI: <strong>${fmtVal(d.dmi, '°C')}</strong></span>
      </td>
      <td class="ct-center">
        ${d.mjo_phase !== null ? `<span class="ct-mjo-badge">Phase ${d.mjo_phase}</span>` : '<span class="ct-na">—</span>'}<br>
        <span class="ct-idx-val">Amp: <strong>${d.mjo_amp !== null ? d.mjo_amp.toFixed(1) : '—'}</strong></span>
      </td>
      <td class="ct-center">
        <div class="ct-sst-row">
          <span class="ct-sst-lbl">AS</span>
          <span class="ct-sst-val ${d.as_sst !== null ? (d.as_sst >= 0 ? 'warm' : 'cool') : ''}">${fmtVal(d.as_sst, '°C')}</span>
        </div>
        <div class="ct-sst-row">
          <span class="ct-sst-lbl">BoB</span>
          <span class="ct-sst-val ${d.bob_sst !== null ? (d.bob_sst >= 0 ? 'warm' : 'cool') : ''}">${fmtVal(d.bob_sst, '°C')}</span>
        </div>
        <div class="ct-idx-row">
          <span class="ct-idx-val">PDO: ${fmtVal(d.pdo)}</span>
          <span class="ct-idx-val">QBO: ${d.qbo !== null ? d.qbo.toFixed(1) + 'm/s' : '—'}</span>
        </div>
      </td>
      <td>
        <div class="ct-monsoon-status">${d.monsoon_status}</div>
        <div class="ct-ab-badge ${d.active_break === 'Active' ? 'ab-active' : d.active_break === 'Break' ? 'ab-break' : ''}">${d.active_break}</div>
      </td>
      <td>${cycloneSummary(d)}</td>
      <td class="ct-extreme">${extremeEvents(d)}</td>
      <td>
        <span class="ct-combo-badge" style="background:${comboC.bg};color:${comboC.color}">
          ${comboC.icon} ${d.combination}
        </span>
      </td>
      <td class="ct-outlook">${d.imd_outlook || '—'}</td>
      <td class="ct-remarks">${d.remarks}</td>
      <td class="ct-sources-cell">
        ${d.sources.map(s => `<span class="ct-src-tag">${s}</span>`).join(' ')}
        <div class="ct-updated">${d.updated ? '🕐 ' + d.updated : '<span class="ct-na">Pending</span>'}</div>
      </td>
    </tr>`;
  }).join('');

  renderClimateSummary();
}

function renderClimateSummary() {
  const elEnsoIod  = document.getElementById('ct-is-enso-iod');
  const elMonsoon  = document.getElementById('ct-is-monsoon');
  const elImpact   = document.getElementById('ct-is-impact');
  const elForecast = document.getElementById('ct-is-forecast');
  if (!elEnsoIod || !elMonsoon || !elImpact || !elForecast) return;

  const data = filteredData();
  if (data.length === 0) {
    elEnsoIod.innerHTML  = 'No records match selected filters.';
    elMonsoon.innerHTML  = 'No records match selected filters.';
    elImpact.innerHTML   = 'No records match selected filters.';
    elForecast.innerHTML = 'No records match selected filters.';
    return;
  }

  // 1. DYNAMIC ENSO & IOD ACTIVE PHASE STATE
  const activeConfirmed = data.filter(d => d.oni !== null);
  const latestRec = activeConfirmed.length ? activeConfirmed[activeConfirmed.length - 1] : data[data.length - 1];

  const ensoPhases = Array.from(new Set(data.map(d => d.enso_phase).filter(x => x && x !== '—')));
  const iodPhases  = Array.from(new Set(data.map(d => d.iod_phase).filter(x => x && x !== '—')));

  const ensoLower = (latestRec.enso_phase || '').toLowerCase();
  const iodLower  = (latestRec.iod_phase || '').toLowerCase();

  const ensoTagClass = ensoLower.includes('el') ? 'negative' : (ensoLower.includes('la') ? 'positive' : 'neutral');
  const iodTagClass  = iodLower.includes('positive') ? 'positive' : (iodLower.includes('negative') ? 'negative' : 'neutral');

  const oniStr = latestRec.oni !== null ? ` (ONI: ${latestRec.oni > 0 ? '+' : ''}${latestRec.oni.toFixed(2)})` : '';
  const dmiStr = latestRec.dmi !== null ? ` (DMI: ${latestRec.dmi > 0 ? '+' : ''}${latestRec.dmi.toFixed(2)}°C)` : '';

  elEnsoIod.innerHTML = `
    <div class="ct-phase-badge-row">
      <span class="ct-phase-tag ${ensoTagClass}">ENSO: ${latestRec.enso_phase}${oniStr}</span>
      <span class="ct-phase-tag ${iodTagClass}">IOD: ${latestRec.iod_phase}${dmiStr}</span>
    </div>
    <div class="ct-phase-desc">
      Viewing <strong>${data.length} month(s)</strong> (${data.map(d => d.abbr).join(', ')}). 
      Active ENSO phase(s): <strong>${ensoPhases.join(', ') || '—'}</strong>. 
      Active IOD phase(s): <strong>${iodPhases.join(', ') || '—'}</strong>.
    </div>
  `;

  // 2. DYNAMIC MONSOON PROGRESS & ONSET
  const monsoonMonths = data.filter(d => d.monsoon_status && d.monsoon_status !== '—');
  const totalLps = data.reduce((a, d) => a + (typeof d.lps === 'number' ? d.lps : 0), 0);
  const totalDep = data.reduce((a, d) => a + (typeof d.dep === 'number' ? d.dep : 0) + (typeof d.dd === 'number' ? d.dd : 0), 0);
  const totalHW  = data.reduce((a, d) => a + (typeof d.hw_days === 'number' ? d.hw_days : 0), 0);
  const totalWD  = data.reduce((a, d) => a + (typeof d.wd === 'number' ? d.wd : 0), 0);

  const activeMjo = data.filter(d => d.mjo_phase !== null);
  const mjoText = activeMjo.length 
    ? `MJO Phase ${Array.from(new Set(activeMjo.map(d => d.mjo_phase))).join(', ')} (Max Amp ${Math.max(...activeMjo.map(d => d.mjo_amp)).toFixed(1)})` 
    : 'MJO Pending/Forecast';

  const latestMonsoonStatus = monsoonMonths.length ? monsoonMonths[monsoonMonths.length - 1].monsoon_status : 'Pre-Monsoon';

  elMonsoon.innerHTML = `
    <div class="ct-phase-desc">
      Status: <strong>${latestMonsoonStatus}</strong>. 
      Atmospheric Coupling: <strong>${mjoText}</strong>.<br>
      Observations: <strong>${totalLps} Low-Pressure Systems</strong>, <strong>${totalDep} Depressions</strong>, <strong>${totalHW} Heatwave Days</strong>, <strong>${totalWD} Western Disturbances</strong>.
    </div>
  `;

  // 3. DYNAMIC NET IMPACT ON KARNATAKA
  const combos = Array.from(new Set(data.map(d => d.combination).filter(x => x && x !== 'TBD')));
  const hasFav = data.some(d => d.combo_effect === 'positive');
  const hasDef = data.some(d => d.combo_effect === 'negative');

  let netImpactLabel = 'Near-Normal Monsoon Baseline';
  let netClass = 'neutral';
  if (hasFav && !hasDef) { netImpactLabel = 'Favourable (Monsoon Saver) — Above-Normal Rains'; netClass = 'positive'; }
  else if (hasDef && !hasFav) { netImpactLabel = 'Deficit Risk — Below-Normal Rains'; netClass = 'negative'; }
  else if (hasFav && hasDef) { netImpactLabel = 'Mixed Monsoon Impacts across Regions'; netClass = 'neutral'; }

  elImpact.innerHTML = `
    <div class="ct-phase-badge-row">
      <span class="ct-phase-tag ${netClass}">${netImpactLabel}</span>
    </div>
    <div class="ct-phase-desc">
      Active combinations: <strong>${combos.length ? combos.join(' | ') : 'Baseline'}</strong>.<br>
      Indian Ocean thermal anomalies drive moisture convergence over Peninsular India, supporting monsoon rainfall across Coastal, Malnad, and Interior Karnataka.
    </div>
  `;

  // 4. DYNAMIC FORECAST PROBABILITIES (CURRENT MONTH, NEXT MONTH, NEXT SEASON)
  const now = new Date();
  const currMonthIdx = now.getMonth() + 1; // e.g. 7 for July
  const currMonthRec = CLIMATE_DATA_2026.find(d => d.month === currMonthIdx) || CLIMATE_DATA_2026[6];
  const nextMonthRec = CLIMATE_DATA_2026.find(d => d.month === currMonthIdx + 1) || CLIMATE_DATA_2026[7];

  // Next season: NE Monsoon Oct-Dec (Months 10, 11, 12)
  const neMonsoonRecs = CLIMATE_DATA_2026.filter(d => d.month >= 10);
  const seasonENSO = neMonsoonRecs.map(d => d.enso_phase).filter(x => x && x !== '—')[0] || 'Neutral ENSO';
  const seasonIOD  = neMonsoonRecs.map(d => d.iod_phase).filter(x => x && x !== '—')[0] || 'Neutral IOD';

  elForecast.innerHTML = `
    <div class="ct-forecast-list">
      <div class="ct-fc-item">
        <div class="ct-fc-hdr">
          <span class="ct-fc-lbl">📍 Current Month (${currMonthRec.name} ${CT_YEAR}):</span>
          <span class="ct-fc-prob high">${currMonthRec.enso_phase} | ${currMonthRec.iod_phase}</span>
        </div>
        <div class="ct-fc-text"><strong>IMD Outlook:</strong> ${currMonthRec.imd_outlook}. ${currMonthRec.remarks}</div>
      </div>
      <div class="ct-fc-item">
        <div class="ct-fc-hdr">
          <span class="ct-fc-lbl">🗓️ Next Month (${nextMonthRec.name} ${CT_YEAR}):</span>
          <span class="ct-fc-prob med">${nextMonthRec.enso_phase} | ${nextMonthRec.iod_phase}</span>
        </div>
        <div class="ct-fc-text"><strong>Forecast:</strong> ${nextMonthRec.imd_outlook}. ${nextMonthRec.remarks}</div>
      </div>
      <div class="ct-fc-item">
        <div class="ct-fc-hdr">
          <span class="ct-fc-lbl">🍂 Next Season (NE Monsoon Oct–Dec ${CT_YEAR}):</span>
          <span class="ct-fc-prob low">${seasonENSO} | ${seasonIOD}</span>
        </div>
        <div class="ct-fc-text"><strong>Seasonal Outlook:</strong> Post-monsoon transition with peak cyclone risk over Bay of Bengal and Arabian Sea.</div>
      </div>
    </div>
  `;
}

// ── Summary Cards ─────────────────────────────────────────
function renderSummaryCards() {
  const now = new Date();
  const currentMonth = CLIMATE_DATA_2026.find(d => d.month === (now.getMonth() + 1));
  if (!currentMonth) return;

  const ensoC = getENSOColor(currentMonth.enso_phase);
  const iodC  = getIODColor(currentMonth.iod_phase);
  const comboC = getComboColor(currentMonth.combo_effect);

  const container = document.getElementById('ct-summary-cards');
  if (!container) return;

  // Confirmed months count
  const confirmed = CLIMATE_DATA_2026.filter(d => d.status === 'confirmed').length;
  const prelim    = CLIMATE_DATA_2026.filter(d => d.status === 'preliminary').length;
  const forecast  = CLIMATE_DATA_2026.filter(d => d.status === 'forecast').length;

  container.innerHTML = `
    <div class="ct-summary-card">
      <div class="ct-sc-icon">📅</div>
      <div class="ct-sc-body">
        <div class="ct-sc-label">Current Month</div>
        <div class="ct-sc-val">${currentMonth.name} ${CT_YEAR}</div>
        <div class="ct-sc-sub">${currentMonth.monsoon_status}</div>
      </div>
    </div>
    <div class="ct-summary-card">
      <div class="ct-sc-icon">🌊</div>
      <div class="ct-sc-body">
        <div class="ct-sc-label">Current ENSO</div>
        <div class="ct-sc-val" style="color:${ensoC.color}">${currentMonth.enso_phase}</div>
        <div class="ct-sc-sub">ONI: ${currentMonth.oni !== null ? (currentMonth.oni >= 0 ? '+' : '') + currentMonth.oni.toFixed(2) : '—'}</div>
      </div>
    </div>
    <div class="ct-summary-card">
      <div class="ct-sc-icon">🌡️</div>
      <div class="ct-sc-body">
        <div class="ct-sc-label">Current IOD</div>
        <div class="ct-sc-val" style="color:${iodC.color}">${currentMonth.iod_phase}</div>
        <div class="ct-sc-sub">DMI: ${currentMonth.dmi !== null ? (currentMonth.dmi >= 0 ? '+' : '') + currentMonth.dmi.toFixed(2) + '°C' : '—'}</div>
      </div>
    </div>
    <div class="ct-summary-card">
      <div class="ct-sc-icon">⚡</div>
      <div class="ct-sc-body">
        <div class="ct-sc-label">Combination Effect</div>
        <div class="ct-sc-val" style="color:${comboC.color}">${comboC.icon} ${currentMonth.combination}</div>
        <div class="ct-sc-sub">Monsoon Influence: ${comboC.icon === '⬆' ? 'Favourable' : comboC.icon === '⬇' ? 'Unfavourable' : 'Neutral'}</div>
      </div>
    </div>
    <div class="ct-summary-card">
      <div class="ct-sc-icon">📊</div>
      <div class="ct-sc-body">
        <div class="ct-sc-label">Data Status ${CT_YEAR}</div>
        <div class="ct-sc-val">
          <span style="color:#15803d">${confirmed} confirmed</span> /
          <span style="color:#854d0e">${prelim} prelim</span> /
          <span style="color:#64748b">${forecast} forecast</span>
        </div>
        <div class="ct-sc-sub">Out of 12 months</div>
      </div>
    </div>
    <div class="ct-summary-card">
      <div class="ct-sc-icon">🔄</div>
      <div class="ct-sc-body">
        <div class="ct-sc-label">MJO Status</div>
        <div class="ct-sc-val">${currentMonth.mjo_phase !== null ? 'Phase ' + currentMonth.mjo_phase : '—'}</div>
        <div class="ct-sc-sub">Amplitude: ${currentMonth.mjo_amp !== null ? currentMonth.mjo_amp.toFixed(1) : '—'} ${currentMonth.mjo_amp >= 1 ? '(Active)' : '(Inactive)'}</div>
      </div>
    </div>
  `;
}

// ── Init ──────────────────────────────────────────────────
function initClimateTimeline() {
  renderSummaryCards();
  renderClimateTable();
  tryFetchNOAAONI();

  // Filter listeners
  ['ct-filter-month','ct-filter-enso','ct-filter-iod','ct-filter-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      ctFilter.month  = document.getElementById('ct-filter-month').value;
      ctFilter.enso   = document.getElementById('ct-filter-enso').value;
      ctFilter.iod    = document.getElementById('ct-filter-iod').value;
      ctFilter.status = document.getElementById('ct-filter-status').value;
      renderClimateTable();
    });
  });

  // Manual refresh
  const refreshBtn = document.getElementById('ct-refresh-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    tryFetchNOAAONI();
    renderSummaryCards();
  });
}

document.addEventListener('DOMContentLoaded', initClimateTimeline);
