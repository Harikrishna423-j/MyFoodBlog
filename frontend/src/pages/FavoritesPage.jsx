import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const difficultyStyle = {
  Easy:   "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard:   "bg-red-100 text-red-700",
};

const FavoritesPage = () => {
  const { api, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get("/api/favorites/")
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-textDark py-14 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block text-primary text-xs font-bold uppercase tracking-widest border border-primary/40 px-3 py-1 rounded-full mb-4">
            ❤️ My Collection
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">My Favorites</h1>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            All the recipes you've hearted — saved in one place.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {!isAuthenticated ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔒</p>
            <h3 className="text-2xl font-bold text-textDark mb-2">Sign in to see your favorites</h3>
            <p className="text-gray-500 mb-6">Create an account or log in to save and view your favorite recipes.</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-primary text-textDark font-bold rounded-full hover:bg-primaryHover transition-all text-sm"
            >
              Log In
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-10 bg-gray-200 rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🍽️</p>
            <h3 className="text-2xl font-bold text-textDark mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Browse recipes and tap the ❤️ to save ones you love.</p>
            <Link
              to="/recipes"
              className="inline-block px-8 py-3 bg-primary text-textDark font-bold rounded-full hover:bg-primaryHover transition-all text-sm"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 font-medium mb-8">
              {favorites.length} saved recipe{favorites.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favorites.map((r) => (
                <div
                  key={r.id}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={`${API_BASE}${r.image}`}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${difficultyStyle[r.difficulty] ?? "bg-gray-100 text-gray-700"}`}>
                      {r.difficulty}
                    </span>
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-base w-9 h-9 rounded-full flex items-center justify-center shadow-md">
                      ❤️
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-semibold">
                      <span className="uppercase tracking-wider">⏱ {r.difficulty}</span>
                      <span>❤️ {r.favorites_count}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-textDark mb-2 line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2 flex-1">
                      {r.description}
                    </p>
                    <Link to={`/recipes/${r.id}`}>
                      <button className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-textDark rounded-full font-bold py-2.5 text-sm transition-all duration-200">
                        View Recipe →
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;