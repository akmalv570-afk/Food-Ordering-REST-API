# Admin Detection Fix

## Problem
Admin users logged in via the frontend were treated as regular users because the JWT token from Django REST Framework Simple JWT doesn't include `is_staff` by default.

## Solution Implemented

### Backend Changes
1. **Added `/api/auth/me/` endpoint** (`users/views.py` and `users/urls.py`)
   - Returns current user's information including `is_staff` and `is_superuser`
   - Requires authentication
   - Endpoint: `GET /api/auth/me/`

### Frontend Changes
1. **Updated `AuthContext.jsx` login function**
   - First tries to get `is_staff` from JWT token
   - If not found in token, fetches user info from `/api/auth/me/` endpoint
   - Stores admin status in user object

2. **Updated `AuthContext.jsx` useEffect**
   - On component mount, refreshes admin status from token or API
   - Ensures admin status is up-to-date even after page refresh

## How It Works

1. **On Login:**
   ```
   User logs in → Get JWT token → Decode token
   ├─ If token has is_staff → Use it
   └─ If not → Call /api/auth/me/ → Get is_staff from API
   Store user data with isAdmin flag
   ```

2. **On Page Load:**
   ```
   Load token from localStorage → Decode token
   ├─ If token has is_staff → Update user data
   └─ If not → Call /api/auth/me/ → Update user data
   ```

## Testing

1. **Test as Admin:**
   - Login with admin account (is_staff=True)
   - Check browser console - should see admin status fetched
   - Verify "Manage Foods" and "Manage Orders" links appear in navigation
   - Try accessing `/admin/foods` - should work

2. **Test as Regular User:**
   - Login with regular account (is_staff=False)
   - Verify admin links don't appear
   - Try accessing `/admin/foods` - should redirect to home

## Alternative Solution (More Efficient)

If you want to avoid the extra API call, you can customize the JWT token to include `is_staff`:

### Backend: Custom JWT Token Serializer

**Update `users/serializers.py`:**
```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token
```

**Update `config/urls.py`:**
```python
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    # ... other patterns
    path('api/auth/login/', CustomTokenObtainPairView.as_view()),
    # ... rest
]
```

**Benefits:**
- No extra API call needed
- Admin status always in token
- More efficient

**Current Solution Benefits:**
- Works without modifying JWT token structure
- More flexible (can add more user info later)
- Backend endpoint can be used for other purposes

## Files Changed

### Backend
- `users/views.py` - Added `CurrentUserView`
- `users/urls.py` - Added route for `/me/`

### Frontend
- `frontend/src/context/AuthContext.jsx` - Updated login and useEffect to fetch admin status

## Next Steps

1. Test the fix with an admin account
2. If you prefer the JWT customization approach, implement the alternative solution
3. Consider adding caching to avoid repeated API calls

