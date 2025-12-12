# Architecture Overview - ZoneCalculator PRO

## System Architecture

ZoneCalculator PRO è una moderna applicazione web full-stack costruita con Next.js 14, progettata per la gestione della dieta a zona con funzionalità AI avanzate.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React UI  │  │  Next.js     │  │  TailwindCSS     │   │
│  │  Components │  │  App Router  │  │  + Radix UI      │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer (Next.js)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Components & Pages                │   │
│  │  • Authentication (NextAuth.js)                       │   │
│  │  • Server-Side Rendering (SSR)                        │   │
│  │  • Static Site Generation (SSG)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  API Routes Layer                     │   │
│  │  • REST API Endpoints (19 routes)                    │   │
│  │  • Business Logic                                     │   │
│  │  • Request Validation                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma ORM Client                        │   │
│  │  • Type-safe database queries                         │   │
│  │  • Schema migrations                                  │   │
│  │  • Relation management                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (MySQL)                     │
│  • 14 Tables (Users, Meals, Foods, etc.)                    │
│  • Indexes for performance                                   │
│  • Foreign key constraints                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Google      │  │  External    │                        │
│  │  Gemini AI   │  │  APIs        │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components (React)

```
src/components/
├── ui/                    # Base UI components (Radix UI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── label.tsx
│   ├── tabs.tsx
│   └── ...
├── admin/                 # Admin-specific components
│   └── AddUserDialog.tsx
├── calculator/            # Protein calculator components
│   ├── BodyMetrics.tsx
│   ├── Results.tsx
│   └── Calculator.tsx
├── dashboard/             # Dashboard widgets
│   ├── StatsCard.tsx
│   └── ChartWidget.tsx
├── foods/                 # Food management
│   ├── FoodSelector.tsx
│   └── AddFoodDialog.tsx
├── layout/                # Layout components
│   └── Navbar.tsx
├── providers/             # Context providers
│   └── SessionProvider.tsx
├── theme-provider.tsx     # Theme management
└── theme-toggle.tsx       # Theme switcher
```

### Application Pages

```
src/app/
├── (auth)/
│   └── login/             # Authentication
├── (dashboard)/
│   ├── page.tsx           # Homepage/Dashboard
│   ├── calculator/        # Protein calculator
│   ├── meals/             # Meal builder
│   ├── calendar/          # Weekly planner
│   ├── foods/             # Food database
│   ├── chef/              # AI recipe generator
│   ├── recipe/[id]/       # Recipe detail
│   ├── shopping-list/     # Shopping list
│   ├── leaderboard/       # Gamification
│   ├── reports/           # Analytics
│   └── settings/          # User settings
├── admin/
│   ├── page.tsx           # Admin dashboard
│   └── users/             # User management
└── api/                   # API routes
    ├── auth/
    ├── meals/
    ├── calendar/
    ├── foods/
    └── ...
```

---

## Data Model Architecture

### Core Entities

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │──┐
│ username    │  │
│ email       │  │
│ password    │  │
│ idRuolo     │──┼──→ Role
│ dieticianId │──┘ (self-reference)
└─────────────┘
      │
      │ 1:N
      ↓
┌─────────────┐
│   Pasto     │
├─────────────┤
│ codicePasto │
│ nome        │
│ blocks      │
│ description │ (AI-generated)
│ imgUrl      │ (AI-generated)
│ codUser     │
└─────────────┘
      │
      │ N:M
      ↓
┌─────────────┐
│PastoAlimento│
├─────────────┤
│ codPasto    │
│ codAlimento │
│ grAlimento  │
└─────────────┘
      │
      │ N:1
      ↓
┌─────────────┐
│  Alimento   │
├─────────────┤
│codiceAlimento│
│ nome        │
│ proteine    │
│ carboidrati │
│ grassi      │
│ codTipo     │──→ Tipo
│ codFonte    │──→ Fonte
└─────────────┘
```

### Supporting Entities

- **CalendarItem**: Meal scheduling
- **ProtNeed**: Protein requirements calculation
- **GamificationProfile**: User points, levels, streaks
- **Role/RoleFeature/Feature**: RBAC system

---

## API Architecture

### RESTful API Design

All API endpoints follow REST principles:

```
/api/
├── auth/[...nextauth]     # Authentication (NextAuth.js)
├── health                 # Health check
├── meals                  # Meal CRUD
│   └── ai-generate        # AI meal generation
├── calendar               # Calendar operations
├── foods                  # Food database
├── recipe/generate        # AI recipe generation
├── vision                 # Image recognition
├── user                   # User profile
│   ├── protein            # Protein calculations
│   ├── password           # Password change
│   └── onboarding         # Onboarding status
├── admin/
│   ├── users              # User management
│   └── fix-meals          # Data migration
├── leaderboard            # Rankings
├── reports                # Analytics
├── trends                 # Nutrition trends
├── news                   # Daily tips
└── seed                   # Database seeding
```

### Authentication Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│Client│                │NextAuth  │              │ Database │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │ POST /api/auth/signin   │                         │
   │────────────────────────>│                         │
   │                         │ Verify credentials      │
   │                         │────────────────────────>│
   │                         │<────────────────────────│
   │                         │ Create session          │
   │<────────────────────────│                         │
   │ Set session cookie      │                         │
   │                         │                         │
   │ GET /api/meals          │                         │
   │────────────────────────>│                         │
   │                         │ Verify session          │
   │                         │ Get user from session   │
   │                         │ Query meals             │
   │                         │────────────────────────>│
   │                         │<────────────────────────│
   │<────────────────────────│                         │
   │ Return meals            │                         │
```

