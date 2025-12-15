# Backend Code Review & Improvement Suggestions

## ✅ What's Working Well

1. **Clean separation of concerns** - Models, serializers, views, and URLs are well organized
2. **Proper use of DRF permissions** - `IsAuthenticated`, `IsAdminUser`, and custom `IsAdminOrReadOnly`
3. **Good API documentation** - Using `drf_spectacular` with `@extend_schema` decorators
4. **Proper queryset filtering** - Users can only see their own orders
5. **Admin order management** - Properly implemented with `AdminOrderListAPIView`

## 🔒 Security Issues

### 1. **CRITICAL: Exposed Secret Key**
**File:** `config/settings.py:23`
```python
SECRET_KEY = 'django-insecure-2m+%zs-g@_==&f_c^4w$rgxtaoj@6r4kqy(m6bel5i5q13$(zm'
```
**Issue:** Secret key is hardcoded and exposed in version control.
**Fix:** Use environment variables:
```python
import os
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-only-for-development')
```

### 2. **CRITICAL: Debug Mode Enabled**
**File:** `config/settings.py:26`
```python
DEBUG = True
```
**Issue:** Should be `False` in production. Exposes sensitive error information.
**Fix:**
```python
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

### 3. **CRITICAL: Empty ALLOWED_HOSTS**
**File:** `config/settings.py:28`
```python
ALLOWED_HOSTS = []
```
**Issue:** Allows any host to access the application.
**Fix:**
```python
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
```

### 4. **Missing CORS Configuration**
**File:** `config/settings.py`
**Issue:** CORS middleware is installed but not configured.
**Fix:** Add after MIDDLEWARE:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development only:
# CORS_ALLOW_ALL_ORIGINS = True
```

### 5. **Missing JWT Settings**
**File:** `config/settings.py`
**Issue:** No JWT token expiration or refresh settings configured.
**Fix:** Add:
```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### 6. **Order Creation: Missing Food Availability Check**
**File:** `orders/serializers.py:28`
**Issue:** Users can order unavailable foods.
**Fix:**
```python
for item in items_data:
    food = get_object_or_404(Food, id=item['food_id'])
    
    # Check if food is available
    if not food.is_available:
        raise serializers.ValidationError({
            'items': f'Food "{food.name}" is not available'
        })
    
    price = food.price * item['quantity']
    OrderItem.objects.create(...)
```

### 7. **Order Creation: Missing Quantity Validation**
**File:** `orders/serializers.py:10`
**Issue:** No maximum quantity limit, could allow unrealistic orders.
**Fix:**
```python
quantity = serializers.IntegerField(min_value=1, max_value=100)
```

## 🐛 Bugs & Issues

### 1. **OrderDetailSerializer: Potential None Error**
**File:** `orders/serializers.py:74`
**Issue:** If `promo_code` is `None`, `source='promo_code.code'` will fail.
**Fix:**
```python
promo_code = serializers.CharField(
    source='promo_code.code', 
    read_only=True,
    allow_null=True,
    default=None
)
```

### 2. **Missing Order Status Validation**
**File:** `orders/serializers.py:84`
**Issue:** No validation for valid status values in `OrderStatusUpdateSerializer`.
**Fix:**
```python
class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    
    class Meta:
        model = Order
        fields = ['status']
```

### 3. **Unused User Role Field**
**File:** `users/models.py:11-15`
**Issue:** `role` field exists but is not used (using `is_staff` instead).
**Fix:** Either remove it or use it for additional role-based logic:
```python
# Option 1: Remove if not needed
# (requires migration)

# Option 2: Keep for future use but document it
# This field is reserved for future role-based features
```

### 4. **Missing Model String Representations**
**Files:** `foods/models.py`, `orders/models.py`
**Issue:** No `__str__` methods, making admin interface less user-friendly.
**Fix:**
```python
# In Food model
def __str__(self):
    return f"{self.name} - ${self.price}"

# In Order model
def __str__(self):
    return f"Order #{self.id} - {self.user.username} - {self.status}"

# In OrderItem model
def __str__(self):
    return f"{self.quantity}x {self.food.name}"

# In PromoCode model
def __str__(self):
    return f"{self.code} - {self.discount_percent}%"
```

### 5. **Missing Model Ordering**
**Files:** `foods/models.py`, `orders/models.py`
**Issue:** No default ordering, results may be inconsistent.
**Fix:**
```python
# In Order model
class Meta:
    ordering = ['-created_at']  # Most recent first

# In Food model
class Meta:
    ordering = ['name']  # Alphabetical
