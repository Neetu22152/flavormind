import pandas as pd
import numpy as np
import pickle
from tfidf_model import get_similar_recipes
from kmeans_model import get_cluster_recommendations
from collaborative_model import get_collaborative_recommendations
def get_hybrid_recommendations(recipe_id, user_id=None, top_n=10):
    """
    Combines all 3 algorithms:
    - 40% Collaborative Filtering (personalized)
    - 40% TF-IDF Content Based (similar recipes)
    - 20% K-Means Clustering (diverse suggestions)
    
    If no user_id provided, falls back to 60% TF-IDF + 40% K-Means
    """
    
    results = {
        'recipe_id': recipe_id,
        'user_id': user_id,
        'algorithms': {}
    }
    
    # --- Algorithm 1: TF-IDF ---
    print("Running TF-IDF recommendations...")
    try:
        tfidf_results = get_similar_recipes(recipe_id, top_n=top_n)
        if isinstance(tfidf_results, list):
            results['algorithms']['tfidf'] = tfidf_results
        else:
            results['algorithms']['tfidf'] = []
    except Exception as e:
        print(f"TF-IDF error: {e}")
        results['algorithms']['tfidf'] = []

    # --- Algorithm 2: K-Means ---
    print("Running K-Means recommendations...")
    try:
        kmeans_results = get_cluster_recommendations(recipe_id, top_n=top_n)
        if 'recommendations' in kmeans_results:
            results['algorithms']['kmeans'] = kmeans_results['recommendations']
            results['cluster_label'] = kmeans_results.get('cluster_label', '')
        else:
            results['algorithms']['kmeans'] = []
    except Exception as e:
        print(f"K-Means error: {e}")
        results['algorithms']['kmeans'] = []

    # --- Algorithm 3: Collaborative Filtering ---
    if user_id:
        print("Running Collaborative Filtering recommendations...")
        try:
            collab_results = get_collaborative_recommendations(user_id, top_n=top_n)
            if isinstance(collab_results, list):
                results['algorithms']['collaborative'] = collab_results
            else:
                results['algorithms']['collaborative'] = []
        except Exception as e:
            print(f"Collaborative error: {e}")
            results['algorithms']['collaborative'] = []
    else:
        results['algorithms']['collaborative'] = []

    # --- Combine results with scoring ---
    print("Combining results...")
    scores = {}

    # Score TF-IDF results
    tfidf_weight = 0.4 if user_id else 0.6
    for i, recipe in enumerate(results['algorithms']['tfidf']):
        rid = recipe['id']
        similarity = recipe.get('similarity_score', 0)
        scores[rid] = scores.get(rid, 0) + (tfidf_weight * similarity * 10)

    # Score K-Means results
    kmeans_weight = 0.2 if user_id else 0.4
    kmeans_count = len(results['algorithms']['kmeans'])
    for i, recipe in enumerate(results['algorithms']['kmeans']):
        rid = recipe['id']
        position_score = (kmeans_count - i) / kmeans_count
        scores[rid] = scores.get(rid, 0) + (kmeans_weight * position_score * 10)

    # Score Collaborative results
    if user_id:
        for i, recipe in enumerate(results['algorithms']['collaborative']):
            rid = recipe['id']
            predicted_rating = recipe.get('predicted_rating', 0)
            scores[rid] = scores.get(rid, 0) + (0.4 * predicted_rating * 2)

    # Sort by score and get top N
    sorted_recipes = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    # Load recipe details for final results
    df = pd.read_pickle('data/cleaned_recipes.pkl')

    final_recommendations = []
    for rid, score in sorted_recipes:
        recipe = df[df['id'] == rid]
        if len(recipe) > 0:
            final_recommendations.append({
                'id': int(rid),
                'name': recipe.iloc[0]['name'],
                'ingredients': recipe.iloc[0]['ingredients'],
                'minutes': int(recipe.iloc[0]['minutes']),
                'hybrid_score': round(score, 4)
            })

    results['hybrid_recommendations'] = final_recommendations

    return results


if __name__ == "__main__":
    # Load a test recipe and user
    df = pd.read_pickle('data/cleaned_recipes.pkl')
    
    with open('saved_models/interactions.pkl', 'rb') as f:
        import pickle
        interactions = pickle.load(f)

    test_recipe_id = 200658  # warren's meatloaf
    test_user_id = int(interactions['user_id'].iloc[0])

    print(f"Testing hybrid recommender...")
    print(f"Recipe ID: {test_recipe_id}")
    print(f"User ID: {test_user_id}")
    print("=" * 50)

    results = get_hybrid_recommendations(
        recipe_id=test_recipe_id,
        user_id=test_user_id,
        top_n=5
    )

    print(f"\nCluster: {results.get('cluster_label', 'N/A')}")
    
    print("\n--- TF-IDF Results ---")
    for r in results['algorithms']['tfidf'][:3]:
        print(f"  - {r['name']} (similarity: {r['similarity_score']})")

    print("\n--- K-Means Results ---")
    for r in results['algorithms']['kmeans'][:3]:
        print(f"  - {r['name']}")

    print("\n--- Collaborative Results ---")
    for r in results['algorithms']['collaborative'][:3]:
        print(f"  - {r['name']} (predicted: {r['predicted_rating']})")

    print("\n--- HYBRID Results (final) ---")
    for r in results['hybrid_recommendations']:
        print(f"  - {r['name']} (score: {r['hybrid_score']})")