# working.md

- **System Architecture**:
  - Full-stack food blog application utilizing a Django REST Framework (DRF) backend and a React (Vite) frontend.
  - Local running servers: Backend runs on port `8000` (`python manage.py runserver`), Frontend on port `5173` (`npm run dev`).
- **Core Technology Stack**:
  - **Backend**: Django 4.x, Django REST Framework, JWT (`djangorestframework-simplejwt`), PIL (`Pillow`), SQLite.
  - **Frontend**: React 19, Vite 8, Tailwind CSS v4, shadcn/ui, Axios, React Router DOM v7.
- **Frontend Pages & Routes**:
  - **Home**: Renders a fullscreen background of the featured short video, followed by a grid of shorts and latest recipes.
  - **Recipes**: Displays recipe list with full-text search, difficulty filters, and favorite buttons.
  - **Recipe Details**: Displays a split hero banner, step-by-step instruction cards, video player, and a static stub review panel.
  - **Admin**: Contains upload forms for shorts and recipes, incorporating live rate-limit countdown timers.
  - **Auth**: Dedicated Register, Login, and Protected Admin routes.
- **Key System Quirks**:
  - Console-only email backend (messages print to Terminal, not sent).
  - Hardcoded production-unsafe `SECRET_KEY`.
  - Missing authorization guard on the frontend `/favorites` route.
  - Denormalized recipe favorites count tracked manually in views instead of dynamically computed.

# views.py

- **Core Views & Business Logic**:
  - **User Registration** ([register_view](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L37)) & **Login** ([login_view](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L60)): Handles validation, database record creation, issues a welcome email, and returns JWT tokens (`access` and `refresh`).
  - **Image Processing** ([compress_image](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L25)): Automatically converts RGBA/P formats to standard RGB, resizes to a maximum width of 1200px, and saves as 80% quality JPEG format.
  - **Rate Limiting**: Custom Python logic checking recent uploads in a sliding window to block spamming on Short uploads (5/hour) and Recipe uploads (10/day), returning a HTTP 429 status code with retry timers.
  - **Listing & Details**: Public endpoints for listing shorts ([shorts_list](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L76)), listing recipes with per-user favorited flags ([recipes_list](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L83)), and retrieving details ([recipe_detail](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L178)).
  - **Favoriting Toggle** ([favorite_recipe](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py#L162)): Toggles a User-Recipe favorite link and modifies the denormalized `favorites_count` field.
- **Special Entry: Plugins & Libraries Used in [views.py](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/views.py)**:
  - **Django REST Framework (DRF)** (`rest_framework.decorators.api_view`, `rest_framework.permissions.IsAuthenticated`, `Response`, `status`): Third-party library for building web APIs, defining route handlers, response envelopes, and validating authorization.
  - **SimpleJWT** (`rest_framework_simplejwt.tokens.RefreshToken`): A JWT authentication plugin used to programmatically generate and sign user authentication/refresh tokens.
  - **Pillow** (`PIL.Image`): Standard imaging library fork used to open, check color space mode, resize, and compress user-submitted recipe cover photos.
  - **Django Core File Helper** (`django.core.files.base.ContentFile`): Built-in module used to wrap bytes of compressed images, allowing standard Django File storage methods to save them.
  - **Django Core Mail** (`django.core.mail.send_mail`): Built-in library used to dispatch user-welcome notifications to the system output stream.

# models.py

- **Data Models**:
  - [Short](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/models.py#L4): Represents short-form video content. Features a custom `save()` method override enforcing that only one short can be marked `is_featured` at any time (enforced via database query and update on conflict).
  - [Recipe](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/models.py#L20): Database table storing main recipe objects including text descriptions, cover images, video file paths, difficulty choices, and a denormalized popularity counter.
  - [Favorite](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/models.py#L38): Serves as a linking table for the User-Recipe relationship. Enforces uniqueness across both foreign keys via a `unique_together` constraint, preventing double favorites.
- **Special Entry: Plugins & Libraries Used in [models.py](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/models.py)**:
  - **Django ORM** (`django.db.models`): Built-in database abstraction framework providing fields (ForeignKey, DateTimeField, ImageField), model base class hooks, and querying utilities.
  - **Django Contrib Auth** (`django.contrib.auth.models.User`): Built-in authentication model plugin supplying standardized tables for email, password encryption, and user validation.

# serializers.py

- **Data Serialization Layer**:
  - Converts complex model querysets and instances to JSON formatting for standard API operations.
  - [UserSerializer](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/serializers.py#L5): Serializes standard user properties (`id`, `username`, `email`), ensuring security sensitive fields (e.g., password hashes) are never exposed.
  - [ShortSerializer](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/serializers.py#L10): Serializes short-form video instances, embedding the read-only uploader user detail.
  - [RecipeSerializer](file:///c:/Users/coolb/Documents/MyFoodBlog/backend/myapp/serializers.py#L16): Serializes recipes, integrating a nested read-only uploader user serializer.
