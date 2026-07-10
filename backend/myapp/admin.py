from django.contrib import admin
from .models import Short, Recipe, Favorite

admin.site.register(Short)
admin.site.register(Recipe)
admin.site.register(Favorite)