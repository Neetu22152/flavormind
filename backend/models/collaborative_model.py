import pandas as pd
import numpy as np
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate
import pickle
import os

def build_collaborative_model():
    print("Loading interactions dataset...")
    interactions = pd.read_csv('data/RAW_interactions.csv')
    
    print(f"Original interactions shape: {interactions.shape}")
    print(interactions.head())
    
    # Keep only relevant columns
    interactions = interactions[['user_id', 'recipe_id', 'rating']]
    
    # Remove ratings of 0 — they mean the user didn't actually rate
    interactions = interactions[interactions['rating'] > 0]
    
    # Keep only active users — users with at least 5 ratings
    user_counts = interactions['user_id'].value_counts()
    active_users = user_counts[user_counts >= 5].index
    interactions = interactions[interactions['user_id'].isin(active_users)]
    
    # Keep only popular recipes — recipes with at least 5 ratings
    recipe_counts = interactions['recipe_id'].value_counts()
    popular_recipes = recipe_counts[recipe_counts >= 5].index
    interactions = interactions[interactions['recipe_id'].isin(popular_recipes)]
    
    # Sample for performance — 200k interactions is enough
    if len(interactions) > 200000:
        interactions = interactions.sample(200000, random_state=42)
    
    print(f"Filtered interactions shape: {interactions.shape}")
    print(f"Unique users: {interactions['user_id'].nunique()}")
    print(f"Unique recipes: {interactions['recipe_id'].nunique()}")
    
    # Build Surprise dataset
    print("\nBuilding SVD model...")
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(interactions[['user_id', 'recipe_id', 'rating']], reader)
    
    # Train SVD model
    trainset = data.build_full_trainset()
    svd = SVD(n_factors=50, n_epochs=20, random_state=42)
    svd.fit(trainset)
    
    # Quick cross validation to show model quality
    print("\nRunning cross validation...")
    cv_results = cross_validate(SVD(), data, measures=['RMSE', 'MAE'], cv=3, verbose=True)
    print(f"Average RMSE: {cv_results['test_rmse'].mean():.4f}")
    print(f"Average MAE: {cv_results['test_mae'].mean():.4f}")
    
    # Save model and interactions
    os.makedirs('saved_models', exist_ok=True)
    with open('saved_models/svd_collab.pkl', 'wb') as f:
        pickle.dump(svd, f)
    
    interactions.to_pickle('saved_models/interactions.pkl')
    
    # Save list of all recipe ids in the model
    recipe_ids = interactions['recipe_id'].unique().tolist()
    with open('saved_models/collab_recipe_ids.pkl', 'wb') as f:
        pickle.dump(recipe_ids, f)
    
    print("\nCollaborative filtering model saved successfully!")
    return svd, interactions

def get_collaborative_recommendations(user_id, top_n=10):
    with open('saved_models/svd_collab.pkl', 'rb') as f:
        svd = pickle.load(f)
    
    with open('saved_models/collab_recipe_ids.pkl', 'rb') as f:
        recipe_ids = pickle.load(f)
    
    interactions = pd.read_pickle('saved_models/interactions.pkl')
    df = pd.read_pickle('data/cleaned_recipes.pkl')
    
    # Get recipes this user has already rated
    rated_recipes = interactions[
        interactions['user_id'] == user_id
    ]['recipe_id'].tolist()
    
    # Predict ratings for all unrated recipes
    unrated_recipes = [r for r in recipe_ids if r not in rated_recipes]
    
    if len(unrated_recipes) == 0:
        return {"error": "No unrated recipes found for this user"}
    
    # Predict and sort
    predictions = []
    for recipe_id in unrated_recipes[:5000]:  # limit for performance
        pred = svd.predict(user_id, recipe_id)
        predictions.append((recipe_id, pred.est))
    
    predictions.sort(key=lambda x: x[1], reverse=True)
    top_predictions = predictions[:top_n]
    
    results = []
    for recipe_id, predicted_rating in top_predictions:
        recipe = df[df['id'] == recipe_id]
        if len(recipe) > 0:
            results.append({
                'id': int(recipe_id),
                'name': recipe.iloc[0]['name'],
                'ingredients': recipe.iloc[0]['ingredients'],
                'minutes': int(recipe.iloc[0]['minutes']),
                'predicted_rating': round(predicted_rating, 2)
            })
    
    return results

if __name__ == "__main__":
    # First install surprise if not installed
    try:
        from surprise import SVD
    except ImportError:
        print("Installing scikit-surprise...")
        import subprocess
        subprocess.run(['pip', 'install', 'scikit-surprise'])
    
    svd, interactions = build_collaborative_model()
    
    # Test with a real user from the dataset
    test_user = interactions['user_id'].iloc[0]
    print(f"\nTesting with user ID: {test_user}")
    
    results = get_collaborative_recommendations(test_user, top_n=5)
    print("\nTop 5 personalized recommendations:")
    for r in results:
        print(f"  - {r['name']} (predicted rating: {r['predicted_rating']})")