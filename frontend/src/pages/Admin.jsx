import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/button";

function Admin() {
  const { api, logout } = useAuth();

  // Short upload state
  const [shortFile, setShortFile] = useState(null);
  const [shortTitle, setShortTitle] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [shortLoading, setShortLoading] = useState(false);
  const [shortMessage, setShortMessage] = useState("");
  const [shortRetryAfter, setShortRetryAfter] = useState(0);
  const shortInputRef = useRef(null);

  // Recipe upload state
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDifficulty, setRecipeDifficulty] = useState("Easy");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [recipeImage, setRecipeImage] = useState(null);
  const [recipeVideo, setRecipeVideo] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState("");
  const [recipeRetryAfter, setRecipeRetryAfter] = useState(0);
  const recipeImageRef = useRef(null);
  const recipeVideoRef = useRef(null);

  useEffect(() => {
    if (shortRetryAfter <= 0 && recipeRetryAfter <= 0) return;
    const interval = setInterval(() => {
      setShortRetryAfter((prev) => (prev > 0 ? prev - 1 : 0));
      setRecipeRetryAfter((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [shortRetryAfter, recipeRetryAfter]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleShortSubmit = async (e) => {
    e.preventDefault();
    if (!shortFile) return;
    setShortLoading(true);
    setShortMessage("");

    const formData = new FormData();
    formData.append("file", shortFile);
    formData.append("title", shortTitle);
    formData.append("is_featured", isFeatured);

    try {
      await api.post("/api/upload/short/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShortMessage("✅ Short uploaded successfully!");
      setShortFile(null);
      setShortTitle("");
      setIsFeatured(false);
      if (shortInputRef.current) shortInputRef.current.value = "";
    } catch (err) {
      if (err.response?.status === 429) {
        setShortRetryAfter(err.response.data.retry_after_seconds);
      }
      setShortMessage(err.response?.data?.error || "Upload failed.");
    } finally {
      setShortLoading(false);
    }
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    if (!recipeImage) return;
    setRecipeLoading(true);
    setRecipeMessage("");

    const formData = new FormData();
    formData.append("title", recipeTitle);
    formData.append("difficulty", recipeDifficulty);
    formData.append("description", recipeDesc);
    formData.append("image", recipeImage);
    if (recipeVideo) formData.append("video", recipeVideo);

    try {
      await api.post("/api/upload/recipe/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRecipeMessage("✅ Recipe uploaded successfully!");
      setRecipeTitle("");
      setRecipeDifficulty("Easy");
      setRecipeDesc("");
      setRecipeImage(null);
      setRecipeVideo(null);
      if (recipeImageRef.current) recipeImageRef.current.value = "";
      if (recipeVideoRef.current) recipeVideoRef.current.value = "";
    } catch (err) {
      if (err.response?.status === 429) {
        setRecipeRetryAfter(err.response.data.retry_after_seconds);
      }
      setRecipeMessage(err.response?.data?.error || "Upload failed.");
    } finally {
      setRecipeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top bar */}
      <header className="bg-textDark text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <span className="font-bold text-xl tracking-tight">MyFood Blog Admin</span>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-primary mb-2">Content Management Console</h1>
          <p className="text-gray-600 text-lg">Streamline your culinary content updates and creative uploads.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Upload Short */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <span className="text-2xl">🎬</span>
              <h2 className="text-xl font-bold text-textDark">Upload Short</h2>
            </div>
            <form onSubmit={handleShortSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Video File</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors flex flex-col items-center gap-2"
                  onClick={() => shortInputRef.current?.click()}
                >
                  <span className="text-3xl text-gray-400">⬆️</span>
                  <span className="text-gray-600 font-medium">{shortFile ? shortFile.name : "Click or drag video here"}</span>
                  <span className="text-xs text-gray-400">MP4, MOV (Max 50MB)</span>
                  <input
                    ref={shortInputRef}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => setShortFile(e.target.files[0])}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Caption (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700"
                  placeholder="Enter a catchy short description..."
                  value={shortTitle}
                  onChange={(e) => setShortTitle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">Max 120 characters recommended for mobile views.</p>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Feature this as today's hero video
              </label>

              <Button type="submit" disabled={shortLoading || shortRetryAfter > 0} className="w-full mt-4 bg-primary hover:bg-primaryHover text-white py-6 rounded-lg text-lg font-semibold transition-all">
                {shortLoading ? "Uploading..." : "Upload Short"}
              </Button>
              {shortMessage && <p className={`mt-2 font-semibold text-center ${shortMessage.includes("✅") ? "text-green-600" : "text-red-500"}`}>{shortMessage}</p>}
              {shortRetryAfter > 0 && (
                <p className="mt-2 font-semibold text-center text-red-500 bg-red-50 py-2 rounded-lg">
                  Limit reached — try again in {formatTime(shortRetryAfter)}
                </p>
              )}
            </form>
          </section>

          {/* Upload Recipe */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <span className="text-2xl">🍴</span>
              <h2 className="text-xl font-bold text-textDark">Upload Recipe</h2>
            </div>
            <form onSubmit={handleRecipeSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700"
                    placeholder="e.g., Spicy Miso Ramen"
                    value={recipeTitle}
                    onChange={(e) => setRecipeTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 bg-white"
                    value={recipeDifficulty}
                    onChange={(e) => setRecipeDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions/Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 font-sans resize-y min-h-[150px]"
                  placeholder="Break down the steps, ingredients, and the story behind this dish..."
                  rows={6}
                  value={recipeDesc}
                  onChange={(e) => setRecipeDesc(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Cover Image</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl py-6 px-4 text-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors flex flex-col items-center gap-2"
                    onClick={() => recipeImageRef.current?.click()}
                  >
                    <span className="text-3xl text-gray-400">📷</span>
                    <span className="text-gray-600 font-medium text-sm">{recipeImage ? recipeImage.name : "Select Image"}</span>
                    <input
                      ref={recipeImageRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setRecipeImage(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Video (Max 5 mins)</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl py-6 px-4 text-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors flex flex-col items-center gap-2"
                    onClick={() => recipeVideoRef.current?.click()}
                  >
                    <span className="text-3xl text-gray-400">🎥</span>
                    <span className="text-gray-600 font-medium text-sm">{recipeVideo ? recipeVideo.name : "Attach Video"}</span>
                    <input
                      ref={recipeVideoRef}
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) => setRecipeVideo(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={recipeLoading || recipeRetryAfter > 0} className="w-full md:w-auto bg-primary hover:bg-primaryHover text-white py-6 px-12 rounded-lg text-lg font-semibold transition-all">
                  {recipeLoading ? "Uploading..." : "Upload Recipe"}
                </Button>
              </div>
              {recipeMessage && <p className={`mt-2 font-semibold text-center md:text-right ${recipeMessage.includes("✅") ? "text-green-600" : "text-red-500"}`}>{recipeMessage}</p>}
              {recipeRetryAfter > 0 && (
                <p className="mt-2 font-semibold text-center md:text-right text-red-500 bg-red-50 py-2 px-4 rounded-lg inline-block self-end">
                  Limit reached — try again in {formatTime(recipeRetryAfter)}
                </p>
              )}
            </form>
          </section>
        </div>

        {/* Footer bar */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Button variant="ghost" onClick={logout} className="text-gray-500 hover:text-red-600 font-semibold px-6 transition-colors">
            Logout of Admin
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Admin;
