'use client';

import { useState } from 'react';

interface Recipe {
  title: string;
  cooking_time?: string;
  difficulty?: string;
  servings?: string;
  category?: string;
  ingredients: string[];
  steps: string[];
  nutritional_highlights?: string;
  tips?: string;
  storage?: string;
}

export default function HomePage() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuisineType, setCuisineType] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const ingredientsArray = ingredients
          .split(/[\n,]+/)
          .map((item) => item.trim().toLowerCase())
          .filter((item) => item.length > 0);

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientsArray }),
      });

      const data = await response.json();

      if (data.error && data.invalid_ingredients) {
        const invalidList = data.invalid_ingredients.join(', ');
        throw new Error(`${data.error}: ${invalidList}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendapatkan resep. Coba lagi.');
      }

      setRecipes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (recipe: Recipe) => {
    const textContent = [
      `Judul: ${recipe.title}`,
      recipe.cooking_time && `Waktu Memasak: ${recipe.cooking_time}`,
      recipe.difficulty && `Tingkat Kesulitan: ${recipe.difficulty}`,
      recipe.servings && `Porsi: ${recipe.servings}`,
      '',
      'Bahan-bahan:',
      ...recipe.ingredients.map((i) => `- ${i}`),
      '',
      'Langkah-langkah:',
      ...recipe.steps.map((s, idx) => `${idx + 1}. ${s}`),
      '',
      recipe.nutritional_highlights && `Info Gizi: ${recipe.nutritional_highlights}`,
      recipe.storage && `Penyimpanan: ${recipe.storage}`,
      recipe.tips && `Tips: ${recipe.tips}`,
    ]
        .filter(Boolean)
        .join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🧑‍🍳</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI Chef Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
              Masukkan bahan yang tersedia untuk mendapatkan rekomendasi resep yang lezat
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                    htmlFor="ingredients"
                    className="block text-lg font-semibold text-gray-800 mb-3"
                >
                  🥘 Bahan-bahan tersedia
                </label>
                <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Contoh: telur, nasi, bawang merah, cabai, ayam, tomat"
                    className="w-full p-4 border-2 border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-base"
                    rows={5}
                    required
                />

                  <label
                      htmlFor="cuisineType"
                      className="block text-lg font-semibold text-gray-800 mb-3"
                  >
                    🍱 Jenis Masakan (Opsional)
                  </label>
                  <input
                      type="text"
                      id="cuisineType"
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      placeholder="Contoh: masakan Indonesia, western, dessert..."
                      className="w-full p-4 border-2 border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  />

                {ingredients && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-800 mb-2">Bahan yang dimasukkan:</p>
                      <div className="flex flex-wrap gap-2">
                        {ingredients
                            .split(/[\n,]+/)
                            .map((item) => item.trim())
                            .filter((item) => item.length > 0)
                            .map((item, idx) => (
                                <span key={idx} className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                          {item}
                        </span>
                            ))}
                      </div>
                    </div>
                )}
              </div>

              <button
                  type="submit"
                  disabled={isLoading || !ingredients.trim()}
                  className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg"
              >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Membuat resep...
                </span>
                ) : (
                    '🍳 Buat Resep Sekarang'
                )}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-8 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              </div>
          )}

          {/* Recipe Cards */}
          {recipes.length > 0 &&
              recipes.map((recipe, index) => (
                  <article
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8 mb-8 hover:shadow-xl transition-shadow duration-200"
                  >
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        🍽️ {recipe.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {recipe.cooking_time && (
                            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="mr-1">⏱️</span>
                              {recipe.cooking_time}
                    </span>
                        )}
                        {recipe.difficulty && (
                            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="mr-1">📊</span>
                              {recipe.difficulty}
                    </span>
                        )}
                        {recipe.servings && (
                            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="mr-1">🍽️</span>
                              {recipe.servings}
                    </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <section>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">🛒</span>
                          Bahan-bahan
                        </h4>
                        <ul className="space-y-2">
                          {recipe.ingredients.map((item, i) => (
                              <li key={i} className="flex items-start text-gray-700">
                                <span className="text-gray-500 mr-2 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">👨‍🍳</span>
                          Langkah-langkah
                        </h4>
                        <ol className="space-y-3">
                          {recipe.steps.map((step, i) => (
                              <li key={i} className="flex items-start text-gray-700">
                        <span className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                          {i + 1}
                        </span>
                                <span>{step}</span>
                              </li>
                          ))}
                        </ol>
                      </section>
                    </div>

                    <div className="space-y-3 mb-6">
                      {recipe.nutritional_highlights && (
                          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                              <span className="text-gray-500 mr-2">🥗</span>
                              <div>
                                <p className="font-medium text-gray-800">Info Gizi</p>
                                <p className="text-gray-700 text-sm mt-1">{recipe.nutritional_highlights}</p>
                              </div>
                            </div>
                          </div>
                      )}

                      {recipe.storage && (
                          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                              <span className="text-gray-500 mr-2">🏠</span>
                              <div>
                                <p className="font-medium text-gray-800">Penyimpanan</p>
                                <p className="text-gray-700 text-sm mt-1">{recipe.storage}</p>
                              </div>
                            </div>
                          </div>
                      )}

                      {recipe.tips && (
                          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                              <span className="text-gray-500 mr-2">💡</span>
                              <div>
                                <p className="font-medium text-gray-800">Tips</p>
                                <p className="text-gray-700 text-sm mt-1">{recipe.tips}</p>
                              </div>
                            </div>
                          </div>
                      )}
                    </div>

                    <button
                        onClick={() => handleDownload(recipe)}
                        className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                    >
                      <span className="mr-2">📥</span>
                      Download Resep (.txt)
                    </button>
                  </article>
              ))}

          {!isLoading && !error && recipes.length === 0 && ingredients.length > 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🍳</div>
                <p className="text-xl text-gray-500 mb-2">Hasil resep akan muncul di sini</p>
                <p className="text-gray-400">Masukkan bahan-bahan dan klik "Buat Resep"</p>
              </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-orange-100 mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">🧑‍🍳</span>
              <span className="text-lg font-semibold text-gray-800">AI Chef Assistant</span>
            </div>
            <p className="text-gray-600">
              Selamat memasak! Semoga hidangan Anda lezat dan bergizi 🍽️
            </p>
          </div>
        </footer>
      </div>
  );
}