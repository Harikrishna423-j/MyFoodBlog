from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Short, Recipe

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class ShortSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Short
        fields = ["id", "user", "title", "file", "is_featured", "uploaded_at"]

class RecipeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Recipe
        fields = ["id", "user", "title", "description", "image", "video", "difficulty", "favorites_count", "uploaded_at"]