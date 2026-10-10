import pandas as pd


def extract_transaction_features(file_name, sample_size=None):
    print("Reading and filtering dataset...")
    cols = ['step', 'type', 'amount', 'nameOrig', 'nameDest', 'isFraud', 'oldbalanceOrg', 'newbalanceOrig']
    df = pd.read_csv(file_name, usecols=cols)


    df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])].reset_index(drop=True)

    if sample_size and len(df) > sample_size:
        print(f"Sampling {sample_size} records for faster processing...")
        df = df.iloc[:sample_size].copy()

    print("Engineering temporal and behavioral features...")
    df['hour_of_day'] = df['step'] % 24
    df['day'] = (df['step'] // 24) + 1
    df['balance_drained'] = ((df['oldbalanceOrg'] > 0) & (df['newbalanceOrig'] == 0)).astype(int)

    print("Constructing edge aggregation table...")
    edge_df = df.groupby(['nameOrig', 'nameDest']).agg(
        total_amount=('amount', 'sum'),
        avg_amount=('amount', 'mean'),
        transaction_count=('amount', 'count'),
        is_fraud_flag=('isFraud', 'max'),
        time_span=('step', lambda x: x.max() - x.min())
    ).reset_index()

    edge_df.to_csv("processed_transaction_edges.csv", index=False)
    print("Saved processed edges to 'processed_transaction_edges.csv'.")
    return edge_df


if __name__ == "__main__":

    csv_filename = "PS_20174392719_1491204439457_log.csv"
    extract_transaction_features(csv_filename, sample_size=200000)