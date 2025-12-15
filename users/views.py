from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer
from drf_spectacular.utils import extend_schema



@extend_schema(
    summary="User registration",
    description="Create a new user account",
    tags=["Auth"]
)
class RegisterApiView(APIView):
    def post(self,request):
        serializer = RegisterSerializer(data =request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Get current user",
    description="Get authenticated user's information including admin status",
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
        }, status=status.HTTP_200_OK)
    


