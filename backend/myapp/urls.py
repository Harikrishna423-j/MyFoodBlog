from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("shorts/", views.shorts_list, name="shorts_list"),
    path("recipes/", views.recipes_list, name="recipes_list"),
    path("upload/short/", views.upload_short, name="upload_short"),
    path("upload/recipe/", views.upload_recipe, name="upload_recipe"),
    path("recipes/<int:recipe_id>/favorite/", views.favorite_recipe, name="favorite_recipe"),
    path("recipes/<int:recipe_id>/", views.recipe_detail, name="recipe_detail"),
    path("favorites/", views.my_favorites, name="my_favorites"),
]