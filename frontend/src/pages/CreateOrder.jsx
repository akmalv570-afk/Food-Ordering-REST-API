import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const CreateOrder = () => {
  const [address, setAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        address,
        items: cartItems.map((item) => ({
          food_id: item.id,
          quantity: item.quantity,
        })),
      };

      if (promoCode.trim()) {
        orderData.promo_code = promoCode.trim();
      }

      const response = await ordersAPI.createOrder(orderData);
      setSuccess({
        message: response.data.message,
        orderId: response.data.order_id,
        totalPrice: response.data.total_price,
      });
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.promo_code?.[0] ||
        err.response?.data?.detail ||
        'Failed to create order'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-2">Order Created Successfully!</h2>
          <p className="mb-2">{success.message}</p>
          <p className="mb-2">Order ID: #{success.orderId}</p>
          <p className="text-xl font-bold">
            Total Price: ${parseFloat(success.totalPrice).toFixed(2)}
          </p>
          <p className="mt-4 text-sm">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Order</h1>

      {cartItems.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Your cart is empty. Please add items to your cart first.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-food shadow-xl p-6 mb-6 border border-gray-100">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Food Image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-accent-warm rounded-xl overflow-hidden flex-shrink-0 shadow-card relative">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', item.image);
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="image-placeholder absolute inset-0 flex items-center justify-center"
                      style={{ display: item.image ? 'none' : 'flex' }}
                    >
                      <span className="text-2xl">🍽️</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-primary-orange text-lg">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-xl font-display font-semibold text-gray-900">Total:</span>
              <span className="text-3xl font-display font-bold text-primary-orange">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-food shadow-xl p-8 border border-gray-100">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Delivery Address *
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="promoCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Promo Code (Optional)
              </label>
              <input
                id="promoCode"
                name="promoCode"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-button bg-gradient-food text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Creating Order...
                </span>
              ) : (
                '🛒 Place Order'
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateOrder;

