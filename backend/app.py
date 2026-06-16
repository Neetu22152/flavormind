from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import json
import sys
import os
import base64

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import pickle
from models.tfidf_model import get_similar_recipes
from models.kmeans_model import get_cluster_recommendations
from models.collaborative_model import get_collaborative_recommendations

app = Flask(__name__)
CORS(app)

# ── Reviews File ──
REVIEWS_FILE = 'data/reviews.json'
USERS_FILE = 'data/users.json'

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

def load_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r') as f:
                content = f.read().strip()
                if not content:
                    return {}
                return json.loads(content)
        except:
            return {}
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

def get_user(email):
    users = load_users()
    return users.get(email, {'saved_recipes': [], 'my_recipes': [], 'profile': {}})

def update_user(email, data):
    users = load_users()
    if email not in users:
        users[email] = {'saved_recipes': [], 'my_recipes': [], 'profile': {}}
    users[email].update(data)
    save_users(users)

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
    max_minutes = request.args.get('max_minutes', None)
    max_ingredients = request.args.get('max_ingredients', None)
    tag_filter = request.args.get('tag', None)

    if not query and not tag_filter:
        return jsonify({'error': 'Query parameter q is required'}), 400

    df = pd.read_pickle('data/cleaned_recipes.pkl')

    try:
        interactions = pd.read_pickle('saved_models/interactions.pkl')
        avg_ratings = interactions.groupby('recipe_id')['rating'].mean().round(1)
        rating_counts = interactions.groupby('recipe_id')['rating'].count()
    except:
        avg_ratings = None
        rating_counts = None

    query_words = query.lower().split() if query else []

    if query:
        name_mask = df['name'].str.contains(query.lower(), case=False, na=False)
        name_results = df[name_mask].head(limit)
    else:
        name_results = pd.DataFrame()

    if len(name_results) < 3:
        combined_results = [name_results]
        for word in query_words:
            tag_mask = df['tags'].apply(lambda tags: any(word in tag.lower() for tag in tags))
            combined_results.append(df[tag_mask].head(limit))
            ing_mask = df['ingredients'].apply(lambda ings: any(word in ing.lower() for ing in ings))
            combined_results.append(df[ing_mask].head(limit))
        if tag_filter:
            tf_mask = df['tags'].apply(lambda tags: any(tag_filter.lower() in tag.lower() for tag in tags))
            combined_results.append(df[tf_mask].head(limit))
        all_results = pd.concat(combined_results)
        all_results = all_results.drop_duplicates(subset=['id']).head(limit)
    else:
        all_results = name_results

    if max_minutes:
        all_results = all_results[all_results['minutes'] <= int(max_minutes)]
    if max_ingredients:
        all_results = all_results[all_results['n_ingredients'] <= int(max_ingredients)]

    recipes = []
    for _, row in all_results.iterrows():
        rid = int(row['id'])
        avg_r = round(float(avg_ratings[rid]), 1) if avg_ratings is not None and rid in avg_ratings else None
        r_count = int(rating_counts[rid]) if rating_counts is not None and rid in rating_counts else 0
        recipes.append({
            'id': rid,
            'name': row['name'],
            'ingredients': row['ingredients'],
            'minutes': int(row['minutes']),
            'n_steps': int(row['n_steps']),
            'n_ingredients': int(row['n_ingredients']),
            'tags': row['tags'],
            'avg_rating': avg_r,
            'rating_count': r_count
        })

    # Add user uploaded recipes
    try:
        user_data = load_users()
        for email, user in user_data.items():
            for recipe in user.get('my_recipes', []):
                if query.lower() in recipe.get('name', '').lower() or \
                   any(query.lower() in ing.lower() for ing in recipe.get('ingredients', [])):
                    recipes.append({
                        'id': recipe['id'],
                        'name': recipe['name'],
                        'ingredients': recipe.get('ingredients', []),
                        'minutes': recipe.get('minutes', 0),
                        'n_steps': len(recipe.get('steps', [])),
                        'n_ingredients': len(recipe.get('ingredients', [])),
                        'tags': [],
                        'avg_rating': None,
                        'rating_count': 0,
                        'is_user_recipe': True,
                        'author': email
                    })
    except Exception as e:
        print('Error loading user recipes:', e)

    return jsonify({'query': query, 'count': len(recipes), 'results': recipes})

