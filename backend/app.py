from flask import Flask, jsonify, request
from flask_cors import CORS
import json
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

    query_words = query.lower().split()
    
    # Search in name first
    name_mask = df['name'].str.contains(query.lower(), case=False, na=False)
    name_results = df[name_mask].head(limit)

    # If not enough results search in ingredients and tags
    if len(name_results) < 3:
        combined_results = []
        for word in query_words:
            # Search in tags
            tag_mask = df['tags'].apply(
                lambda tags: any(word in tag.lower() for tag in tags)
            )
            tag_results = df[tag_mask].head(limit)
            combined_results.append(tag_results)
            
            # Search in ingredients
            ing_mask = df['ingredients'].apply(
                lambda ings: any(word in ing.lower() for ing in ings)
            )
            ing_results = df[ing_mask].head(limit)
            combined_results.append(ing_results)

        import pandas as pd
        all_results = pd.concat([name_results] + combined_results)
        all_results = all_results.drop_duplicates(subset=['id']).head(limit)
    else:
        all_results = name_results

    recipes = []
    for _, row in all_results.iterrows():
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

    # Get results from each algorithm
    tfidf_results = get_similar_recipes(recipe_id, top_n=top_n)
    kmeans_results = get_cluster_recommendations(recipe_id, top_n=top_n)
    collaborative_results = get_collaborative_recommendations(user_id, top_n=top_n) if user_id else []

    # Merge and deduplicate for hybrid recommendations
    seen_ids = set()
    hybrid = []
    for source in [tfidf_results, kmeans_results.get('recommendations', []), collaborative_results]:
        for recipe in source:
            rid = recipe.get('id')
            if rid and rid not in seen_ids and rid != recipe_id:
                seen_ids.add(rid)
                hybrid.append(recipe)

    return jsonify({
        'recipe_id': recipe_id,
        'user_id': user_id,
        'algorithm': 'Hybrid (TF-IDF + K-Means + SVD)',
        'cluster_label': kmeans_results.get('cluster_label', ''),
        'algorithms': {
            'tfidf': tfidf_results,
            'kmeans': kmeans_results.get('recommendations', []),
            'collaborative': collaborative_results
        },
        'hybrid_recommendations': hybrid[:top_n]
    })
@app.route('/api/recipes/<int:recipe_id>')
def get_recipe(recipe_id):
    import pandas as pd
    import ast
    df = pd.read_pickle('data/cleaned_recipes.pkl')
    recipe = df[df['id'] == recipe_id]
    
    if len(recipe) == 0:
        return jsonify({'error': 'Recipe not found'}), 404
    
    row = recipe.iloc[0]

    steps = row['steps']
    if isinstance(steps, str):
        try:
            steps = ast.literal_eval(steps)
        except:
            steps = [steps]
    elif not isinstance(steps, list):
        steps = []

    return jsonify({
        'id': int(row['id']),
        'name': row['name'],
        'ingredients': row['ingredients'],
        'minutes': int(row['minutes']),
        'n_steps': int(row['n_steps']),
        'steps': steps,
        'tags': row['tags'],
        'description': row['description']
    })
    import json
import os

REVIEWS_FILE = 'data/reviews.json'

def load_reviews():
    if os.path.exists(REVIEWS_FILE):
        try:
            with open(REVIEWS_FILE, 'r') as f:
                content = f.read().strip()
                if not content:
                    return {}
                return json.loads(content)
        except:
            return {}
    return {}

def save_reviews(reviews):
    with open(REVIEWS_FILE, 'w') as f:
        json.dump(reviews, f)

@app.route('/api/reviews/<int:recipe_id>', methods=['GET'])
def get_reviews(recipe_id):
    reviews = load_reviews()
    recipe_reviews = reviews.get(str(recipe_id), [])
    avg = round(sum(r['rating'] for r in recipe_reviews) / len(recipe_reviews), 1) if recipe_reviews else None
    return jsonify({
        'recipe_id': recipe_id,
        'reviews': recipe_reviews,
        'avg_rating': avg,
        'count': len(recipe_reviews)
    })

@app.route('/api/reviews/<int:recipe_id>', methods=['POST'])
def add_review(recipe_id):
    data = request.get_json()
    if not data or not data.get('rating') or not data.get('user_name'):
        return jsonify({'error': 'Missing required fields'}), 400

    reviews = load_reviews()
    key = str(recipe_id)
    if key not in reviews:
        reviews[key] = []

    # Check if user already reviewed
    existing = next((r for r in reviews[key] if r['user_email'] == data.get('user_email')), None)
    if existing:
        # Update existing review
        existing['rating'] = data['rating']
        existing['comment'] = data.get('comment', '')
        existing['updated'] = True
    else:
        reviews[key].append({
            'user_name': data['user_name'],
            'user_email': data.get('user_email', ''),
            'rating': data['rating'],
            'comment': data.get('comment', ''),
            'date': data.get('date', '')
        })

    save_reviews(reviews)
    return jsonify({'success': True})

if __name__ == '__main__':
    print("Starting FlavorMind API...")
    print("Visit http://localhost:5000 to test")
    app.run(debug=True, port=5000)