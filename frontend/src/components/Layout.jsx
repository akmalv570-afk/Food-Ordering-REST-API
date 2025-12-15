import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-food rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🍔</span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">FoodOrder</h1>
                <p className="text-xs text-gray-500 -mt-1">Delicious meals delivered</p>
              </div>
            </Link>

            {/* Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`
                    px-4 py-2 rounded-button font-medium text-sm transition-all duration-300
                    ${isActive('/') 
                      ? 'bg-primary-orange text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  🍽️ Foods
                </Link>
                <Link
                  to="/orders"
                  className={`
                    px-4 py-2 rounded-button font-medium text-sm transition-all duration-300
                    ${isActive('/orders') 
                      ? 'bg-primary-orange text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  📦 My Orders
                </Link>
                {isAdmin() && (
                  <>
                    <Link
                      to="/admin/foods"
                      className={`
                        px-4 py-2 rounded-button font-medium text-sm transition-all duration-300
                        ${isActive('/admin/foods') 
                          ? 'bg-primary-orange text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      ⚙️ Manage Foods
                    </Link>
                    <Link
                      to="/admin/orders"
                      className={`
                        px-4 py-2 rounded-button font-medium text-sm transition-all duration-300
                        ${isActive('/admin/orders') 
                          ? 'bg-primary-orange text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      📊 Manage Orders
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="relative px-4 py-2 rounded-button bg-white border-2 border-primary-orange text-primary-orange font-semibold hover:bg-primary-orange hover:text-white transition-all duration-300 shadow-card hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <span>🛒</span>
                      <span className="hidden sm:inline">Cart</span>
                    </span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-button">
                    <div className="w-8 h-8 bg-gradient-food rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-button bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300 shadow-card hover:shadow-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-button text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 rounded-button bg-gradient-food text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