```

## 📝 Best Practices & Improvements

### 1. **Remove Unused Imports**
**File:** `orders/views.py:1`, `foods/views.py:1`
```python
from django.shortcuts import render  # Not used
```

### 2. **Add Input Validation**
**File:** `orders/serializers.py:14`
**Issue:** Address field has no length validation.
**Fix:**
```python
address = serializers.CharField(max_length=200)
```

### 3. **Add Pagination to Admin Orders**
**File:** `orders/views.py:81`
**Issue:** `AdminOrderListAPIView` doesn't specify pagination explicitly.
**Note:** This should work with global pagination, but consider making it explicit.

### 4. **Add Error Handling for Edge Cases**
**File:** `orders/serializers.py:48`
**Issue:** Division by zero not checked (though unlikely with discount_percent validation).
**Consider:** Adding explicit checks for edge cases.

### 5. **Add Model Constraints**
**File:** `orders/models.py:26`
**Issue:** `total_price` can be negative or zero.
**Fix:**
```python
total_price = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0,
    validators=[MinValueValidator(0)]
)
```

### 6. **Add Database Indexes**
**File:** `orders/models.py:28`
**Issue:** `created_at` is used for filtering but not indexed.
**Fix:**
```python
created_at = models.DateTimeField(auto_now_add=True, db_index=True)
```

### 7. **Improve Error Messages**
**File:** `orders/serializers.py:44`
**Issue:** Generic error message.
**Fix:**
```python
if not promo:
    raise serializers.ValidationError({
        'promo_code': f'Promo code "{promo_code}" is invalid, expired, or inactive'
    })
```

### 8. **Add Transaction Support**
**File:** `orders/serializers.py:18`
**Issue:** Order creation is not atomic - if something fails mid-process, partial data may be created.
**Fix:**
```python
from django.db import transaction

def create(self, validated_data):
    with transaction.atomic():
        # ... existing code ...
```

### 9. **Add Logging**
**File:** `orders/views.py`
**Issue:** No logging for important operations (order creation, status updates).
**Fix:**
```python
import logging
logger = logging.getLogger(__name__)

# In OrderCreateApiView.post():
logger.info(f'Order {order.id} created by user {request.user.username}')

# In OrderStatusUpdateAPIView.patch():
logger.info(f'Order {order.id} status updated to {new_status} by admin {request.user.username}')
```

### 10. **Add API Rate Limiting**
**File:** `config/settings.py`
**Issue:** No rate limiting, vulnerable to abuse.
**Fix:** Install `django-ratelimit` or use DRF throttling:
```python
REST_FRAMEWORK = {
    # ... existing settings ...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

## 🔧 Recommended Code Improvements

### 1. **Custom JWT Token Serializer** (For Frontend Compatibility)
**File:** Create `users/serializers.py` addition or new file
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

Then update `config/urls.py`:
```python
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# In urlpatterns:
path('api/auth/login/', CustomTokenObtainPairView.as_view()),
```

### 2. **Add User Info Endpoint** (Alternative to JWT customization)
**File:** `users/views.py`
```python
from rest_framework.permissions import IsAuthenticated

@extend_schema(
    summary="Get current user",
    description="Get authenticated user's information",
    tags=["Auth"]
)
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
        })
```

**File:** `users/urls.py`
```python
path('me/', views.CurrentUserView.as_view(), name='current-user'),
```

### 3. **Add Order Status Transition Validation**
**File:** `orders/serializers.py`
```python
class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    
    def validate_status(self, value):
        instance = self.instance
        if instance:
            # Prevent status regression
            status_order = {'new': 0, 'preparing': 1, 'delivered': 2}
            current_order = status_order.get(instance.status, -1)
            new_order = status_order.get(value, -1)
            
            if new_order < current_order:
                raise serializers.ValidationError(
                    f'Cannot change status from {instance.status} to {value}'
                )
        return value
    
    class Meta:
        model = Order
        fields = ['status']
```

## 📋 Priority Summary

### **HIGH PRIORITY (Security)**
1. Move SECRET_KEY to environment variable
2. Configure ALLOWED_HOSTS
3. Add CORS configuration
4. Add food availability check in order creation
5. Add JWT settings

### **MEDIUM PRIORITY (Bugs)**
1. Fix OrderDetailSerializer promo_code None handling
2. Add model __str__ methods
3. Add transaction support for order creation
4. Add status validation in OrderStatusUpdateSerializer

### **LOW PRIORITY (Best Practices)**
1. Remove unused imports
2. Add logging
3. Add rate limiting
4. Add database indexes
5. Improve error messages

## 🎯 Testing Recommendations

1. **Test order creation with unavailable food** - Should fail
2. **Test order creation with invalid food_id** - Should return 404
3. **Test order status transitions** - Should validate proper flow
4. **Test promo code expiration** - Should reject expired codes
5. **Test admin permissions** - Regular users shouldn't access admin endpoints
6. **Test order ownership** - Users shouldn't see other users' orders