# ── Get recipe by ID ──
@app.route('/api/recipes/<recipe_id>')
def get_recipe(recipe_id):
    import ast

    # Check if it's a user uploaded recipe
    if not recipe_id.isdigit():
        user_data = load_users()
        for email, user in user_data.items():
            for recipe in user.get('my_recipes', []):
                if recipe['id'] == recipe_id:
                    return jsonify({
                        'id': recipe['id'],
                        'name': recipe['name'],
                        'ingredients': recipe.get('ingredients', []),
                        'minutes': recipe.get('minutes', 0),
                        'n_steps': len(recipe.get('steps', [])),
                        'steps': recipe.get('steps', []),
                        'description': recipe.get('description', ''),
                        'tags': [],
                        'nutrition': None,
                        'avg_rating': None,
                        'rating_count': 0,
                        'is_user_recipe': True,
                        'author': email
                    })
        return jsonify({'error': 'Recipe not found'}), 404

    recipe_id_int = int(recipe_id)
    df = pd.read_pickle('data/cleaned_recipes.pkl')

    try:
        interactions = pd.read_pickle('saved_models/interactions.pkl')
        recipe_ratings = interactions[interactions['recipe_id'] == recipe_id_int]['rating']
        avg_rating = round(float(recipe_ratings.mean()), 1) if len(recipe_ratings) > 0 else None
        rating_count = len(recipe_ratings)
    except:
        avg_rating = None
        rating_count = 0

    recipe = df[df['id'] == recipe_id_int]
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

    import ast as ast2
    try:
        nutrition = row['nutrition']
        if isinstance(nutrition, str):
            nutrition = ast2.literal_eval(nutrition)
        nutrition_data = {
            'calories': round(nutrition[0], 1),
            'total_fat': round(nutrition[1], 1),
            'sugar': round(nutrition[2], 1),
            'sodium': round(nutrition[3], 1),
            'protein': round(nutrition[4], 1),
            'saturated_fat': round(nutrition[5], 1),
            'carbohydrates': round(nutrition[6], 1),
        }
    except:
        nutrition_data = None

    return jsonify({
        'id': int(row['id']),
        'name': row['name'],
        'ingredients': row['ingredients'],
        'minutes': int(row['minutes']),
        'n_steps': int(row['n_steps']),
        'steps': steps,
        'tags': row['tags'],
        'description': row['description'],
        'nutrition': nutrition_data,
        'avg_rating': avg_rating,
        'rating_count': rating_count
    })

# ── TF-IDF similar recipes ──
@app.route('/api/recommend/similar/<int:recipe_id>')
def similar_recipes(recipe_id):
    top_n = int(request.args.get('top_n', 10))
    results = get_similar_recipes(recipe_id, top_n=top_n)
    return jsonify({'recipe_id': recipe_id, 'algorithm': 'TF-IDF Cosine Similarity', 'recommendations': results})

# ── K-Means cluster recipes ──
@app.route('/api/recommend/cluster/<int:recipe_id>')
def cluster_recipes(recipe_id):
    top_n = int(request.args.get('top_n', 10))
    results = get_cluster_recommendations(recipe_id, top_n=top_n)
    return jsonify({'recipe_id': recipe_id, 'algorithm': 'K-Means Clustering', 'cluster_label': results.get('cluster_label', ''), 'recommendations': results.get('recommendations', [])})

# ── Collaborative filtering ──
@app.route('/api/recommend/personal/<int:user_id>')
def personal_recipes(user_id):
    top_n = int(request.args.get('top_n', 10))
    results = get_collaborative_recommendations(user_id, top_n=top_n)
    return jsonify({'user_id': user_id, 'algorithm': 'Collaborative Filtering (SVD)', 'recommendations': results})

# ── Hybrid recommendations ──
@app.route('/api/recommend/hybrid/<int:recipe_id>')
def hybrid_recipes(recipe_id):
    user_id = request.args.get('user_id')
    top_n = int(request.args.get('top_n', 10))
    if user_id:
        user_id = int(user_id)
    tfidf_results = get_similar_recipes(recipe_id, top_n=top_n)
    kmeans_results = get_cluster_recommendations(recipe_id, top_n=top_n)
    collaborative_results = get_collaborative_recommendations(user_id, top_n=top_n) if user_id else []
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
        'algorithms': {'tfidf': tfidf_results, 'kmeans': kmeans_results.get('recommendations', []), 'collaborative': collaborative_results},
        'hybrid_recommendations': hybrid[:top_n]
    })

# ── Reviews ──
@app.route('/api/reviews/<int:recipe_id>', methods=['GET'])
def get_reviews(recipe_id):
    reviews = load_reviews()
    recipe_reviews = reviews.get(str(recipe_id), [])
    avg = round(sum(r['rating'] for r in recipe_reviews) / len(recipe_reviews), 1) if recipe_reviews else None
    return jsonify({'recipe_id': recipe_id, 'reviews': recipe_reviews, 'avg_rating': avg, 'count': len(recipe_reviews)})

