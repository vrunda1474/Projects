import pandas as pd


def inspect_dataset(file_path):
    print("Loading dataset...")
    df = pd.read_csv(file_path)

    print("\n--- Dataset Shape ---")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")

    print("\n--- Column Names & Data Types ---")
    print(df.dtypes)

    print("\n--- First 5 Rows ---")
    print(df.head())

    print("\n--- Missing Values ---")
    print(df.isnull().sum())

    print("\n--- Transaction Types ---")
    print(df['type'].value_counts())


if __name__ == "__main__":
    csv_filename = "PS_20174392719_1491204439457_log.csv"
    inspect_dataset(csv_filename)