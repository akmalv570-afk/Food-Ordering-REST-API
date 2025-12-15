import { useState, useEffect } from 'react';
import { foodsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const { addToCart } = useCart();

  const categories = [
    { value: 'all', label: 'All', icon: '🍽️' },
    { value: 'fastfood', label: 'Fast Food', icon: '🍔' },
    { value: 'national', label: 'National', icon: '🍛' },
    { value: 'drink', label: 'Drinks', icon: '🥤' },
    { value: 'dessert', label: 'Desserts', icon: '🍰' },
    { value: 'other', label: 'Other', icon: '🍕' },
  ];

  useEffect(() => {
    fetchFoods();
  }, [category, page]);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (page > 1) {
        params.page = page;
      }
      if (category !== 'all') {
        params.category = category;
      }
      const response = await foodsAPI.getFoods(params);
      
      const foodsData = response.data.results || response.data;
      setFoods(Array.isArray(foodsData) ? foodsData : []);
      
      if (response.data.next) setHasNext(true);
      else setHasNext(false);
      if (response.data.previous) setHasPrev(true);
      else setHasPrev(false);
    } catch (err) {
      setError('Failed to load foods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (food) => {
    const result = addToCart(food);
    if (!result.success) {
      alert(result.error);
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      fastfood: 'bg-orange-100 text-orange-700 border-orange-200',
      national: 'bg-amber-100 text-amber-700 border-amber-200',
      drink: 'bg-blue-100 text-blue-700 border-blue-200',
      dessert: 'bg-pink-100 text-pink-700 border-pink-200',
      other: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[cat] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-orange border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading delicious foods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">
          Discover <span className="text-gradient">Delicious Foods</span>
        </h1>
        <p className="text-gray-600 text-lg">Order your favorite meals with just a few clicks</p>
      </div>

      {/* Category Filter Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setPage(1);
              }}
              className={`
                px-6 py-3 rounded-button font-medium text-sm transition-all duration-300
                flex items-center gap-2 shadow-card
                ${
                  category === cat.value
                    ? 'bg-gradient-food text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-food'
                }
              `}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 shadow-card">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {foods.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-food shadow-card">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-600 text-lg font-medium">No foods available in this category</p>
          <p className="text-gray-500 mt-2">Try selecting a different category</p>
        </div>
      ) : (
        <>
          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {foods.map((food) => (
              <div
                key={food.id}
                className={`
                  bg-white rounded-food shadow-food overflow-hidden
                  transition-all duration-300 hover:shadow-food-hover hover:-translate-y-1
                  ${!food.is_available ? 'opacity-70' : ''}
                `}
              >
                {/* Food Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-orange to-accent-warm overflow-hidden">
                  {food.image ? (
                    <img
                      src={getImageUrl(food.image)}
                      alt={food.name}
                      className="w-full h-full object-cover relative z-0"
                      onError={(e) => {
                        console.error('Image failed to load:', food.image, 'URL:', getImageUrl(food.image));
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                          placeholder.style.zIndex = '1';
                        }
                      }}
                      onLoad={(e) => {
                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'none';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="image-placeholder absolute inset-0 flex items-center justify-center z-0"
                    style={{ display: food.image ? 'none' : 'flex' }}
                  >
                    <span className="text-6xl opacity-20">🍽️</span>
                  </div>
                  {!food.is_available && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                        Unavailable
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/90 backdrop-blur-sm ${getCategoryColor(food.category)}`}>
                      {food.category}
                    </span>
                  </div>
                </div>

                {/* Food Info */}
                <div className="p-5">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-2 line-clamp-1">
                    {food.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary-orange">
                        ${parseFloat(food.price).toFixed(2)}
                      </p>
                    </div>
                    {food.is_available && (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Available
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(food)}
                    disabled={!food.is_available}
                    className={`
                      w-full py-3 px-4 rounded-button font-semibold text-sm
                      transition-all duration-300 transform
                      ${
                        food.is_available
                          ? 'bg-gradient-food text-white hover:shadow-lg hover:scale-105 active:scale-95'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {food.is_available ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>🛒</span>
                        <span>Add to Cart</span>
                      </span>
                    ) : (
                      'Not Available'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev}
              className={`
                px-6 py-3 rounded-button font-semibold text-sm
                transition-all duration-300
                ${
                  hasPrev
                    ? 'bg-white text-primary-orange border-2 border-primary-orange hover:bg-primary-orange hover:text-white shadow-card hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }
              `}
            >
              ← Previous
            </button>
            <div className="px-6 py-3 bg-white rounded-button shadow-card font-semibold text-gray-700">
              Page {page}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className={`
                px-6 py-3 rounded-button font-semibold text-sm
                transition-all duration-300
                ${
                  hasNext
                    ? 'bg-white text-primary-orange border-2 border-primary-orange hover:bg-primary-orange hover:text-white shadow-card hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }
              `}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FoodList;
