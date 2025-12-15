import { useState, useEffect } from 'react';
import { foodsAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'fastfood',
    is_available: true,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  // Pagination state
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, [page]);

  const fetchFoods = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (page > 1) {
        params.page = page;
      }
      const response = await foodsAPI.getAdminFoods(params);
      
      // Handle paginated response (Django REST Framework returns {count, next, previous, results: [...]})
      let foodsData = [];
      if (response?.data) {
        if (Array.isArray(response.data.results)) {
          foodsData = response.data.results;
          // Update pagination info
          setCount(response.data.count || 0);
          setHasNext(!!response.data.next);
          setHasPrev(!!response.data.previous);
        } else if (Array.isArray(response.data)) {
          foodsData = response.data;
          setCount(response.data.length);
          setHasNext(false);
          setHasPrev(false);
        }
      }
      
      setFoods(foodsData);
    } catch (err) {
      setError('Failed to load foods');
      console.error('Error fetching foods:', err);
      setFoods([]); // Ensure foods is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('is_available', formData.is_available);

      if (image) {
        submitData.append('image', image);
      }

      if (editingFood) {
        await foodsAPI.updateFood(editingFood.id, submitData);
      } else {
        await foodsAPI.createFood(submitData);
      }
      
      setShowForm(false);
      setEditingFood(null);
      setFormData({
        name: '',
        price: '',
        category: 'fastfood',
        is_available: true,
      });
      setImage(null);
      setImagePreview(null);
      // Reset to first page after creating/updating
      setPage(1);
      fetchFoods();
    } catch (err) {
      const errorMessage = err.response?.data?.detail 
        || (err.response?.data ? JSON.stringify(err.response.data) : null)
        || 'Failed to save food';
      setError(errorMessage);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      price: food.price,
      category: food.category,
      is_available: food.is_available,
    });
    setImage(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food?')) {
      return;
    }

    try {
      await foodsAPI.deleteFood(id);
      // If we're on a page that becomes empty after deletion, go to previous page
      if (foods.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchFoods();
      }
    } catch (err) {
      setError('Failed to delete food');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFood(null);
    setFormData({
      name: '',
      price: '',
      category: 'fastfood',
      is_available: true,
    });
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-orange border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading foods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Food <span className="text-gradient">Management</span>
          </h1>
          <p className="text-gray-600">Manage your food menu and availability</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 rounded-button bg-gradient-food text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          + Add New Food
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 shadow-card">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-food shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
            {editingFood ? '✏️ Edit Food' : '➕ Add New Food'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-button focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-200"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-button focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-200"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-button focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-200"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="fastfood">Fast Food</option>
                <option value="national">National</option>
                <option value="drink">Drink</option>
                <option value="dessert">Dessert</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Image {!editingFood && '(Optional)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-button focus:outline-none focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-sm file:font-semibold file:bg-primary-orange file:text-white hover:file:bg-primary-red cursor-pointer"
              />
              {(imagePreview || (editingFood && editingFood.image)) && (
                <div className="mt-3">
                  <img
                    src={imagePreview || getImageUrl(editingFood.image)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-card"
                    onError={(e) => {
                      console.error('Preview image failed to load');
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                checked={formData.is_available}
                onChange={(e) =>
                  setFormData({ ...formData, is_available: e.target.checked })
                }
              />
              <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                Available
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-button bg-gradient-food text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {editingFood ? '💾 Update Food' : '✨ Create Food'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-button bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-food shadow-xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(foods) && foods.length > 0 ? foods.map((food) => (
              <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-accent-warm rounded-xl overflow-hidden flex-shrink-0 shadow-card relative">
                    {food.image ? (
                      <img
                        src={getImageUrl(food.image)}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const imageUrl = getImageUrl(food.image);
                          console.error('Image failed to load:', {
                            original: food.image,
                            converted: imageUrl,
                            foodName: food.name
                          });
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
                      className="image-placeholder absolute inset-0 flex items-center justify-center"
                      style={{ display: food.image ? 'none' : 'flex' }}
                    >
                      <span className="text-2xl">🍽️</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {food.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${parseFloat(food.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {food.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      food.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {food.is_available ? 'Available' : 'Not Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(food)}
                    className="px-4 py-2 rounded-button bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(food.id)}
                    className="px-4 py-2 rounded-button bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No foods found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(hasNext || hasPrev || count > 0) && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {foods.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, count)} of {count} foods
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev || loading}
              className={`
                px-4 py-2 rounded-button font-semibold text-sm
                transition-all duration-300
                ${
                  hasPrev && !loading
                    ? 'bg-white text-primary-orange border-2 border-primary-orange hover:bg-primary-orange hover:text-white shadow-card hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }
              `}
            >
              ← Previous
            </button>
            <div className="px-4 py-2 bg-white rounded-button shadow-card font-semibold text-gray-700 text-sm">
              Page {page}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || loading}
              className={`
                px-4 py-2 rounded-button font-semibold text-sm
                transition-all duration-300
                ${
                  hasNext && !loading
                    ? 'bg-white text-primary-orange border-2 border-primary-orange hover:bg-primary-orange hover:text-white shadow-card hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }
              `}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;

