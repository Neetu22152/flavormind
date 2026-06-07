import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

def build_tfidf_model():
    print("Loading cleaned dataset...")
    df = pd.read_pickle('data/cleaned_recipes.pkl')

    # Use a sample of 50,000 for performance
    # Full 229k is too slow for cosine similarity matrix
    df = df.sample(50000, random_state=42).reset_index(drop=True)

    print("Building TF-IDF matrix...")
    tfidf = TfidfVectorizer(
        max_features=5000,    # top 5000 words
        stop_words='english', # remove common words like 'the', 'and'
        ngram_range=(1, 2)    # include single words and pairs like 'olive oil'
    )

    tfidf_matrix = tfidf.fit_transform(df['combined_text'])
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")

    # Save model and data
    os.makedirs('saved_models', exist_ok=True)

    with open('saved_models/tfidf_vectorizer.pkl', 'wb') as f:
        pickle.dump(tfidf, f)

    with open('saved_models/tfidf_matrix.pkl', 'wb') as f:
        pickle.dump(tfidf_matrix, f)

    # Save the sampled dataframe
    df.to_pickle('saved_models/tfidf_recipes.pkl')

    print("TF-IDF model saved successfully!")
    return df, tfidf_matrix

def get_similar_recipes(recipe_id, top_n=10):
    # Load saved model
    with open('saved_models/tfidf_vectorizer.pkl', 'rb') as f:
        tfidf = pickle.load(f)

    with open('saved_models/tfidf_matrix.pkl', 'rb') as f:
        tfidf_matrix = pickle.load(f)

    df = pd.read_pickle('saved_models/tfidf_recipes.pkl')

    # Find recipe index
    idx = df.index[df['id'] == recipe_id]

    if len(idx) == 0:
        return {"error": "Recipe not found"}

    idx = idx[0]

    # Calculate cosine similarity for this recipe only
    # We don't compute full matrix — too slow
    recipe_vector = tfidf_matrix[idx]
    similarity_scores = cosine_similarity(recipe_vector, tfidf_matrix).flatten()

    # Get top N similar recipes (excluding itself)
    similar_indices = similarity_scores.argsort()[::-1][1:top_n+1]

    results = []
    for i in similar_indices:
        results.append({
            'id': int(df.iloc[i]['id']),
            'name': df.iloc[i]['name'],
            'ingredients': df.iloc[i]['ingredients'],
            'minutes': int(df.iloc[i]['minutes']),
            'similarity_score': round(float(similarity_scores[i]), 4)
        })

    return results

if __name__ == "__main__":
    df, matrix = build_tfidf_model()

    # Test it with the first recipe
    test_id = int(df.iloc[0]['id'])
    print(f"\nTesting with recipe: {df.iloc[0]['name']}")
    print(f"Recipe ID: {test_id}")

    results = get_similar_recipes(test_id, top_n=5)
    print("\nTop 5 similar recipes:")
    for r in results:
        print(f"  - {r['name']} (similarity: {r['similarity_score']})")