import pandas as pd
import numpy as np
import scipy.stats as stats
import statsmodels.api as sm
import pymannkendall as mk
import logging

logger = logging.getLogger(__name__)

# Numeric encodings for correlation/regression
ENSO_ENCODING = {'El Niño': 1, 'Neutral': 0, 'La Niña': -1}
# Support different spelling from file (like El Niño with or without accent)
ENSO_CLEAN = {
    'el niño': 1, 'el nio': 1, 'neutral': 0, 'la niña': -1, 'la nia': -1
}

IOD_ENCODING = {'Positive': 1, 'Neutral': 0, 'Negative': -1}

def get_numeric_codes(enso_phase_str):
    """
    Parses ENSO_Phase category string (e.g. 'El Niño - Positive')
    into numeric codes: (enso_code, iod_code).
    """
    parts = enso_phase_str.split('-')
    enso_part = parts[0].strip().lower()
    iod_part = parts[1].strip() if len(parts) > 1 else 'Neutral'
    
    # Parse ENSO
    enso_code = 0
    for key, val in ENSO_CLEAN.items():
        if key in enso_part:
            enso_code = val
            break
            
    # Parse IOD
    iod_code = IOD_ENCODING.get(iod_part, 0)
    
    return enso_code, iod_code

def run_group_tests(df, val_col='Actual', group_col='ENSO_Phase'):
    """
    Runs Oneway ANOVA and Kruskal-Wallis tests on val_col grouped by group_col.
    Handles groups with too few values.
    """
    groups = df.groupby(group_col)[val_col].apply(list).to_dict()
    # Need at least 2 groups with at least 2 values each
    valid_groups = [g for g in groups.values() if len(g) > 1]
    
    if len(valid_groups) < 2:
        return {
            'anova_f': np.nan, 'anova_p': np.nan,
            'kw_h': np.nan, 'kw_p': np.nan
        }
        
    try:
        anova_f, anova_p = stats.f_oneway(*valid_groups)
    except Exception:
        anova_f, anova_p = np.nan, np.nan
        
    try:
        kw_h, kw_p = stats.kruskal(*valid_groups)
    except Exception:
        kw_h, kw_p = np.nan, np.nan
        
    return {
        'anova_f': anova_f, 'anova_p': anova_p,
        'kw_h': kw_h, 'kw_p': kw_p
    }

def run_pairwise_tests(df, val_col='Actual', group_col='ENSO_Phase'):
    """
    Runs pairwise t-tests and Mann-Whitney U tests between all group pairs.
    """
    groups = df.groupby(group_col)[val_col].apply(list).to_dict()
    group_names = sorted(list(groups.keys()))
    results = []
    
    for i in range(len(group_names)):
        for j in range(i+1, len(group_names)):
            g1, g2 = group_names[i], group_names[j]
            x1, x2 = groups[g1], groups[g2]
            
            if len(x1) < 2 or len(x2) < 2:
                continue
                
            # Pairwise T-test
            try:
                t_stat, t_p = stats.ttest_ind(x1, x2, equal_var=False)
            except Exception:
                t_stat, t_p = np.nan, np.nan
                
            # Pairwise Mann-Whitney U
            try:
                u_stat, u_p = stats.mannwhitneyu(x1, x2, alternative='two-sided')
            except Exception:
                u_stat, u_p = np.nan, np.nan
                
            results.append({
                'Group1': g1,
                'Group2': g2,
                'T_Stat': t_stat,
                'T_p': t_p,
                'U_Stat': u_stat,
                'U_p': u_p
            })
            
    return pd.DataFrame(results)

def run_correlation_and_regression(df, enso_map, val_col='Actual'):
    """
    Computes Pearson/Spearman correlation and runs OLS regression
    using encoded ENSO and IOD values.
    """
    # Create temp df with numeric codes
    temp = df.copy()
    temp['ENSO_Phase'] = temp['Year'].map(enso_map)
    
    codes = [get_numeric_codes(str(cat)) for cat in temp['ENSO_Phase']]
    temp['ENSO_Code'] = [c[0] for c in codes]
    temp['IOD_Code'] = [c[1] for c in codes]
    
    # Correlation
    try:
        p_corr_enso, p_p_enso = stats.pearsonr(temp['ENSO_Code'], temp[val_col])
        s_corr_enso, s_p_enso = stats.spearmanr(temp['ENSO_Code'], temp[val_col])
    except Exception:
        p_corr_enso, p_p_enso = np.nan, np.nan
        s_corr_enso, s_p_enso = np.nan, np.nan
        
    try:
        p_corr_iod, p_p_iod = stats.pearsonr(temp['IOD_Code'], temp[val_col])
        s_corr_iod, s_p_iod = stats.spearmanr(temp['IOD_Code'], temp[val_col])
    except Exception:
        p_corr_iod, p_p_iod = np.nan, np.nan
        s_corr_iod, s_p_iod = np.nan, np.nan
        
    # Regression: val_col ~ ENSO_Code + IOD_Code
    try:
        X = sm.add_constant(temp[['ENSO_Code', 'IOD_Code']])
        model = sm.OLS(temp[val_col], X).fit()
        r2 = model.rsquared
        p_const = model.pvalues.get('const', np.nan)
        p_enso = model.pvalues.get('ENSO_Code', np.nan)
        p_iod = model.pvalues.get('IOD_Code', np.nan)
        coef_enso = model.params.get('ENSO_Code', np.nan)
        coef_iod = model.params.get('IOD_Code', np.nan)
    except Exception as e:
        logger.error(f"OLS Regression error: {e}")
        r2 = p_const = p_enso = p_iod = coef_enso = coef_iod = np.nan
        
    return {
        'pearson_enso': p_corr_enso, 'pearson_enso_p': p_p_enso,
        'spearman_enso': s_corr_enso, 'spearman_enso_p': s_p_enso,
        'pearson_iod': p_corr_iod, 'pearson_iod_p': p_p_iod,
        'spearman_iod': s_corr_iod, 'spearman_iod_p': s_p_iod,
        'r2': r2,
        'coef_enso': coef_enso, 'p_enso': p_enso,
        'coef_iod': coef_iod, 'p_iod': p_iod
    }

def run_mann_kendall_trend(years, values):
    """
    Performs Mann-Kendall Trend Test and Sen's Slope Estimation.
    Returns trend status, p-value, Sen's slope, and significance level.
    """
    # Sort by years
    sorted_idx = np.argsort(years)
    y_sorted = np.array(years)[sorted_idx]
    v_sorted = np.array(values)[sorted_idx]
    
    try:
        res = mk.original_test(v_sorted)
        # res has attributes: trend, h, p, z, Tau, s, var_s, slope, intercept
        trend = res.trend # 'increasing', 'decreasing', 'no trend'
        p_val = res.p
        slope = res.slope
        
        # Determine significance levels
        sig_95 = p_val < 0.05
        sig_99 = p_val < 0.01
        
        if sig_99:
            sig_text = '99% Significance'
        elif sig_95:
            sig_text = '95% Significance'
        else:
            sig_text = 'Not Significant'
            
        return {
            'trend': trend,
            'p_value': p_val,
            'sens_slope': slope,
            'significance': sig_text,
            'h': res.h
        }
    except Exception as e:
        logger.error(f"Mann-Kendall test error: {e}")
        return {
            'trend': 'Error',
            'p_value': np.nan,
            'sens_slope': np.nan,
            'significance': 'N/A',
            'h': False
        }
