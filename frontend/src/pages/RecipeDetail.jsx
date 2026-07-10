import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_BASE = "http://localhost:8000";

const stubReviews = [
  { name: "Sarah P.", rating: 5, text: "Delicious! So easy to follow." },
  { name: "Mike T.",  rating: 4, text: "Great recipe, but I added more chili flakes." },
  { name: "Emily R.", rating: 5, text: "My family loved this!" },
];

// Icons that cycle through steps
const stepIcons = ["🍲", "🥘", "🔪", "🥄", "🫕", "🥗", "🧂", "🫙"];

// Derive numbered steps from a free-text description
const parseSteps = (description = "") => {
  const lines = description
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [description || "No instructions provided."];
};

const StarRow = ({ rating, onChange }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange && onChange(n)}
        className={`text-xl leading-none transition-colors ${
          n <= rating ? "text-primary" : "text-gray-300"
        } ${onChange ? "cursor-pointer hover:text-primary" : "cursor-default"}`}
      >
        ★
      </button>
    ))}
  </span>
);

const Initials = ({ name }) => {
  const letters = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="w-9 h-9 rounded-full bg-primary/80 text-textDark text-xs font-extrabold flex items-center justify-center shrink-0">
      {letters}
    </span>
  );
};

const RecipeDetail = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe]       = useState(null);
  const [reviewName, setName]     = useState("");
  const [reviewRating, setRating] = useState(5);
  const [reviewText, setText]     = useState("");

  useEffect(() => {
    api.get(`/api/recipes/${id}/`)
      .then((res) => setRecipe(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setName(""); setRating(5); setText("");
    alert("Reviews aren't saved yet — preview only!");
  };

  if (!recipe) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-semibold">Loading recipe…</p>
      </div>
    </div>
  );

  const steps = parseSteps(recipe.description);
  const authorName = recipe.user?.username?.split("@")[0] ?? "Chef";

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ══════════════════════════════════════════
          HERO — image left / info panel right
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px] md:min-h-[340px]">

        {/* Left — food image */}
        <div className="relative overflow-hidden">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primaryHover transition-all text-sm font-bold"
          >
            ←
          </button>
          <img
            src={`${API_BASE}${recipe.image}`}
            alt={recipe.title}
            className="w-full h-full object-cover min-h-[260px]"
          />
        </div>

        {/* Right — dark info panel */}
        <div className="bg-textDark text-white flex flex-col justify-center px-8 md:px-12 py-10 relative overflow-hidden">
          {/* Decorative accent bar */}
          <div className="absolute top-0 right-0 w-2 h-full bg-primary" />

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-5 pr-4">
            {recipe.title}
          </h1>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="flex items-center gap-1.5 bg-primary text-textDark text-xs font-bold px-3 py-1.5 rounded-full">
              ⏱ {recipe.difficulty}
            </span>
            <span className="flex items-center gap-1.5 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              🌍 {recipe.difficulty === "Easy" ? "Quick Meal" : recipe.difficulty === "Hard" ? "Gourmet" : "Home Cook"}
            </span>
          </div>

          {/* Time + rating row */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">⏱</div>
              <div className="text-2xl font-extrabold text-white">20m</div>
              <div className="text-xs text-gray-400 mt-0.5">Prep</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">🍳</div>
              <div className="text-2xl font-extrabold text-white">30m</div>
              <div className="text-xs text-gray-400 mt-0.5">Cook</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <StarRow rating={5} />
              <p className="text-xs text-gray-400 mt-1">{recipe.favorites_count} favorites</p>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-extrabold text-primary">
              {authorName[0]?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-300">
              By <span className="text-white font-bold">{authorName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          INSTRUCTIONS + VIDEO
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-extrabold text-textDark mb-6">Instructions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Icon + number */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg shrink-0">
                    {stepIcons[i % stepIcons.length]}
                  </div>
                  <span className="text-2xl font-extrabold text-textDark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Video player */}
        {recipe.video ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 self-start bg-black">
            <video
              controls
              className="w-full"
              poster={`${API_BASE}${recipe.image}`}
            >
              <source src={`${API_BASE}${recipe.video}`} type="video/mp4" />
            </video>
          </div>
        ) : (
          // Placeholder if no video
          <div className="rounded-2xl bg-gray-200 flex items-center justify-center self-start h-52 border border-gray-100">
            <span className="text-gray-400 text-sm">No video available</span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          REVIEWS PANEL — dark background
      ══════════════════════════════════════════ */}
      <div className="bg-textDark text-white px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Reviews header */}
          <h2 className="text-lg font-extrabold mb-6">
            Reviews ({stubReviews.length})
          </h2>

          {/* Reviewer cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stubReviews.map((r, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <Initials name={r.name} />
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{r.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      <StarRow rating={r.rating} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>

          {/* Leave a Review form */}
          <h3 className="text-base font-extrabold mb-4 text-white">Leave a Review</h3>
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-4 items-end"
          >
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Rating</label>
              <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2.5">
                <StarRow rating={reviewRating} onChange={setRating} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Comment</label>
              <input
                type="text"
                value={reviewText}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience..."
                className="bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-textDark text-sm font-extrabold px-6 py-2.5 rounded-lg hover:bg-primaryHover transition-all duration-200 shrink-0"
            >
              Submit Review
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default RecipeDetail;
