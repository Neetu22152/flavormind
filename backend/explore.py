import pandas as pd

# Load dataset
df = pd.read_csv('data/RAW_recipes.csv')

# Basic exploration
print("Shape:", df.shape)
print("\nColumns:", df.columns.tolist())
print("\nFirst row:")
print(df.head(1))
print("\nMissing values:")
print(df.isnull().sum())