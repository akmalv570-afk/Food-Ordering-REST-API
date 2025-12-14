from django.urls import path,include
from .views import FoodListApiView,AdminViewset
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register('admin/foods',AdminViewset,basename='admin-foods')

urlpatterns = [
    path('foods/',FoodListApiView.as_view()),
    path('', include(router.urls)),
]
