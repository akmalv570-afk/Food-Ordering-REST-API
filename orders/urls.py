from django.urls import path
from . import views

urlpatterns = [
path('create/',views.OrderCreateApiView.as_view(),name='create'),
path('my/',views.MyOrdersAPIView.as_view(),name='my-orders'),
path('<int:pk>/',views.OrderDetailAPIView.as_view()),
path('admin/orders/<int:pk>/status/',views.OrderStatusUpdateAPIView.as_view()),
]

