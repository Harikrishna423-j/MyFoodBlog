import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const aboutItems = [
  {
    title: "Socca, Whipped Feta & Tomato Salad",
    image: "/assets/recipe-socca-salad.png",
    reviews: 214,
    rating: 4.9,
    quote: "The whipped feta is a total game-changer. I make this salad every single week!"
  },
  {
    title: "Crispy, Creamy, Tangy, Summery",
    image: "/assets/recipe-crispy-summery.png",
    reviews: 98,
    rating: 4.8,
    quote: "Perfect balance of textures. Fresh, summery, and incredibly easy to prepare."
  },
  {
    title: "Chicken Burgers with Whipped Feta",
    image: "/assets/recipe-chicken-burger.png",
    reviews: 356,
    rating: 4.9,
    quote: "My family's absolute favorite burger. Juicy and packed with Mediterranean flavor."
  },
  {
    title: "Fresh Avocado Toast with Herbs",
    image: "/assets/recipe-avocado-toast.png",
    reviews: 142,
    rating: 5.0,
    quote: "Simple, elegant, and the fresh herb combination is absolutely genius!"
  },
  {
    title: "Mediterranean Quinoa Salad",
    image: "/assets/recipe-quinoa-salad.png",
    reviews: 187,
    rating: 4.7,
    quote: "Healthy, filling, and tastes even better the next day. Great for weekly meal prep."
  },
  {
    title: "Miracle No-Knead Bread",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
    reviews: 590,
    rating: 4.8,
    quote: "I was skeptical, but it came out with the perfect crispy crust and soft crumb!"
  },
];

const Stars = ({ rating }) => "★★★★★".slice(0, Math.round(rating)).padEnd(5, "☆");

const About = () => {
  const { api } = useAuth();
  const [dbRecipes, setDbRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await api.get("/api/recipes/");
        setDbRecipes(res.data.recipes || []);
      } catch (err) {
        console.error("Failed to fetch recipes on About page:", err);
      }
    };
    fetchRecipes();
  }, [api]);

  const getRecipeLink = (title) => {
    // Normalise keywords to find match in the DB
    const firstWord = title.split(",")[0].split(" ")[0].toLowerCase();
    const match = dbRecipes.find(r => 
      r.title.toLowerCase().includes(firstWord) ||
      title.toLowerCase().includes(r.title.toLowerCase())
    );
    return match ? `/recipes/${match.id}` : "/recipes";
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-white text-center" id="about">
      {/* ---------- Our Story: Before / After ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-28">
        <div className="flex flex-col items-center group">
          <h3 className="text-primary text-2xl font-bold mb-4 tracking-tight">Our First Idea</h3>
          <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100 mb-5 w-full h-[300px] md:h-[340px]">
            <img
              src="/assets/our-first-idea.jpg"
              alt="Illustration of a home cook filming and writing recipes in a kitchen"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            This is where MyFood Blog started — one recipe, one kitchen, one simple idea to share the joy of home-cooked meals with friends.
          </p>
        </div>

        <div className="flex flex-col items-center group">
          <h3 className="text-primary text-2xl font-bold mb-4 tracking-tight">How Far We've Grown</h3>
          <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100 mb-5 w-full h-[300px] md:h-[340px]">
            <img
              src="/assets/how-far-weve-grown.png"
              alt="A bright, modern commercial kitchen studio representing our growth"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            From a solo kitchen, we've grown into a global community of millions of home cooks, sharing thousands of hand-crafted recipes and culinary moments.
          </p>
        </div>
      </div>

      {/* ---------- Testimonials grid ---------- */}
      <div className="max-w-4xl mx-auto mb-16">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 bg-yellow-50 inline-block px-3 py-1 rounded-full">
          🏆 Community Favorites
        </h3>
        <h1 className="text-4xl md:text-5xl font-extrabold text-textDark mb-6 tracking-tight">
          What <span className="text-primary">Our Community</span> Says About Us
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Out of all our recipes, these are our shining stars — the ones tested, loved, and reviewed by home cooks all over the world.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {aboutItems.map((item, index) => {
          const recipeLink = getRecipeLink(item.title);
          return (
            <div
              className="flex flex-col bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-yellow-200 hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
              key={index}
            >
              {/* Header: Image & Info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100"
                  onError={(e) => {
                    e.target.style.background = "#eee";
                  }}
                />
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-textDark mb-1 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 text-sm leading-none">{Stars({ rating: item.rating })}</span>
                    <span className="text-[10px] font-extrabold text-primary bg-yellow-50 px-1.5 py-0.5 rounded leading-none">
                      {item.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {item.reviews} reviews
                  </p>
                </div>
              </div>

              {/* Testimonial Quote */}
              <div className="relative mt-auto pt-4 border-t border-dashed border-gray-100 text-left">
                <span className="absolute -top-3 left-1.5 text-2xl text-primary/30 font-serif leading-none">“</span>
                <p className="text-gray-500 text-xs italic pl-4 leading-relaxed line-clamp-3 mb-4">
                  {item.quote}
                </p>
              </div>

              {/* View Recipe Button */}
              <Link 
                to={recipeLink}
                className="mt-auto block text-center w-full py-2.5 px-4 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all duration-200"
              >
                View Recipe →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default About;


