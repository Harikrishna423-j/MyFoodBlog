import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:8000";

function Home() {
  const { api } = useAuth();
  const [shorts, setShorts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [hideDummy, setHideDummy] = useState(false);

  useEffect(() => {
    api.get("/api/shorts/")
      .then((res) => setShorts(res.data.shorts))
      .catch((err) => console.error(err));

    api.get("/api/recipes/")
      .then((res) => setRecipes(res.data.recipes))
      .catch((err) => console.error(err));
  }, []);

  const featured = shorts.find((s) => s.is_featured) || shorts[shorts.length - 1];
  const visibleShorts = hideDummy ? shorts.filter((s) => s.user) : shorts;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden bg-background" id="hero">
        {featured && (
          <video
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            src={`${API_BASE}${featured.file}`}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="relative z-10 p-6 flex flex-col items-center">
          <h2 className="text-primary font-bold tracking-widest uppercase mb-4 text-lg md:text-xl drop-shadow-md">Welcome to MyFood Blog</h2>
          <h1 className="text-white text-5xl md:text-7xl font-extrabold mb-8 drop-shadow-lg leading-tight">Enjoy our <br/> Delicious Meals</h1>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primaryHover text-white text-lg px-8 py-6 rounded-full transition-all shadow-lg hover:shadow-primary/50" onClick={() => document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" })}>
              Explore More
            </Button>
          </div>
        </div>
      </section>

      {/* Shorts */}
      <section className="py-20 px-6 md:px-12 bg-textDark text-white text-center">
        <div className="flex flex-col items-center gap-4 mb-12">
          <h2 className="text-primary text-4xl font-bold tracking-tight">Best Bites Shorts</h2>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary w-4 h-4 rounded"
              checked={hideDummy}
              onChange={(e) => setHideDummy(e.target.checked)}
            />
            Show people's choices only
          </label>
        </div>

        {visibleShorts.length === 0 ? (
          <p className="text-gray-400 text-lg">No shorts yet — check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center max-w-7xl mx-auto">
            {visibleShorts.map((s) => (
              <div key={s.id} className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl hover:scale-[1.02] transition-transform duration-300">
                <video src={`${API_BASE}${s.file}`} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium drop-shadow-md text-left">
                  <p className="line-clamp-2">{s.title || "A tasty bite!"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recipes */}
      <section id="recipes" className="py-24 px-6 md:px-12 bg-background text-center max-w-7xl mx-auto">
        <h2 className="text-textDark text-4xl font-bold mb-16 tracking-tight">The Latest & Greatest</h2>
        {recipes.length === 0 ? (
          <p className="text-gray-500 text-lg">No recipes yet — check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100">
                  <img src={`${API_BASE}${r.image}`} alt={r.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-textDark font-bold text-lg mb-2 line-clamp-1 w-full">{r.title}</h3>
                <p className="font-bold text-primary mb-4">❤️ {r.favorites_count}</p>
                <div className="mt-auto pt-2 w-full">
                  <Link to={`/recipes/${r.id}`}>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white rounded-full font-semibold transition-colors">
                      View Recipe
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
