from django.shortcuts import render
from .models import Food
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet
from .serializers import FoodSerializer
from .permissions import IsAdminOrReadOnly
from drf_spectacular.utils import extend_schema


@extend_schema(
    summary="List foods",
    description="Get available foods with category filter and pagination",
    tags=["Foods"]
)
class FoodListApiView(ListAPIView):
    serializer_class = FoodSerializer

    def get_queryset(self):
        queryset = Food.objects.filter(is_available = True)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category = category)
        return queryset

@extend_schema(
    summary="Admin food management",
    description="Create, update, delete foods (admin only)",
    tags=["Foods"]
)
class AdminViewset(ModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = [IsAdminOrReadOnly]