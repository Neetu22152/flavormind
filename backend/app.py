from flask import Flask, jsonify, request
from flask_cors import CORS

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import pickle
from models.tfidf_model import get_similar_recipes
from models.kmeans_model import get_cluster_recommendations
from models.collaborative_model import get_collaborative_recommendations


app = Flask(__name__)
CORS(app)

# ── Health check ──
@app.route('/')
def home():
    return jsonify({
        'message': 'FlavorMind API is running!',
        'endpoints': [
            '/api/recipes/search?q=chicken',
            '/api/recommend/similar/<recipe_id>',
            '/api/recommend/cluster/<recipe_id>',
            '/api/recommend/personal/<user_id>',
            '/api/recommend/hybrid/<recipe_id>?user_id=<user_id>'
        ]
    })

# ── Search recipes ──
@app.route('/api/recipes/search')
def search_recipes():
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))

    if not query:
        return jsonify({'error': 'Query parameter q is required'}), 400

    import pandas as pd
    df = pd.read_pickle('data/cleaned_recipes.pkl')

    # Simple search by name
    mask = df['name'].str.contains(query.lower(), case=False, na=False)
    results = df[mask].head(limit)

    recipes = []
    for _, row in results.iterrows():
        recipes.append({
            'id': int(row['id']),
            'name': row['name'],
            'ingredients': row['ingredients'],
            'minutes': int(row['minutes']),
            'n_steps': int(row['n_steps']),
            'tags': row['tags']
        })

    return jsonify({
        'query': query,
        'count': len(recipes),
        'results': recipes
    })

# ── TF-IDF similar recipes ──
@app.route('/api/recommend/similar/<int:recipe_id>')
def similar_recipes(recipe_id):
    top_n = int(request.args.get('top_n', 10))
    results = get_similar_recipes(recipe_id, top_n=top_n)
    return jsonify({
        'recipe_id': recipe_id,
        'algorithm': 'TF-IDF Cosine Similarity',
        'recommendations': results
    })

# ── K-Means cluster recipes ──
@app.route('/api/recommend/cluster/<int:recipe_id>')
def cluster_recipes(recipe_id):
    top_n = int(request.args.get('top_n', 10))
    results = get_cluster_recommendations(recipe_id, top_n=top_n)
    return jsonify({
        'recipe_id': recipe_id,
        'algorithm': 'K-Means Clustering',
        'cluster_label': results.get('cluster_label', ''),
        'recommendations': results.get('recommendations', [])
    })

# ── Collaborative filtering ──
@app.route('/api/recommend/personal/<int:user_id>')
def personal_recipes(user_id):
    top_n = int(request.args.get('top_n', 10))
    results = get_collaborative_recommendations(user_id, top_n=top_n)
    return jsonify({
        'user_id': user_id,
        'algorithm': 'Collaborative Filtering (SVD)',
        'recommendations': results
    })

# ── Hybrid recommendations ──
@app.route('/api/recommend/hybrid/<int:recipe_id>')
def hybrid_recipes(recipe_id):
    user_id = request.args.get('user_id')
    top_n = int(request.args.get('top_n', 10))

    if user_id:
        user_id = int(user_id)

    results = get_hybrid_recommendations(
        recipe_id=recipe_id,
        user_id=user_id,
        top_n=top_n
    )

    return jsonify({
        'recipe_id': recipe_id,
        'user_id': user_id,
        'algorithm': 'Hybrid (TF-IDF + K-Means + SVD)',
        'cluster_label': results.get('cluster_label', ''),
        'tfidf_results': results['algorithms']['tfidf'],
        'kmeans_results': results['algorithms']['kmeans'],
        'collaborative_results': results['algorithms']['collaborative'],
        'hybrid_recommendations': results['hybrid_recommendations']
    })

if __name__ == '__main__':
    print("Starting FlavorMind API...")
    print("Visit http://localhost:5000 to test")
    app.run(debug=True, port=5000)