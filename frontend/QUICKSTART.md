# Quick Start Guide

## Prerequisites

- Node.js 16+ and npm installed
- Django backend running on `http://localhost:8000`

## Setup Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## First Steps

1. **Register a new account**
   - Go to `/register`
   - Fill in username, phone, and password
   - You'll be automatically logged in

2. **Browse foods**
   - The home page shows available foods
   - Filter by category (Fast Food, National, Drink, Dessert, Other)
   - Add items to cart

3. **Create an order**
   - Go to Cart (`/cart`)
   - Review items and quantities
   - Click "Proceed to Checkout"
   - Enter delivery address
   - Optionally add a promo code
   - Submit order

4. **View orders**
   - Go to "My Orders" in the navigation
   - Click on any order to see details

## Admin Access

To access admin features, you need a user with `is_staff=True` in the Django backend.

1. **Create admin user in Django**
   ```bash
   python manage.py createsuperuser
   ```

2. **Login with admin credentials**
   - Admin users will see "Manage Foods" and "Manage Orders" in navigation

3. **Manage foods**
   - Add, edit, delete foods
   - Toggle availability status

4. **Manage orders**
   - View all orders
   - Update order status (new → preparing → delivered)

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure your Django backend has CORS configured:
```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### 401 Unauthorized Errors
- Check if JWT token is stored in localStorage
- Try logging out and logging back in
- Verify backend is running and accessible

### API Connection Errors
- Verify backend is running on `http://localhost:8000`
- Check browser console for detailed error messages
- Verify proxy configuration in `vite.config.js`

## Notes

- Cart data is stored in localStorage and persists across sessions
- JWT tokens are automatically refreshed when needed
- Protected routes redirect to login if not authenticated
- Admin routes are only accessible to admin users

