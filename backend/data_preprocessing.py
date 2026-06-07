import pandas as pd
import ast

# Load dataset
df = pd.read_csv('data/RAW_recipes.csv')

print("Original shape:", df.shape)

# Step 1 — Drop missing names (only 1 row, safe to drop)
df = df.dropna(subset=['name'])

# Step 2 — Fill missing descriptions with empty string
df['description'] = df['description'].fillna('')

# Step 3 — Convert ingredients from string to actual list
# In the CSV they're stored as strings like "['butter', 'eggs']"
df['ingredients'] = df['ingredients'].apply(ast.literal_eval)

# Step 4 — Convert tags from string to actual list
df['tags'] = df['tags'].apply(ast.literal_eval)

# Step 5 — Create a combined text field for TF-IDF
# This merges name + ingredients + description into one string
df['combined_text'] = (
    df['name'] + ' ' +
    df['ingredients'].apply(lambda x: ' '.join(x)) + ' ' +
    df['description']
)

# Step 6 — Remove recipes with unrealistic cooking times
# Over 1440 minutes (24 hours) are likely data errors
df = df[df['minutes'] <= 1440]

# Step 7 — Reset index
df = df.reset_index(drop=True)

# Step 8 — Save cleaned dataset
df.to_pickle('data/cleaned_recipes.pkl')

print("Cleaned shape:", df.shape)
print("\nSample combined_text:")
print(df['combined_text'][0])
print("\nSample ingredients (as list):")
print(df['ingredients'][0])
print("\nSample tags (as list):")
print(df['tags'][0])
print("\nCleaning complete! Saved to data/cleaned_recipes.pkl")