@app.route('/api/reviews/<int:recipe_id>', methods=['POST'])
def add_review(recipe_id):
    data = request.get_json()
    if not data or not data.get('rating') or not data.get('user_name'):
        return jsonify({'error': 'Missing required fields'}), 400
    reviews = load_reviews()
    key = str(recipe_id)
    if key not in reviews:
        reviews[key] = []
    existing = next((r for r in reviews[key] if r['user_email'] == data.get('user_email')), None)
    if existing:
        existing['rating'] = data['rating']
        existing['comment'] = data.get('comment', '')
        existing['updated'] = True
    else:
        reviews[key].append({'user_name': data['user_name'], 'user_email': data.get('user_email', ''), 'rating': data['rating'], 'comment': data.get('comment', ''), 'date': data.get('date', '')})
    save_reviews(reviews)
    return jsonify({'success': True})

# ── User Dashboard ──
@app.route('/api/user/saved', methods=['GET'])
def get_saved_recipes():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = get_user(email)
    saved_ids = user.get('saved_recipes', [])
    df = pd.read_pickle('data/cleaned_recipes.pkl')
    recipes = []
    for rid in saved_ids:
        if isinstance(rid, str) and not rid.isdigit():
            user_data = load_users()
            for u_email, u in user_data.items():
                for r in u.get('my_recipes', []):
                    if r['id'] == rid:
                        recipes.append({'id': r['id'], 'name': r['name'], 'ingredients': r.get('ingredients', []), 'minutes': r.get('minutes', 0), 'n_steps': len(r.get('steps', []))})
        else:
            recipe = df[df['id'] == int(rid)]
            if len(recipe) > 0:
                row = recipe.iloc[0]
                recipes.append({'id': int(row['id']), 'name': row['name'], 'ingredients': row['ingredients'], 'minutes': int(row['minutes']), 'n_steps': int(row['n_steps'])})
    return jsonify({'saved_recipes': recipes})

@app.route('/api/user/saved', methods=['POST'])
def save_recipe():
    data = request.get_json()
    email = data.get('email')
    recipe_id = data.get('recipe_id')
    if not email or not recipe_id:
        return jsonify({'error': 'Email and recipe_id required'}), 400
    user = get_user(email)
    saved = user.get('saved_recipes', [])
    if recipe_id not in saved:
        saved.append(recipe_id)
        update_user(email, {'saved_recipes': saved})
        return jsonify({'success': True, 'message': 'Recipe saved!'})
    return jsonify({'success': False, 'message': 'Already saved'})

@app.route('/api/user/saved', methods=['DELETE'])
def unsave_recipe():
    data = request.get_json()
    email = data.get('email')
    recipe_id = data.get('recipe_id')
    if not email or not recipe_id:
        return jsonify({'error': 'Email and recipe_id required'}), 400
    user = get_user(email)
    saved = user.get('saved_recipes', [])
    if recipe_id in saved:
        saved.remove(recipe_id)
        update_user(email, {'saved_recipes': saved})
    return jsonify({'success': True, 'message': 'Recipe removed!'})

@app.route('/api/user/recipes', methods=['GET'])
def get_my_recipes():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = get_user(email)
    return jsonify({'my_recipes': user.get('my_recipes', [])})

@app.route('/api/user/recipes', methods=['POST'])
def upload_recipe():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    import time, datetime
    recipe = {
        'id': 'user_' + str(int(time.time())),
        'name': data.get('name', ''),
        'description': data.get('description', ''),
        'ingredients': data.get('ingredients', []),
        'steps': data.get('steps', []),
        'minutes': data.get('minutes', 0),
        'author': email,
        'created_at': datetime.datetime.now().isoformat()
    }
    user = get_user(email)
    my_recipes = user.get('my_recipes', [])
    my_recipes.append(recipe)
    update_user(email, {'my_recipes': my_recipes})
    return jsonify({'success': True, 'recipe': recipe})

@app.route('/api/user/recipes/<recipe_id>', methods=['DELETE'])
def delete_my_recipe(recipe_id):
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = get_user(email)
    my_recipes = user.get('my_recipes', [])
    my_recipes = [r for r in my_recipes if r['id'] != recipe_id]
    update_user(email, {'my_recipes': my_recipes})
    return jsonify({'success': True})

