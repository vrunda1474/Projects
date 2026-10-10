import shap
import pandas as pd
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt


def generate_shap_explanations(df, features_to_train, model_instance):
    """Generates exact mathematical explanations for the Coordination Score."""
    print("Calculating SHAP values for explainable AI...")
    X = df[features_to_train]


    explainer = shap.TreeExplainer(model_instance)
    shap_values = explainer.shap_values(X)


    anomalies = df[df['temporal_anomaly_flag'] == 1]
    if not anomalies.empty:
        worst_actor_idx = anomalies['coordination_score'].idxmax()
        worst_actor_id = df.loc[worst_actor_idx, 'account_id']

        print(f"Generating evidence for worst actor: {worst_actor_id}")

        
        shap.plots.waterfall(shap.Explanation(
            values=shap_values[worst_actor_idx],
            base_values=explainer.expected_value,
            data=X.iloc[worst_actor_idx],
            feature_names=features_to_train
        ), show=False)

        plt.savefig(f"evidence_{worst_actor_id}.png", bbox_inches='tight')
        print(f"Saved explainable evidence chart to 'evidence_{worst_actor_id}.png'")

