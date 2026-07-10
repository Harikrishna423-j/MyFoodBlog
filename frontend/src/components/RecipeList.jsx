import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:8000";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-10 bg-gray-200 rounded-full mt-4" />
    </div>
  </div>
);

// Difficulty badge color map
const difficultyStyle = {
  Easy:   "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard:   "bg-red-100 text-red-700",
};

const RecipeList = () => {
  const { api } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState("All");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/recipes/");
      setRecipes(res.data.recipes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId) => {
    try {
      const res = await api.post(`/api/recipes/${recipeId}/favorite/`);
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId
            ? { ...r, favorites_count: res.data.favorites_count, favorited: res.data.favorited }
            : r
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Filter logic
  const filtered = recipes.filter((r) => {
    const matchesDifficulty = activeDifficulty === "All" || r.difficulty === activeDifficulty;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Banner ── */}
      <div className="relative bg-textDark overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <span className="inline-block text-primary text-sm font-bold uppercase tracking-widest mb-4 border border-primary/40 px-3 py-1 rounded-full">
              Recipe Card Index
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              Every Dish,<br />
              <span className="text-primary">One Place.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Browse our full collection of hand-crafted recipes — from quick weeknight dinners to weekend showstoppers.
            </p>
            <div className="mt-8 flex items-center gap-4 text-gray-400 text-sm">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Easy</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Medium</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Hard</span>
              <span className="ml-4 font-semibold text-white">{recipes.length} recipes</span>
            </div>
          </div>

          {/* Search in hero */}
          <div className="w-full md:w-auto">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipes..."
                className="w-full md:w-80 pl-11 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 backdrop-blur-sm text-base transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Grid ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">

        {/* Difficulty filter pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDifficulty(d)}
              className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                activeDifficulty === d
                  ? "bg-primary text-textDark border-primary shadow-md scale-105"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {d}
            </button>
          ))}
          {/* Result count */}
          {!loading && (
            <span className="ml-auto self-center text-sm text-gray-500 font-medium">
              {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {/* Skeleton grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <p className="text-5xl mb-4">🍽️</p>
            <h3 className="text-2xl font-bold text-textDark mb-2">No recipes found</h3>
            <p className="text-gray-500">Try a different search or filter.</p>
            <button
              onClick={() => { setSearch(""); setActiveDifficulty("All"); }}
              className="mt-6 text-primary font-semibold underline underline-offset-4 hover:opacity-80"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                {/* Card image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={`${API_BASE}${r.image}`}
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Difficulty badge */}
                  <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${difficultyStyle[r.difficulty] ?? "bg-gray-100 text-gray-700"}`}>
                    {r.difficulty}
                  </span>
                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(r.id)}
                    aria-label="Favorite this recipe"
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full shadow-md flex items-center justify-center text-base transition-all duration-200 ${
                      r.favorited
                        ? "bg-red-500 text-white scale-110 shadow-red-200"
                        : "bg-white text-gray-400 hover:text-red-500 hover:scale-110"
                    }`}
                  >
                    {r.favorited ? "❤️" : "🤍"}
                  </button>
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>

                {/* Card body */}
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
                    <Button
                      variant="outline"
                      className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-textDark rounded-full font-bold transition-all duration-200"
                    >
                      View Recipe →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