@app.route('/api/user/recipes/<recipe_id>', methods=['PUT'])
def edit_my_recipe(recipe_id):
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    user = get_user(email)
    my_recipes = user.get('my_recipes', [])
    for i, r in enumerate(my_recipes):
        if r['id'] == recipe_id:
            my_recipes[i].update({
                'name': data.get('name', r['name']),
                'description': data.get('description', r['description']),
                'ingredients': data.get('ingredients', r['ingredients']),
                'steps': data.get('steps', r['steps']),
                'minutes': data.get('minutes', r['minutes']),
            })
            break
    update_user(email, {'my_recipes': my_recipes})
    return jsonify({'success': True})

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    update_user(email, {'profile': {'name': data.get('name', ''), 'bio': data.get('bio', '')}})
    return jsonify({'success': True})

@app.route('/api/user/recipes/image', methods=['POST'])
def upload_recipe_image():
    data = request.get_json()
    image_data = data.get('image')
    recipe_id = data.get('recipe_id')
    if not image_data or not recipe_id:
        return jsonify({'error': 'Missing data'}), 400
    images_dir = 'data/recipe_images'
    os.makedirs(images_dir, exist_ok=True)
    image_path = images_dir + '/' + recipe_id + '.jpg'
    img_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
    with open(image_path, 'wb') as f:
        f.write(img_bytes)
    return jsonify({'success': True, 'image_url': '/api/user/recipes/image/' + recipe_id})

@app.route('/api/user/recipes/image/<recipe_id>', methods=['GET'])
def get_recipe_image(recipe_id):
    image_path = 'data/recipe_images/' + recipe_id + '.jpg'
    if os.path.exists(image_path):
        return send_file(image_path, mimetype='image/jpeg')
    return jsonify({'error': 'Image not found'}), 404
# ── Admin Routes ──
ADMIN_EMAIL = 'admin@flavormind.com'

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    email = request.args.get('email')
    if email != ADMIN_EMAIL:
        return jsonify({'error': 'Unauthorized'}), 401

    users = load_users()
    reviews = load_reviews()

    total_users = len(users)
    total_uploaded = sum(len(u.get('my_recipes', [])) for u in users.values())
    total_saved = sum(len(u.get('saved_recipes', [])) for u in users.values())
    total_reviews = sum(len(r) for r in reviews.values())

    return jsonify({
        'total_users': total_users,
        'total_uploaded_recipes': total_uploaded,
        'total_saved_recipes': total_saved,
        'total_reviews': total_reviews
    })

@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    email = request.args.get('email')
    if email != ADMIN_EMAIL:
        return jsonify({'error': 'Unauthorized'}), 401

    users = load_users()
    user_list = []
    for user_email, user_data in users.items():
        user_list.append({
            'email': user_email,
            'saved_count': len(user_data.get('saved_recipes', [])),
            'recipe_count': len(user_data.get('my_recipes', [])),
            'profile': user_data.get('profile', {})
        })
    return jsonify({'users': user_list})

@app.route('/api/admin/recipes', methods=['GET'])
def admin_get_recipes():
    email = request.args.get('email')
    if email != ADMIN_EMAIL:
        return jsonify({'error': 'Unauthorized'}), 401

    users = load_users()
    all_recipes = []
    for user_email, user_data in users.items():
        for recipe in user_data.get('my_recipes', []):
            all_recipes.append({
                'id': recipe['id'],
                'name': recipe['name'],
                'author': user_email,
                'minutes': recipe.get('minutes', 0),
                'ingredients': recipe.get('ingredients', []),
                'created_at': recipe.get('created_at', '')
            })
    return jsonify({'recipes': all_recipes})

@app.route('/api/admin/recipes/<recipe_id>', methods=['DELETE'])
def admin_delete_recipe(recipe_id):
    email = request.args.get('email')
    if email != ADMIN_EMAIL:
        return jsonify({'error': 'Unauthorized'}), 401

    users = load_users()
    for user_email, user_data in users.items():
        my_recipes = user_data.get('my_recipes', [])
        updated = [r for r in my_recipes if r['id'] != recipe_id]
        if len(updated) != len(my_recipes):
            users[user_email]['my_recipes'] = updated
            save_users(users)
            return jsonify({'success': True})
    return jsonify({'error': 'Recipe not found'}), 404

@app.route('/api/admin/users/<user_email>', methods=['DELETE'])
def admin_delete_user(user_email):
    email = request.args.get('email')
    if email != ADMIN_EMAIL:
        return jsonify({'error': 'Unauthorized'}), 401

    users = load_users()
    if user_email in users:
        del users[user_email]
        save_users(users)
        return jsonify({'success': True})
    return jsonify({'error': 'User not found'}), 404

if __name__ == '__main__':
    print("Starting FlavorMind API...")
    print("Visit http://localhost:5000 to test")
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)