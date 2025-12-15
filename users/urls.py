from django.urls import path
from . import views


urlpatterns = [
    path('register/',views.RegisterApiView.as_view(),name="register"),
    path('me/',views.CurrentUserView.as_view(),name="current-user"),
]


