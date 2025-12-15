import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16 bg-white rounded-food shadow-card">
          <div className="text-7xl mb-6">🛒</div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 text-lg mb-8">Looks like you haven't added anything to your cart yet</p>
          <Link
            to="/"
            className="inline-block px-8 py-4 rounded-button bg-gradient-food text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🍽️ Browse Delicious Foods
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
          Shopping <span className="text-gradient">Cart</span>
        </h1>
        <p className="text-gray-600 text-lg">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="bg-white rounded-food shadow-card overflow-hidden">
        <div className="divide-y divide-gray-100">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-6">
                {/* Food Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-primary-orange to-accent-warm rounded-xl overflow-hidden flex-shrink-0 shadow-card relative">
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
                    <span className="text-3xl">🍽️</span>
                  </div>
                </div>

                {/* Food Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize mb-2">
                    {item.category}
                  </p>
                  <p className="text-lg font-bold text-primary-orange">
                    ${parseFloat(item.price).toFixed(2)} <span className="text-sm text-gray-500 font-normal">each</span>
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-100 rounded-button px-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-lg bg-white hover:bg-primary-orange hover:text-white flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-sm"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-white hover:bg-primary-orange hover:text-white flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[120px]">
                    <p className="text-2xl font-bold text-primary-orange">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-12 h-12 rounded-button bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t-4 border-primary-orange">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-display font-semibold text-gray-900">
              Total Price:
            </span>
            <span className="text-4xl font-display font-bold text-primary-orange">
              ${getTotalPrice().toFixed(2)}
            </span>
          </div>
          <Link
            to="/orders/create"
            className="block w-full py-4 rounded-button bg-gradient-food text-white text-center font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            🛒 Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
