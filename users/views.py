from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
    


