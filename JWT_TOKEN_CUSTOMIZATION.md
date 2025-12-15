# JWT Token Customization for Admin Detection

## Problem

By default, Django REST Framework Simple JWT doesn't include `is_staff` or `is_superuser` in the JWT token payload. This means the frontend can't determine if a user is an admin just from the token.

## Solution Options

### Option 1: Customize JWT Token Serializer (Recommended)

Create a custom token serializer that includes `is_staff` and `is_superuser` in the token payload.

**Create `users/serializers.py` (or update existing):**

```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
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
    # ... rest of patterns
]
```

### Option 2: Create User Info Endpoint

Create an endpoint that returns the current user's information.

**Create `users/views.py` (or update existing):**

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
        }, status=status.HTTP_200_OK)
```

**Update `users/urls.py`:**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterApiView.as_view(), name="register"),
    path('me/', views.CurrentUserView.as_view(), name="current-user"),
]
```

The frontend is already configured to call this endpoint if the token doesn't contain admin info.

## Recommendation

**Use Option 1** (Customize JWT Token) as it's more efficient - the admin status is included in every token, so no additional API call is needed after login.

