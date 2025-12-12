# API Documentation - ZoneCalculator PRO

## Authentication

All protected endpoints require authentication via NextAuth.js session.

### Session Structure
```typescript
{
  user: {
    id: number,
    username: string,
    email: string,
    role: number  // 1=Admin, 2=Dietician, 3=Patient
  }
}
```

---

## Endpoints

### 🏥 Health Check

#### `GET /api/health`
Health check endpoint for monitoring

**Auth:** Not required  
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T07:00:00.000Z",
  "database": "connected",
  "version": "2.0.0"
}
```

**Error Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-12-12T07:00:00.000Z",
  "database": "disconnected",
  "error": "Database connection failed"
}
```

---

### 🔐 Authentication

#### `POST /api/auth/signin`
Login user

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": { "id": 1, "username": "admin", "role": 1 }
}
```

---

### 🍽️ Meals

#### `GET /api/meals`
Get all meals for authenticated user

**Auth:** Required  
**Response:**
```json
[
  {
    "codicePasto": 1,
    "nome": "Breakfast Bowl",
    "blocks": 3,
    "alimenti": [...],
    "description": "AI-generated procedure",
    "imgUrl": "https://..."
  }
]
```

#### `POST /api/meals`
Create new meal

**Auth:** Required  
**Request:**
```json
{
  "nome": "Meal Name",
  "blocks": 3,
  "alimenti": [
    { "codAlimento": 1, "grAlimento": 100 }
  ]
}
```

#### `PUT /api/meals`
Update existing meal

**Auth:** Required  
**Request:**
```json
{
  "codicePasto": 1,
  "nome": "Updated Name",
  "blocks": 4
}
```

#### `DELETE /api/meals`
Delete meal

**Auth:** Required  
**Request:**
```json
{
  "codicePasto": 1
}
```

---

### 🤖 AI Features

#### `POST /api/recipe/generate`
Generate AI recipe with Gemini

**Auth:** Required  
**Request:**
```json
{
  "mealId": 1,
  "language": "it"
}
```

**Response:**
```json
{
  "success": true,
  "procedure": "1. Step one...\n2. Step two...",
  "imgUrl": "https://generated-image-url"
}
```

#### `POST /api/meals/ai-generate`
Generate complete meal with AI

**Auth:** Required  
**Request:**
```json
{
  "blocks": 3,
  "preferences": "vegetarian, low-carb"
}
```

#### `POST /api/vision`
Analyze food image (experimental)

**Auth:** Required  
**Request:**
```json
{
  "image": "base64-encoded-image"
}
```

---

### 📅 Calendar

#### `GET /api/calendar`
Get user's calendar items

**Auth:** Required  
**Response:**
```json
[
  {
    "id": 1,
    "column": 0,
    "order": 0,
    "codPasto": 1,
    "pasto": { "nome": "Breakfast", "blocks": 3 }
  }
]
```

#### `POST /api/calendar`
Add meal to calendar

**Auth:** Required  
**Request:**
```json
{
  "codPasto": 1,
  "column": 0,
  "order": 0
}
```

#### `PUT /api/calendar`
Update calendar item position

**Auth:** Required  
**Request:**
```json
{
  "id": 1,
  "column": 1,
  "order": 2
}
```

#### `DELETE /api/calendar`
Remove from calendar

**Auth:** Required  
**Request:**
```json
{
  "id": 1
}
```

---

### 🥗 Foods

#### `GET /api/foods`
Get all food items

**Auth:** Required  
**Query Params:**
- `search` (optional): Filter by name
- `codTipo` (optional): Filter by type

**Response:**
```json
[
  {
    "codiceAlimento": 1,
    "nome": "Chicken Breast",
    "proteine": 23.0,
    "carboidrati": 0.0,
    "grassi": 1.2,
    "codTipo": 1,
    "tipo": { "descrizione": "Protein" }
  }
]
```

---

### 👥 Admin - Users

#### `GET /api/admin/users`
Get all users (Admin/Dietician only)

**Auth:** Required (role 1 or 2)  
**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "idRuolo": 3,
    "role": "Patient",
    "dietician": "Dr. Smith"
  }
]
```

#### `POST /api/admin/users`
Create new user

**Auth:** Required (role 1 or 2)  
**Request:**
```json
{
  "username": "new_user",
  "password": "secure_password",
  "email": "user@example.com",
  "targetRole": "3"
}
```

#### `PUT /api/admin/users`
Update user

**Auth:** Required (role 1 or 2)  
**Request:**
```json
{
  "id": 1,
  "username": "updated_name",
  "email": "new@example.com",
  "idRuolo": 3
}
```

---

### 🧮 Protein Calculator

#### `GET /api/user/protein`
Get user's protein needs

**Auth:** Required  
**Response:**
```json
{
  "codiceProtneed": 1,
  "peso": 70,
  "altezza": 175,
  "blocchi": 12,
  "proteineDay": 84.0,
  "percentualeMM": 45.5,
  "percentualeMG": 15.2
}
```

#### `POST /api/user/protein`
Calculate and save protein needs

**Auth:** Required  
**Request:**
```json
{
  "peso": 70,
  "altezza": 175,
  "sesso": "uomo",
  "collo": 38,
  "addome": 85,
  "moltiplicatore": "1.5"
}
```

---

### 🏆 Gamification

#### `GET /api/leaderboard`
Get leaderboard rankings

**Auth:** Required  
**Response:**
```json
[
  {
    "userId": 1,
    "username": "top_player",
    "points": 1500,
    "level": 5,
    "streak": 30
  }
]
```

---

### 📊 Reports

#### `GET /api/reports`
Get user analytics

**Auth:** Required  
**Response:**
```json
{
  "weeklyProgress": [...],
  "nutritionTrends": [...],
  "goalCompletion": 85
}
```

#### `GET /api/trends`
Get nutrition trends

**Auth:** Required  
**Response:**
```json
{
  "protein": [23, 25, 22, 24],
  "carbs": [30, 28, 32, 29],
  "fats": [10, 11, 9, 10]
}
```

---

### 📰 News

#### `GET /api/news`
Get daily nutrition tips

**Auth:** Required  
**Response:**
```json
{
  "title": "Today's Tip",
  "content": "Drink 8 glasses of water...",
  "date": "2025-12-12"
}
```

---

### 👤 User Profile

#### `GET /api/user`
Get current user profile

**Auth:** Required  
**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "nome": "John",
  "cognome": "Doe",
  "language": "it",
  "mode": "0"
}
```

#### `PUT /api/user`
Update user profile

**Auth:** Required  
**Request:**
```json
{
  "nome": "John",
  "cognome": "Doe",
  "email": "newemail@example.com",
  "language": "en"
}
```

#### `POST /api/user/password`
Change password

**Auth:** Required  
**Request:**
```json
{
  "currentPassword": "old_pass",
  "newPassword": "new_pass"
}
```

#### `POST /api/user/onboarding`
Complete onboarding

**Auth:** Required  
**Request:**
```json
{
  "completed": true,
  "preferences": {...}
}
```

---

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests/minute per user
- 1000 requests/hour per IP

---

## Webhooks (Future)

Planned webhook events:
- `meal.created`
- `calendar.updated`
- `goal.achieved`
- `level.up`
