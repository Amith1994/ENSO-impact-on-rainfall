import os
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Set style
try:
    plt.style.use('seaborn-v0_8-whitegrid')
except Exception:
    try:
        plt.style.use('seaborn-whitegrid')
    except Exception:
        pass

# Configure default parameters for publication quality
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Arial', 'Helvetica', 'DejaVu Sans'],
    'axes.labelsize': 11,
    'axes.titlesize': 13,
    'xtick.labelsize': 9,
    'ytick.labelsize': 9,
    'figure.titlesize': 15,
    'legend.fontsize': 10,
    'figure.autolayout': True
})

# Curated harmonious color palette for the 9 categories
PHASE_COLORS = {
    'El Niño - Positive': '#d73027',    # Strong Red
    'El Niño - Neutral': '#f46d43',     # Light Red/Orange
    'El Niño - Negative': '#fdae61',    # Light Orange
    'La Niña - Positive': '#abd9e9',    # Light Blue
    'La Niña - Neutral': '#74add1',     # Medium Blue
    'La Niña - Negative': '#4575b4',    # Dark Blue
    'Neutral - Positive': '#fee090',    # Yellowish
    'Neutral - Neutral': '#e0e0e0',     # Light Gray
    'Neutral - Negative': '#b8e186'     # Greenish
}

# Months list
MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

# ---------------------------------------------------------------------------
# Quality toggle
#   'fast'  → only 300 dpi PNG  (default – much faster)
#   'full'  → PDF + SVG + PNG 300/600 dpi + TIFF 300/600 dpi (publication)
# Override at runtime by setting env var: ENSO_SAVE_QUALITY=full
# ---------------------------------------------------------------------------
SAVE_QUALITY = os.environ.get('ENSO_SAVE_QUALITY', 'fast')

def save_publication_plot(fig, base_path, quality=None):
    """
    Saves the figure to disk.

    quality='fast' (default) → one PNG at 300 dpi.  Fast enough for review.
    quality='full'           → PDF + SVG + PNG 300/600 dpi + TIFF 300/600 dpi
                               (use for final publication output).

    The module-level SAVE_QUALITY variable sets the default; individual
    callers can override by passing the quality argument explicitly.
    """
    if quality is None:
        quality = SAVE_QUALITY

    parent = os.path.dirname(base_path)
    if parent:
        os.makedirs(parent, exist_ok=True)

    if quality == 'full':
        # Vector formats (resolution-independent)
        fig.savefig(f"{base_path}.pdf", format='pdf')
        fig.savefig(f"{base_path}.svg", format='svg')
        # Raster at 300 and 600 dpi
        fig.savefig(f"{base_path}_300dpi.png", format='png', dpi=300)
        fig.savefig(f"{base_path}_600dpi.png", format='png', dpi=600)
        fig.savefig(f"{base_path}_300dpi.tiff", format='tiff', dpi=300)
        fig.savefig(f"{base_path}_600dpi.tiff", format='tiff', dpi=600)
    else:
        # Fast mode: single high-quality PNG
        fig.savefig(f"{base_path}_300dpi.png", format='png', dpi=300, bbox_inches='tight')

def plot_monthly_bar_comparison(monthly_summary, district, output_dir):
    """
    Bar chart: Average rainfall by ENSO phase for each month.
    """
    df_dist = monthly_summary[monthly_summary['District'] == district].copy()
    if df_dist.empty:
        return
        
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Pivot for grouping
    pivot_df = df_dist.pivot(index='Month', columns='ENSO_Phase', values='Mean')
    # Reindex months 1-12
    pivot_df = pivot_df.reindex(range(1, 13))
    pivot_df.index = MONTH_NAMES
    
    # Plot bars
    pivot_df.plot(kind='bar', ax=ax, color=[PHASE_COLORS.get(col, '#999999') for col in pivot_df.columns], width=0.8)
    
    ax.set_title(f"Monthly Average Rainfall by ENSO/IOD Phase - {district}", weight='bold')
    ax.set_xlabel("Months")
    ax.set_ylabel("Average Rainfall (mm)")
    ax.legend(title="ENSO - IOD Phase", bbox_to_anchor=(1.05, 1), loc='upper left')
    
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Monthly', f"{district}_monthly_bar_comparison"))
    plt.close(fig)

