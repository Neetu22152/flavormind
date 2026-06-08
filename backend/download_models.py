import os
from huggingface_hub import hf_hub_download
from pathlib import Path

REPO_ID = "neetu-dev/flavormind-models"

FILES = [
    "saved_models/tfidf_vectorizer.pkl",
    "saved_models/tfidf_matrix.pkl",
    "saved_models/tfidf_recipes.pkl",
    "saved_models/kmeans_model.pkl",
    "saved_models/kmeans_recipes.pkl",
    "saved_models/svd_model.pkl",
    "saved_models/tfidf_kmeans.pkl",
    "saved_models/cluster_labels.pkl",
    "saved_models/svd_collab.pkl",
    "saved_models/interactions.pkl",
    "saved_models/collab_recipe_ids.pkl",
    "data/cleaned_recipes.pkl",
]

def download_models():
    print("Checking model files...")
    for file_path in FILES:
        if os.path.exists(file_path):
            print(f"Already exists: {file_path}")
            continue
        
        print(f"Downloading {file_path}...")
        Path(os.path.dirname(file_path)).mkdir(parents=True, exist_ok=True)
        
        hf_hub_download(
            repo_id=REPO_ID,
            filename=file_path,
            repo_type="model",
            local_dir="."
        )
        print(f"Downloaded: {file_path}")
    
    print("All model files ready!")

if __name__ == "__main__":
    download_models()