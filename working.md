# MyFoodBlog — Working Reference

> A full-stack food blog with Django REST Framework backend + React (Vite) frontend.
> Both servers are currently running: backend on `:8000`, frontend on `:5173`.

---

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [Tech Stack](#2-tech-stack)
3. [Running Locally](#3-running-locally)
4. [Backend — Django](#4-backend--django)
   - [Settings Highlights](#settings-highlights)
   - [Database Models](#database-models)
   - [Serializers](#serializers)
   - [API Routes](#api-routes)
   - [Views & Business Logic](#views--business-logic)
   - [Email](#email)
5. [Frontend — React + Vite](#5-frontend--react--vite)
   - [Dependencies](#dependencies)
   - [Routing](#routing)
   - [Auth System](#auth-system)
   - [Pages](#pages)
   - [Components](#components)
6. [Media & File Uploads](#6-media--file-uploads)
7. [Rate Limiting](#7-rate-limiting)
8. [Auth Flow (JWT)](#8-auth-flow-jwt)
9. [Known Quirks / Notes](#9-known-quirks--notes)

---

## 1. Project Structure

```
MyFoodBlog/
├── backend/                  # Django project root
│   ├── backend/              # Django config package
│   │   ├── settings.py
│   │   ├── urls.py           # Root URL config
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── myapp/                # Main Django app
│   │   ├── models.py         # Short, Recipe, Favorite
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── media/                # User-uploaded files
│   │   ├── recipes/          # Recipe cover images
│   │   ├── recipe_videos/    # Recipe videos
│   │   ├── shorts/           # Short video files
│   │   └── videos/           # (legacy/unused)
│   ├── db.sqlite3
│   └── manage.py
│
└── frontend/                 # Vite + React project
    ├── src/
    │   ├── App.jsx            # Router root
    │   ├── AuthContext.jsx    # Global auth + axios instance
    │   ├── ProtectedRoute.jsx # Auth guard
    │   ├── Toast.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   ├── index.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── RecipeList.jsx
    │   │   └── ui/            # shadcn/ui components
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── About.jsx
    │   │   ├── Recipes.jsx
    │   │   ├── RecipeDetail.jsx
    │   │   ├── FavoritesPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Admin.jsx
    │   │   ├── Services.jsx
    │   │   └── Logout.jsx
    │   └── lib/
    ├── public/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── components.json        # shadcn/ui config
```

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Django 4.x + Django REST Framework |
| Auth | `djangorestframework-simplejwt` (JWT) |
| CORS | `django-cors-headers` |
| Image processing | Pillow |
| Database | SQLite (`db.sqlite3`) |
| Frontend framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (`@base-ui/react`) |
| HTTP client | Axios |
| Routing | React Router DOM v7 |
| Icons | Lucide React |
| Font | Geist Variable (`@fontsource-variable/geist`) |

---

## 3. Running Locally

### Backend
```powershell
cd backend
# Activate venv first
python manage.py runserver        # → http://localhost:8000
```

### Frontend
```powershell
cd frontend
npm run dev                       # → http://localhost:5173
```

> **Both servers must run simultaneously.** The frontend calls `http://localhost:8000` directly (no proxy).

---

## 4. Backend — Django

### Settings Highlights

| Setting | Value |
|---|---|
| `DEBUG` | `True` |
| `ALLOWED_HOSTS` | `[]` (localhost only) |
| `DATABASE` | SQLite |
| `MEDIA_URL` | `/media/` |
| `MEDIA_ROOT` | `<BASE_DIR>/media/` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| `EMAIL_BACKEND` | `console` (emails printed to terminal, not sent) |
| JWT access token lifetime | 30 minutes |
| JWT refresh token lifetime | 7 days |

---

### Database Models

#### `Short` — short-form video clips
| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | cascade delete |
| `title` | CharField(100) | optional caption |
| `file` | FileField | uploads to `shorts/` |
| `is_featured` | BooleanField | only one can be featured at a time — enforced in `save()` |
| `uploaded_at` | DateTimeField | auto |

#### `Recipe` — full recipes
| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | cascade delete |
| `title` | CharField(200) | |
| `description` | TextField | instructions / story |
| `image` | ImageField | uploads to `recipes/`, auto-compressed |
| `video` | FileField | optional, uploads to `recipe_videos/`, max 50 MB |
| `difficulty` | CharField | `Easy` / `Medium` / `Hard` |
| `favorites_count` | PositiveIntegerField | denormalized counter |
| `uploaded_at` | DateTimeField | auto |

#### `Favorite` — user ↔ recipe many-to-many
| Field | Type | Notes |
|---|---|---|
| `user` | FK → User | |
| `recipe` | FK → Recipe | `related_name="favorited_by"` |
| `created_at` | DateTimeField | auto |
| Meta | `unique_together` | one favorite per user per recipe |

---

### Serializers

| Serializer | Model | Fields |
|---|---|---|
| `UserSerializer` | User | `id`, `username`, `email` |
| `ShortSerializer` | Short | `id`, `user` (nested), `title`, `file`, `is_featured`, `uploaded_at` |
| `RecipeSerializer` | Recipe | `id`, `user` (nested), `title`, `description`, `image`, `video`, `difficulty`, `favorites_count`, `uploaded_at` |

---

### API Routes

All routes are prefixed with `/api/`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register/` | Public | Register with email + password; sends welcome email; returns JWT pair |
| `POST` | `/api/login/` | Public | Login; returns JWT pair + user object |
| `POST` | `/api/token/refresh/` | Public | Refresh access token via refresh token |
| `GET` | `/api/shorts/` | Public | List all shorts ordered by newest |
| `GET` | `/api/recipes/` | Public | List all recipes ordered by `favorites_count` desc |
| `GET` | `/api/recipes/<id>/` | Public | Single recipe detail |
| `POST` | `/api/upload/short/` | 🔒 Auth | Upload a short video (rate-limited) |
| `POST` | `/api/upload/recipe/` | 🔒 Auth | Upload a recipe with image + optional video (rate-limited) |
| `POST` | `/api/recipes/<id>/favorite/` | 🔒 Auth | Toggle favorite on/off; updates `favorites_count` |
| `GET` | `/api/favorites/` | 🔒 Auth | List current user's favorited recipes |

---

### Views & Business Logic

#### `compress_image()`
- Opens uploaded image with Pillow
- Converts RGBA/P → RGB
- Resizes to max width 1200px (maintains aspect ratio)
- Saves as JPEG quality 80
- Returns a `ContentFile` with `.jpg` extension

#### `register_view`
1. Checks for duplicate username (email as username)
2. Creates user
3. Sends welcome email (console backend — prints to terminal)
4. Returns JWT access + refresh + user

#### `upload_short`
- Rate-limited: **5 shorts per 1-hour window** per user
- Returns `retry_after_seconds` on 429
- Accepts `is_featured` flag (enforced singleton via model `save()`)

#### `upload_recipe`
- Rate-limited: **10 recipes per 24-hour window** per user
- Validates video ≤ 50 MB
- Auto-compresses the cover image before saving

#### `favorite_recipe`
- Toggle: if favorite exists → delete it and decrement count; else create and increment
- Updates `favorites_count` on the Recipe model directly

---

### Email

- Backend: **console** (`django.core.mail.backends.console.EmailBackend`)
- Emails are printed to the Django terminal, not actually delivered
- Welcome email sent on registration with a link to `/recipes`

---

## 5. Frontend — React + Vite

### Dependencies

| Package | Purpose |
|---|---|
| `react` / `react-dom` v19 | Core framework |
| `react-router-dom` v7 | Client-side routing |
| `axios` | HTTP requests |
| `tailwindcss` v4 | Utility-first CSS |
| `shadcn` / `@base-ui/react` | Headless UI primitives |
| `lucide-react` | Icon set |
| `@fontsource-variable/geist` | Geist variable font |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Class composition utilities |
| `tw-animate-css` | Tailwind animation plugin |

---

### Routing

Defined in [`App.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/App.jsx):

| Path | Component | Protected? |
|---|---|---|
| `/` | `Home` | No |
| `/about` | `About` | No |
| `/recipes` | `Recipes` → `RecipeList` | No |
| `/recipes/:id` | `RecipeDetail` | No |
| `/favorites` | `FavoritesPage` | No |
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/admin` | `Admin` | ✅ Yes (`ProtectedRoute`) |

---

### Auth System

Implemented in [`AuthContext.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/AuthContext.jsx):

- **Axios instance** (`api`) with base URL `http://localhost:8000`
- **Request interceptor**: attaches `Authorization: Bearer <access>` from `localStorage`
- **Response interceptor**: on 401, automatically calls `/api/token/refresh/` with stored refresh token, retries the original request once. Calls `logout()` if refresh also fails.
- **Persistence**: `access`, `refresh`, and `user` stored in `localStorage`
- **Context value**: `{ user, isAuthenticated, login, register, logout, loading, api }`

---

### Pages

| Page | File | Key Behaviour |
|---|---|---|
| **Home** | [`Home.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/Home.jsx) | Hero with featured short video as fullscreen background; Shorts grid (9:16 aspect); Latest recipes grid |
| **Recipes** | [`Recipes.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/Recipes.jsx) | Renders `<RecipeList />` |
| **RecipeDetail** | [`RecipeDetail.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/RecipeDetail.jsx) | Fetches single recipe via `GET /api/recipes/<id>/`. **Split hero**: food image (left col) with `←` back button + dark panel (right col) showing title, difficulty/cuisine badge pills, prep & cook time, star rating, and author. **Instructions**: description text is split by newlines into numbered step cards arranged in a 2-column grid, each with a cycling emoji icon in an orange circle. **Video player**: shown beside instructions when `recipe.video` exists. **Reviews panel** (dark background): three static stub reviewer cards (initials avatar, name, star rating, quote) + an inline "Leave a Review" form (name input, interactive star picker, comment input, Submit button — not yet persisted). |
| **FavoritesPage** | [`FavoritesPage.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/FavoritesPage.jsx) | Calls `GET /api/favorites/`; renders user's saved recipes |
| **Login** | [`Login.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/Login.jsx) | Email + password form; calls `AuthContext.login()` |
| **Register** | [`Register.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/Register.jsx) | Email + password form; calls `AuthContext.register()` |
| **Admin** | [`Admin.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/Admin.jsx) | Upload Short form + Upload Recipe form; countdown timer on rate-limit 429 |
| **About** | [`About.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/About.jsx) | Static about page |
| **Services** | [`Services.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/pages/Services.jsx) | Static services page |

---

### Components

| Component | File | Description |
|---|---|---|
| `Navbar` | [`Navbar.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/components/Navbar.jsx) | Top navigation bar |
| `Footer` | [`Footer.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/components/Footer.jsx) | Site footer |
| `RecipeList` | [`RecipeList.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/components/RecipeList.jsx) | Full recipe browser with hero banner, live search, difficulty filter pills, skeleton loading cards, and inline favorite toggle |
| `ProtectedRoute` | [`ProtectedRoute.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/ProtectedRoute.jsx) | Wraps routes that need auth; redirects to `/login` if unauthenticated |
| `Toast` | [`Toast.jsx`](file:///c:/Users/coolb/Documents/MyFoodBlog/frontend/src/Toast.jsx) | Toast notification primitive |
| `ui/*` | `src/components/ui/` | shadcn/ui generated components (Button, etc.) |

---

## 6. Media & File Uploads

| Upload Type | Field | Storage Path | Notes |
|---|---|---|---|
| Recipe image | `image` | `media/recipes/` | Auto-compressed to max 1200px JPEG q80 |
| Recipe video | `video` | `media/recipe_videos/` | Optional; max 50 MB enforced in view |
| Short video | `file` | `media/shorts/` | No size enforcement in backend currently |

Media files are served by Django in `DEBUG=True` via `static()` helper in root `urls.py`.

In the frontend, media URLs are constructed as:
```js
const API_BASE = "http://localhost:8000";
<img src={`${API_BASE}${r.image}`} />  // r.image is e.g. "/media/recipes/dish.jpg"
```

---

## 7. Rate Limiting

Implemented in-app (not via Django middleware or a third-party package).

| Upload type | Limit | Window | On limit |
|---|---|---|---|
| Shorts | 5 uploads | 1 hour | 429 + `retry_after_seconds` |
| Recipes | 10 uploads | 24 hours | 429 + `retry_after_seconds` |

The Admin page shows a **live countdown timer** (`MM:SS`) when a 429 is received.

---

## 8. Auth Flow (JWT)

```
Register / Login
      │
      ▼
Backend returns { access, refresh, user }
      │
      ▼
Frontend stores in localStorage
      │
      ▼
Every API request → Authorization: Bearer <access>
      │
      ▼
Access expires (30 min)?
      │
      ├── 401 received
      │         │
      │         ▼
      │   POST /api/token/refresh/  { refresh }
      │         │
      │         ├── Success → new access stored, request retried
      │         └── Failure → logout() called, tokens cleared
      │
Logout → localStorage cleared, user state = null
```

---

## 9. Known Quirks / Notes

- **Email is console-only**: Registration emails print to the Django terminal; nothing is sent to real inboxes.
- **`SECRET_KEY` is hardcoded** in `settings.py` as `"your-secret-key"` — not safe for production.
- **`ALLOWED_HOSTS = []`** — only works with Django's dev server (DEBUG=True).
- **No short video size limit** on the backend — the Admin UI mentions MP4/MOV max 50 MB but the backend does not enforce this for shorts (only for recipe videos).
- **`favorites_count` is denormalized** — it is a plain integer field incremented/decremented in the view, not computed from the `Favorite` table dynamically.
- **`FavoritesPage` is not protected** — `GET /api/favorites/` requires auth but the route `/favorites` has no `ProtectedRoute` wrapper, so the page will fail silently for unauthenticated users.
- **`hideDummy` checkbox on Home page** — the label "Show people's choices only" filters shorts where `s.user` is truthy (i.e., has an associated user). In practice all shorts have a user, so this filter may not do anything visible.
- The `videos/` directory in `media/` is unused — no model uploads there.