def plot_monthly_anomaly_line(monthly_df, district, output_dir):
    """
    Line graph: Monthly rainfall anomaly (Departure %) over time.
    """
    df_dist = monthly_df[monthly_df['District'] == district].copy()
    if df_dist.empty:
        return
        
    # Sort chronologically
    df_dist['Date_Group'] = df_dist['Year'] + (df_dist['Month'] - 0.5) / 12.0
    df_dist = df_dist.sort_values('Date_Group')
    
    fig, ax = plt.subplots(figsize=(12, 5))
    
    # Anomaly values (Actual - Normal)
    df_dist['Anomaly'] = df_dist['Actual'] - df_dist['Normal']
    
    # Plot positive and negative anomalies with different colors
    years = df_dist['Year'] + (df_dist['Month'] - 1) / 12.0
    anom_vals = df_dist['Anomaly'].values
    
    ax.fill_between(years, anom_vals, 0, where=(anom_vals >= 0), color='#2c7bb6', alpha=0.6, label='Positive Anomaly')
    ax.fill_between(years, anom_vals, 0, where=(anom_vals < 0), color='#d7191c', alpha=0.6, label='Negative Anomaly')
    
    ax.axhline(0, color='black', linewidth=1, linestyle='--')
    ax.set_title(f"Monthly Rainfall Anomaly (mm) Time Series (1981–2015) - {district}", weight='bold')
    ax.set_xlabel("Year")
    ax.set_ylabel("Rainfall Anomaly (mm)")
    ax.legend()
    
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Monthly', f"{district}_monthly_anomaly_line"))
    plt.close(fig)

def plot_monthly_boxplot_violin(monthly_df, district, output_dir):
    """
    Boxplot and Violin plot: Monthly rainfall distributions across ENSO phases.
    """
    df_dist = monthly_df.copy()
    if district != 'State':
        df_dist = df_dist[df_dist['District'] == district]
        
    if df_dist.empty:
        return
        
    # Boxplot
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.boxplot(data=df_dist, x='ENSO_Phase', y='Actual', ax=ax, palette=PHASE_COLORS)
    ax.set_title(f"Distribution of Monthly Rainfall by ENSO/IOD Phase - {district}", weight='bold')
    ax.set_xlabel("ENSO - IOD Phase")
    ax.set_ylabel("Monthly Rainfall (mm)")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Monthly', f"{district}_monthly_boxplot"))
    plt.close(fig)
    
    # Violin plot
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.violinplot(data=df_dist, x='ENSO_Phase', y='Actual', ax=ax, palette=PHASE_COLORS, inner='quartile')
    ax.set_title(f"Violin Plot of Monthly Rainfall by ENSO/IOD Phase - {district}", weight='bold')
    ax.set_xlabel("ENSO - IOD Phase")
    ax.set_ylabel("Monthly Rainfall (mm)")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Monthly', f"{district}_monthly_violin"))
    plt.close(fig)

def plot_monthly_heatmap(monthly_summary, district, output_dir):
    """
    Heatmap: Months × ENSO phase (showing Mean Departure %).
    """
    df_dist = monthly_summary[monthly_summary['District'] == district].copy()
    if df_dist.empty:
        return
        
    # Pivot
    pivot_df = df_dist.pivot(index='Month', columns='ENSO_Phase', values='Departure')
    pivot_df = pivot_df.reindex(range(1, 13))
    pivot_df.index = MONTH_NAMES
    
    fig, ax = plt.subplots(figsize=(10, 7))
    # Diverging colormap for departure (blue is excess, red is deficit)
    sns.heatmap(pivot_df, annot=True, fmt=".1f", cmap='RdBu', center=0.0, ax=ax, cbar_kws={'label': 'Mean Departure (%)'})
    
    ax.set_title(f"Rainfall Departure Heatmap (Month vs ENSO Phase) - {district}", weight='bold')
    ax.set_xlabel("ENSO - IOD Phase")
    ax.set_ylabel("Months")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Monthly', f"{district}_monthly_heatmap"))
    plt.close(fig)

