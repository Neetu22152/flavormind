import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
import pickle
import os

def build_kmeans_model(n_clusters=15):
    print("Loading cleaned dataset...")
    df = pd.read_pickle('data/cleaned_recipes.pkl')
    df = df.sample(50000, random_state=42).reset_index(drop=True)

    print("Building TF-IDF matrix...")
    tfidf = TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2)
    )
    tfidf_matrix = tfidf.fit_transform(df['combined_text'])

    # Reduce dimensions before clustering for performance
    print("Reducing dimensions with SVD...")
    svd = TruncatedSVD(n_components=100, random_state=42)
    reduced_matrix = svd.fit_transform(tfidf_matrix)

    print(f"Running K-Means with {n_clusters} clusters...")
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(reduced_matrix)

    # Label each cluster by its most common tags
    print("\nCluster labels based on top tags:")
    cluster_labels = {}
    for cluster_id in range(n_clusters):
        cluster_recipes = df[df['cluster'] == cluster_id]
        # Flatten all tags in this cluster
        all_tags = []
        for tags in cluster_recipes['tags']:
            all_tags.extend(tags)
        # Find most common meaningful tags
        from collections import Counter
        tag_counts = Counter(all_tags)
        # Remove generic tags
        generic = {'time-to-make','course','main-ingredient','preparation',
                   'occasion','dietary','easy','equipment'}
        top_tags = [t for t, _ in tag_counts.most_common(20) if t not in generic][:3]
        label = ' | '.join(top_tags)
        cluster_labels[cluster_id] = label
        print(f"  Cluster {cluster_id}: {label} ({len(cluster_recipes)} recipes)")

    # Save everything
    os.makedirs('saved_models', exist_ok=True)
    with open('saved_models/kmeans_model.pkl', 'wb') as f:
        pickle.dump(kmeans, f)
    with open('saved_models/svd_model.pkl', 'wb') as f:
        pickle.dump(svd, f)
    with open('saved_models/tfidf_kmeans.pkl', 'wb') as f:
        pickle.dump(tfidf, f)

    df.to_pickle('saved_models/kmeans_recipes.pkl')

    with open('saved_models/cluster_labels.pkl', 'wb') as f:
        pickle.dump(cluster_labels, f)

    print("\nK-Means model saved successfully!")
    return df, cluster_labels

def get_cluster_recommendations(recipe_id, top_n=10):
    with open('saved_models/kmeans_model.pkl', 'rb') as f:
        kmeans = pickle.load(f)
    with open('saved_models/svd_model.pkl', 'rb') as f:
        svd = pickle.load(f)
    with open('saved_models/tfidf_kmeans.pkl', 'rb') as f:
        tfidf = pickle.load(f)
    with open('saved_models/cluster_labels.pkl', 'rb') as f:
        cluster_labels = pickle.load(f)

    df = pd.read_pickle('saved_models/kmeans_recipes.pkl')

    idx = df.index[df['id'] == recipe_id]
    if len(idx) == 0:
        return {"error": "Recipe not found"}

    idx = idx[0]
    cluster_id = df.iloc[idx]['cluster']

    # Get recipes from same cluster excluding itself
    cluster_recipes = df[
        (df['cluster'] == cluster_id) & (df['id'] != recipe_id)
    ].sample(min(top_n, len(df[df['cluster'] == cluster_id]) - 1), random_state=42)

    results = {
        'cluster_id': int(cluster_id),
        'cluster_label': cluster_labels[cluster_id],
        'recommendations': []
    }

    for _, row in cluster_recipes.iterrows():
        results['recommendations'].append({
            'id': int(row['id']),
            'name': row['name'],
            'ingredients': row['ingredients'],
            'minutes': int(row['minutes']),
            'cluster': int(row['cluster'])
        })

    return results

if __name__ == "__main__":
    df, labels = build_kmeans_model()

    # Test with first recipe
    test_id = int(df.iloc[0]['id'])
    print(f"\nTesting with recipe: {df.iloc[0]['name']}")
    results = get_cluster_recommendations(test_id, top_n=5)
    print(f"Cluster: {results['cluster_label']}")
    print("Recommendations from same cluster:")
    for r in results['recommendations']:
        print(f"  - {r['name']} ({r['minutes']} mins)")