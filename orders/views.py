from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView,RetrieveAPIView
from .models import Order
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from .serializers import OrderListSerializer,OrderCreateSerializer,OrderDetailSerializer,OrderStatusUpdateSerializer
from drf_spectacular.utils import extend_schema


@extend_schema(
    summary="Create order",
    description="Authenticated user creates a new order with items",
    request=OrderCreateSerializer,
    responses={201: OrderListSerializer}
)
class OrderCreateApiView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        serializer = OrderCreateSerializer(data = request.data,context = {"request":request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        return Response(
            {
            'message':'Order created',
            'order_id':order.id,
            'total_price':order.total_price
        },
        status=status.HTTP_201_CREATED
        )

@extend_schema(
    summary="My orders",
    description="Get authenticated user's order history",
    responses=OrderListSerializer
)
class MyOrdersAPIView(ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@extend_schema(
    summary="Order detail",
    description="Get detail of a single order (only owner)",
    responses=OrderDetailSerializer
)  
class OrderDetailAPIView(RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@extend_schema(
    summary="Update order status",
    description="Admin updates order status",
    request=OrderStatusUpdateSerializer,
    responses={200: None}
)
class OrderStatusUpdateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusUpdateSerializer(
            order, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Order status updated"},
            status=status.HTTP_200_OK
        )

class AdminOrderListAPIView(ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderListSerializer
    permission_classes = [IsAdminUser]