---

## Security Architecture

### Authentication & Authorization

1. **NextAuth.js** - Session-based authentication
2. **bcrypt** - Password hashing with salt
3. **RBAC** - Role-based access control (3 roles)
4. **Middleware** - Route protection

### Data Security

- **Prisma ORM** - SQL injection prevention
- **React** - XSS protection (auto-escaping)
- **Environment Variables** - Secrets management
- **HTTPS** - Encrypted communication (production)

---

## AI Integration Architecture

### Gemini AI Integration

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ Request recipe generation
       ↓
┌──────────────┐
│ API Route    │
│ /api/recipe/ │
│  generate    │
└──────┬───────┘
       │ Call Gemini API
       ↓
┌──────────────┐
│ Google       │
│ Gemini AI    │
│              │
│ • Text Gen   │
│ • Image Gen  │
│ • Vision API │
└──────┬───────┘
       │ Return AI-generated content
       ↓
┌──────────────┐
│  Database    │
│ Save to Pasto│
└──────────────┘
```

### AI Features

1. **AI Chef** - Recipe generation from meal data
2. **Auto-Recipe** - Automatic procedure and image
3. **Vision API** - Food recognition from photos
4. **Smart Suggestions** - Meal recommendations

---

## Performance Architecture

### Optimization Strategies

1. **Server Components** - Reduce client-side JS
2. **Code Splitting** - Lazy load components
3. **Image Optimization** - Next.js Image component
4. **Static Generation** - Pre-render pages
5. **API Route Caching** - Cache frequent queries

### Bundle Optimization

- **Shared Chunks**: 87.5 KB
- **Largest Page**: 219 KB (reports with charts)
- **Average Page**: ~110 KB

---

## Deployment Architecture

### Recommended Stack

```
┌─────────────────────────────────────┐
│         Vercel (Frontend)           │
│  • Next.js hosting                  │
│  • Edge functions                   │
│  • CDN                              │
│  • Auto-scaling                     │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│      PlanetScale (Database)         │
│  • MySQL hosting                    │
│  • Auto-scaling                     │
│  • Branching                        │
│  • Backups                          │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│      Google AI (Gemini)             │
│  • Text generation                  │
│  • Image generation                 │
│  • Vision API                       │
└─────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless API** - Easy to scale horizontally
- **Database Connection Pooling** - Prisma handles connections
- **CDN** - Static assets distributed globally
- **Serverless Functions** - Auto-scaling API routes

### Vertical Scaling

- **Database Optimization** - Indexes, query optimization
- **Caching Layer** - Redis for frequent queries
- **Image CDN** - Cloudinary/Imgix for media

---

## Monitoring & Observability

### Recommended Tools

1. **Sentry** - Error tracking
2. **Vercel Analytics** - Performance monitoring
3. **Prisma Pulse** - Database monitoring
4. **Google Analytics** - User behavior

### Health Checks

- `/api/health` - Application health
- Database connectivity
- External API status

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI components |
| **Framework** | Next.js 14 | Full-stack framework |
| **Styling** | TailwindCSS | Utility-first CSS |
| **UI Components** | Radix UI | Accessible primitives |
| **Database** | MySQL | Relational database |
| **ORM** | Prisma | Type-safe database access |
| **Authentication** | NextAuth.js | Session management |
| **AI** | Google Gemini | AI features |
| **Deployment** | Vercel | Hosting platform |

---

## Design Patterns

### Frontend Patterns

- **Component Composition** - Reusable UI components
- **Server Components** - Reduce client bundle
- **Client Components** - Interactive features
- **Custom Hooks** - Shared logic

### Backend Patterns

- **Repository Pattern** - Data access abstraction (Prisma)
- **Service Layer** - Business logic separation
- **Middleware Pattern** - Request processing
- **Factory Pattern** - Object creation (Prisma Client)

---

## Future Architecture Enhancements

### Planned Improvements

1. **Microservices** - Split AI features into separate service
2. **Event-Driven** - Webhook system for integrations
3. **Real-time** - WebSocket for live updates
4. **Caching** - Redis layer for performance
5. **Message Queue** - Background job processing
6. **GraphQL** - Alternative API layer

---

This architecture is designed to be:
- ✅ **Scalable** - Handle growing user base
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Secure** - Multiple security layers
- ✅ **Performant** - Optimized for speed
- ✅ **Extensible** - Easy to add features
