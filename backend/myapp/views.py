from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.base import ContentFile
from PIL import Image
import io
from django.utils import timezone
from datetime import timedelta

from .models import Short, Recipe, Favorite
from .serializers import ShortSerializer, RecipeSerializer, UserSerializer
from django.core.mail import send_mail
MAX_RECIPES = 10
MAX_VIDEO_MB = 50
MAX_SHORTS_PER_WINDOW = 5
UPLOAD_WINDOW_HOURS = 1

MAX_RECIPES_PER_WINDOW = 10
RECIPE_UPLOAD_WINDOW_HOURS = 24

def compress_image(uploaded_file, max_width=1200, quality=80):
    img = Image.open(uploaded_file)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=quality)
    return ContentFile(buffer.getvalue(), name=uploaded_file.name.rsplit(".", 1)[0] + ".jpg")


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    email = request.data.get("email")
    password = request.data.get("password")
    if User.objects.filter(username=email).exists():
        return Response({"error": "User already exists"}, status=400)
    user = User.objects.create_user(username=email, email=email, password=password)

    send_mail(
        subject="Welcome to MyFood Blog!",
        message=f"Hi {email},\n\nWelcome to MyFood Blog! Check out our recipes here: http://localhost:5173/recipes",
        from_email="noreply@myfoodblog.com",
        recipient_list=[email],
        fail_silently=False,
    )

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }, status=201)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(username=email, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)
    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    })


@api_view(["GET"])
@permission_classes([AllowAny])   # public viewing
def shorts_list(request):
    shorts = Short.objects.all().order_by("-uploaded_at")
    return Response({"shorts": ShortSerializer(shorts, many=True).data})


@api_view(["GET"])
@permission_classes([AllowAny])   # public viewing
def recipes_list(request):
    recipes = Recipe.objects.all().order_by("-favorites_count")
    data = RecipeSerializer(recipes, many=True).data
    # Attach per-user favorited state
    if request.user.is_authenticated:
        favorited_ids = set(
            Favorite.objects.filter(user=request.user).values_list("recipe_id", flat=True)
        )
    else:
        favorited_ids = set()
    for item in data:
        item["favorited"] = item["id"] in favorited_ids
    return Response({"recipes": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_short(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file provided"}, status=400)

    window_start = timezone.now() - timedelta(hours=UPLOAD_WINDOW_HOURS)
    recent_uploads = Short.objects.filter(user=request.user, uploaded_at__gte=window_start)

    if recent_uploads.count() >= MAX_SHORTS_PER_WINDOW:
        oldest = recent_uploads.order_by("uploaded_at").first()
        retry_at = oldest.uploaded_at + timedelta(hours=UPLOAD_WINDOW_HOURS)
        seconds_left = int((retry_at - timezone.now()).total_seconds())
        return Response({
            "error": "Upload limit reached",
            "retry_after_seconds": max(seconds_left, 0)
        }, status=429)

    is_featured = request.data.get("is_featured") in ["true", "True", True]
    short = Short.objects.create(
        user=request.user,
        title=request.data.get("title", ""),
        file=file,
        is_featured=is_featured,
    )
    return Response({"message": "Short uploaded", "short": ShortSerializer(short).data})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_recipe(request):
    image = request.FILES.get("image")
    video = request.FILES.get("video")
    if not image:
        return Response({"error": "Recipe image is required"}, status=400)

    window_start = timezone.now() - timedelta(hours=RECIPE_UPLOAD_WINDOW_HOURS)
    recent_recipes = Recipe.objects.filter(user=request.user, uploaded_at__gte=window_start)
    if recent_recipes.count() >= MAX_RECIPES_PER_WINDOW:
        oldest = recent_recipes.order_by("uploaded_at").first()
        retry_at = oldest.uploaded_at + timedelta(hours=RECIPE_UPLOAD_WINDOW_HOURS)
        seconds_left = int((retry_at - timezone.now()).total_seconds())
        return Response({
            "error": "Upload limit reached",
            "retry_after_seconds": max(seconds_left, 0)
        }, status=429)

    if video and video.size > MAX_VIDEO_MB * 1024 * 1024:
        return Response({"error": f"Video must be under {MAX_VIDEO_MB}MB"}, status=400)

    compressed_image = compress_image(image)

    recipe = Recipe.objects.create(
        user=request.user,
        title=request.data.get("title", ""),
        description=request.data.get("description", ""),
        image=compressed_image,
        video=video,
        difficulty=request.data.get("difficulty", "Easy"),
    )
    return Response({"message": "Recipe uploaded", "recipe": RecipeSerializer(recipe).data})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def favorite_recipe(request, recipe_id):
    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return Response({"error": "Recipe not found"}, status=404)
    fav, created = Favorite.objects.get_or_create(user=request.user, recipe=recipe)
    if not created:
        fav.delete()
        recipe.favorites_count = max(0, recipe.favorites_count - 1)
        favorited = False
    else:
        recipe.favorites_count += 1
        favorited = True
    recipe.save()
    return Response({"favorited": favorited, "favorites_count": recipe.favorites_count})


@api_view(["GET"])
@permission_classes([AllowAny])
def recipe_detail(request, recipe_id):
    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return Response({"error": "Recipe not found"}, status=404)
    return Response(RecipeSerializer(recipe).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_favorites(request):
    favorites = Favorite.objects.filter(user=request.user).select_related("recipe")
    recipes = [f.recipe for f in favorites]
    data = RecipeSerializer(recipes, many=True).data
    for item in data:
        item["favorited"] = True  # All results are by definition favorited
    return Response(data)