def plot_weekly_ribbon_anomaly(weekly_df, district, output_dir):
    """
    Ribbon and line plots for Standard Meteorological Weeks (SMW).
    """
    df_dist = weekly_df[weekly_df['District'] == district].copy()
    if df_dist.empty:
        return
        
    # Anomaly values (Actual - Normal)
    df_dist['Anomaly'] = df_dist['Actual'] - df_dist['Normal']
    
    # 1. Weekly Line plot (Mean weekly rainfall)
    fig, ax = plt.subplots(figsize=(10, 5))
    weekly_mean = df_dist.groupby('SMW')['Actual'].mean()
    weekly_std = df_dist.groupby('SMW')['Actual'].std().fillna(0.0)
    
    ax.plot(weekly_mean.index, weekly_mean.values, color='#1f77b4', label='Mean Rainfall', linewidth=2)
    # Ribbon (Mean +/- SD)
    ax.fill_between(weekly_mean.index, np.maximum(0, weekly_mean.values - weekly_std.values), 
                    weekly_mean.values + weekly_std.values, color='#1f77b4', alpha=0.2, label='Mean ± 1 SD')
    
    ax.set_title(f"Weekly Mean Rainfall Ribbon Plot (SMW 1–52) - {district}", weight='bold')
    ax.set_xlabel("Standard Meteorological Week (SMW)")
    ax.set_ylabel("Rainfall (mm)")
    ax.set_xlim(1, 52)
    ax.legend()
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Weekly', f"{district}_weekly_ribbon"))
    plt.close(fig)
    
    # 2. Weekly Anomaly plot
    fig, ax = plt.subplots(figsize=(12, 5))
    # Pivot anomalies by Year and Week
    anom_pivot = df_dist.pivot(index='Year', columns='SMW', values='Anomaly').mean(axis=0)
    
    ax.bar(anom_pivot.index, anom_pivot.values, color=['#2c7bb6' if v >= 0 else '#d7191c' for v in anom_pivot.values], alpha=0.8)
    ax.axhline(0, color='black', linewidth=0.8, linestyle='--')
    ax.set_title(f"Average Weekly Rainfall Anomaly (SMW) - {district}", weight='bold')
    ax.set_xlabel("SMW")
    ax.set_ylabel("Anomaly (mm)")
    ax.set_xlim(0.5, 52.5)
    plt.tight_layout()
    save_publication_plot(fig, os.path.join(output_dir, 'Weekly', f"{district}_weekly_anomaly_bar"))
    plt.close(fig)

def plot_seasonal_annual_boxplots(seasonal_df, annual_df, district, output_dir):
    """
    Generates Boxplot, Violin, and Bar charts for SW Monsoon, NE Monsoon, and Annual scales.
    """
    # 1. Seasonal Plots (SW & NE Monsoons)
    df_seas = seasonal_df.copy()
    if district != 'State':
        df_seas = df_seas[df_seas['District'] == district]
        
    if not df_seas.empty:
        for season in ['SW Monsoon', 'NE Monsoon']:
            df_sub = df_seas[df_seas['Season'] == season]
            if df_sub.empty:
                continue
                
            folder_name = season.replace(' ', '_')
            
            # Boxplot
            fig, ax = plt.subplots(figsize=(10, 6))
            sns.boxplot(data=df_sub, x='ENSO_Phase', y='Actual', ax=ax, palette=PHASE_COLORS)
            ax.set_title(f"{season} Rainfall Distribution by ENSO/IOD Phase - {district}", weight='bold')
            ax.set_xlabel("ENSO - IOD Phase")
            ax.set_ylabel("Seasonal Rainfall (mm)")
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            save_publication_plot(fig, os.path.join(output_dir, 'Seasonal', f"{district}_{folder_name}_boxplot"))
            plt.close(fig)
            
            # Violin plot
            fig, ax = plt.subplots(figsize=(10, 6))
            sns.violinplot(data=df_sub, x='ENSO_Phase', y='Actual', ax=ax, palette=PHASE_COLORS, inner='quartile')
            ax.set_title(f"{season} Violin Plot by ENSO/IOD Phase - {district}", weight='bold')
            ax.set_xlabel("ENSO - IOD Phase")
            ax.set_ylabel("Seasonal Rainfall (mm)")
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            save_publication_plot(fig, os.path.join(output_dir, 'Seasonal', f"{district}_{folder_name}_violin"))
            plt.close(fig)
            
            # Bar plot of Mean seasonal rainfall
            fig, ax = plt.subplots(figsize=(10, 5))
            mean_df = df_sub.groupby('ENSO_Phase')['Actual'].mean().reset_index()
            sns.barplot(data=mean_df, x='ENSO_Phase', y='Actual', ax=ax, palette=PHASE_COLORS)
            ax.set_title(f"Average {season} Rainfall by ENSO/IOD Phase - {district}", weight='bold')
            ax.set_xlabel("ENSO - IOD Phase")
            ax.set_ylabel("Rainfall (mm)")
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            save_publication_plot(fig, os.path.join(output_dir, 'Seasonal', f"{district}_{folder_name}_bar"))
            plt.close(fig)
            
    # 2. Annual Plot
    df_ann = annual_df.copy()
    if district != 'State':
        df_ann = df_ann[df_ann['District'] == district]
        
    if not df_ann.empty:
        fig, ax = plt.subplots(figsize=(10, 5))
        mean_ann = df_ann.groupby('ENSO_Phase')['Actual'].mean().reset_index()
        sns.barplot(data=mean_ann, x='ENSO_Phase', y='Actual', ax=ax, palette=PHASE_COLORS)
        ax.set_title(f"Average Annual Rainfall by ENSO/IOD Phase - {district}", weight='bold')
        ax.set_xlabel("ENSO - IOD Phase")
        ax.set_ylabel("Annual Rainfall (mm)")
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        save_publication_plot(fig, os.path.join(output_dir, 'Annual', f"{district}_annual_bar"))
        plt.close(fig)
