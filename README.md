#  FlavorMind — Smart Recipe Recommendation System

FlavorMind is a full-stack web application that helps users discover recipes they'll love through personalized recommendations, smart search, and community reviews.

---

##  Features

- *Personalized Recommendations* — Get recipe suggestions based on your taste and what similar users enjoy
- *Smart Search* — Search 229,000+ recipes by dish name, ingredient, or cuisine with filters for cooking time and dietary preferences
- *Similar Recipe Discovery* — Find recipes with similar ingredients and flavor profiles instantly
- *Browse by Category* — Explore Italian, Mexican, Seafood, Desserts and 15+ cuisine categories
- *Nutrition Breakdown* — Calories, protein, carbs, fat, sugar and sodium for every recipe
- *Ratings & Reviews* — Rate and review recipes, read what other home cooks think
- *User Authentication* — Create an account and get a personalized experience

---

## Tech Stack

*Backend*
- Python 3.12
- Flask — REST API
- scikit-learn — Machine learning models
- Surprise — Collaborative filtering
- pandas & numpy — Data processing

*Frontend*
- React 18 + Vite
- React Router DOM
- Axios
- Unsplash API — Food photography

*Dataset*
- Food.com Recipes Dataset (Kaggle) — 229,636 recipes
- Food.com Interactions Dataset — 1,132,367 user ratings

---

##  How Recommendations Work

FlavorMind uses three recommendation approaches working together:

*Content-Based Filtering*
Analyzes recipe ingredients and descriptions using TF-IDF vectorization and Cosine Similarity to find recipes with similar content.

*Cluster-Based Discovery*
Groups all 229,000+ recipes into 15 meaningful clusters using K-Means clustering, enabling category-based exploration.

*Collaborative Filtering*
Uses SVD (Singular Value Decomposition) matrix factorization on 1M+ user ratings to predict recipes a specific user will enjoy.

*Hybrid System*
Combines all three approaches with weighted scoring (40% collaborative + 40% content-based + 20% cluster) for the most accurate results.

---

##  Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Food.com dataset from Kaggle

### 1. Clone the repository
bash
git clone https://github.com/Neetu22152/flavormind.git
cd flavormind


### 2. Set up the backend
bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r backend/requirements.txt


### 3. Download and prepare the dataset
- Download [Food.com Recipes and Interactions](https://www.kaggle.com/datasets/shuyangli94/food-com-recipes-and-user-interactions) from Kaggle
- Place RAW_recipes.csv and RAW_interactions.csv in backend/data/

### 4. Build the ML models
bash
cd backend
python data_preprocessing.py
python models/tfidf_model.py
python models/kmeans_model.py
python models/collaborative_model.py


### 5. Start the backend
bash
python app.py

Backend runs at http://localhost:5000

### 6. Set up and start the frontend
bash
cd frontend
npm install
npm run dev

Frontend runs at http://localhost:5173

---

##  Project Structure


flavormind/
├── backend/
│   ├── app.py                  # Flask API entry point
│   ├── data_preprocessing.py   # Dataset cleaning
│   ├── models/
│   │   ├── tfidf_model.py      # Content-based filtering
│   │   ├── kmeans_model.py     # Cluster-based discovery
│   │   ├── collaborative_model.py  # Collaborative filtering
│   │   └── hybrid_model.py     # Combined recommender
│   ├── data/                   # Dataset files (not tracked)
│   └── saved_models/           # Trained models (not tracked)
├── frontend/
│   ├── src/
│   │   ├── pages/              # Home, Explore, Personal, Recipe, Landing, Login
│   │   ├── components/         # Navbar, RecipeCard, ReviewSection
│   │   ├── context/            # Auth context
│   │   └── utils/              # API helper functions
│   └── public/
└── README.md


---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/recipes/search?q=chicken | Search recipes |
| GET | /api/recipes/<id> | Get recipe details |
| GET | /api/recommend/similar/<id> | TF-IDF recommendations |
| GET | /api/recommend/cluster/<id> | K-Means recommendations |
| GET | /api/recommend/personal/<user_id> | SVD recommendations |
| GET | /api/recommend/hybrid/<id> | Hybrid recommendations |
| GET | /api/reviews/<id> | Get recipe reviews |
| POST | /api/reviews/<id> | Submit a review |

---

## Model Performance

| Model | Metric | Score |
|-------|--------|-------|
| SVD Collaborative Filtering | RMSE | 0.5845 |
| SVD Collaborative Filtering | MAE | 0.3761 |
| TF-IDF Content-Based | Cosine Similarity | 0.32 – 0.42 |
| K-Means Clustering | Clusters | 15 |

---

##  Acknowledgements

- [Food.com Dataset](https://www.kaggle.com/datasets/shuyangli94/food-com-recipes-and-user-interactions) by Shuyang Li on Kaggle
- [Unsplash](https://unsplash.com/developers) for food photography API
- [scikit-learn](https://scikit-learn.org/) and [Surprise](https://surpriselib.com/) for machine learning libraries