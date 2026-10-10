import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


def plot_temporal_anomalies(file_path):
    """Generates a time-series chart showing ARIMA predictions vs actual volume."""
    df = pd.read_csv(file_path)

    fig = go.Figure()

    # Actual Volume Line
    fig.add_trace(go.Scatter(x=df['step'], y=df['amount'], mode='lines', name='Actual Volume', line=dict(color='blue')))

    # ARIMA Predicted Volume Line
    fig.add_trace(go.Scatter(x=df['step'], y=df['predicted_volume'], mode='lines', name='Expected (ARIMA)',
                             line=dict(color='gray', dash='dash')))

    # Highlight Anomalies (Z-Score > 3)
    anomalies = df[df['temporal_anomaly_flag'] == 1]
    fig.add_trace(
        go.Scatter(x=anomalies['step'], y=anomalies['amount'], mode='markers', name='Coordinated Burst (Anomaly)',
                   marker=dict(color='red', size=10, symbol='x')))

    fig.update_layout(title="Temporal Analysis: Transaction Volume Bursts", xaxis_title="Time Step (Hours)",
                      yaxis_title="Total Transaction Amount", template="plotly_white")
    fig.write_html("dashboard_chart_temporal.html")
    print("Generated Temporal Chart: Open 'dashboard_chart_temporal.html' in your browser.")


def plot_coordination_scores(file_path):
    """Generates a scatter plot of accounts flagged by the Isolation Forest."""
    df = pd.read_csv(file_path)

    # Filter for suspicious accounts (e.g., Score > 80) to keep the chart readable
    suspicious_df = df[df['coordination_score'] > 80]

    fig = px.scatter(
        suspicious_df,
        x="in_degree",
        y="out_degree",
        size="coordination_score",
        color="anomaly_label",
        hover_data=['account_id', 'community_id', 'total_sent'],
        title="Anomaly Detection: High Coordination Score Accounts",
        labels={"in_degree": "Incoming Transactions", "out_degree": "Outgoing Transactions"},
        template="plotly_dark"
    )
    fig.write_html("dashboard_chart_scores.html")
    print("Generated Scores Chart: Open 'dashboard_chart_scores.html' in your browser.")


if __name__ == "__main__":
    plot_temporal_anomalies("arima_temporal_anomalies.csv")
    plot_coordination_scores("final_coordination_scores.csv")