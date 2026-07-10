from django.db import models
from django.contrib.auth.models import User

class Short(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shorts")
    title = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to="shorts/")
    is_featured = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_featured:
            Short.objects.filter(is_featured=True).exclude(pk=self.pk).update(is_featured=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or self.file.name


class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ("Easy", "Easy"),
        ("Medium", "Medium"),
        ("Hard", "Hard"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="recipes/")
    video = models.FileField(upload_to="recipe_videos/", blank=True, null=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="Easy")
    favorites_count = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "recipe")  # one favorite per user per recipe