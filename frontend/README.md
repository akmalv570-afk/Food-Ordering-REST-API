# Food Ordering System - Frontend

React.js frontend for the Food Ordering REST API.

## Features

### User Features
- ✅ JWT-based authentication (Login/Register)
- ✅ Food list with category filtering and pagination
- ✅ Shopping cart with local state management
- ✅ Create orders with address and promo code
- ✅ View order history and order details

### Admin Features
- ✅ Food management (Create, Update, Delete, Toggle availability)
- ✅ Order management (View all orders, Update order status)

## Tech Stack

- React.js 18
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- Vite as build tool

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

The frontend is configured to proxy API requests to `http://localhost:8000` (Django backend).

To change the backend URL, update `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // Change this
    changeOrigin: true,
  }
}
```

### Backend CORS Configuration

Make sure your Django backend has CORS configured to allow requests from the frontend. Add this to your `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development:
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

## API Endpoints Used

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Register
- `POST /api/auth/refresh/` - Refresh token

### Foods
- `GET /api/foods/foods/` - List foods (with category filter)
- `GET /api/foods/admin/foods/` - Admin: List all foods
- `POST /api/foods/admin/foods/` - Admin: Create food
- `PATCH /api/foods/admin/foods/{id}/` - Admin: Update food
- `DELETE /api/foods/admin/foods/{id}/` - Admin: Delete food

### Orders
- `POST /api/orders/create/` - Create order
- `GET /api/orders/my/` - Get user's orders
- `GET /api/orders/{id}/` - Get order detail
- `PATCH /api/orders/admin/orders/{id}/status/` - Admin: Update order status

## Note

The Admin Orders page requires a backend endpoint to list all orders. If you haven't implemented this yet, you'll need to add:

```python
# In orders/views.py
class AdminOrdersAPIView(ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all()

# In orders/urls.py
path('admin/orders/', views.AdminOrdersAPIView.as_view()),
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React contexts
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── FoodList.jsx
│   │   ├── Cart.jsx
│   │   ├── CreateOrder.jsx
│   │   ├── MyOrders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── AdminFoods.jsx
│   │   └── AdminOrders.jsx
│   ├── services/         # API service
│   │   └── api.js
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Authentication Flow

1. User logs in or registers
2. JWT token is stored in localStorage
3. Token is automatically attached to all API requests via Axios interceptor
4. On 401 errors, user is redirected to login
5. Protected routes check authentication status

## Cart Management

- Cart is stored in localStorage
- Cart persists across page refreshes
- Cart is cleared after successful order creation

## Styling

The app uses Tailwind CSS with custom colors:
- Primary Green: `#22c55e`
- Primary Yellow: `#eab308`

All components are mobile-responsive.

