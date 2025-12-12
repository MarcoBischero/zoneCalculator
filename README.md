# ZoneCalculator PRO

**Modern Zone Diet Management Platform** with AI-powered features, gamification, and comprehensive meal planning.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd zoneCalculatorPRO

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
npx prisma generate
npx prisma db push

# Seed database (optional)
node seed_db.js

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📦 Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Database**: MySQL + Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: React 18 + TailwindCSS + Radix UI
- **AI**: Google Gemini (Generative AI)
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## ✨ Features

### Core Features
- 🔐 **Authentication** - Role-based access control (Admin, Dietician, Patient)
- 🧮 **Protein Calculator** - Zone diet calculations with body metrics
- 🍽️ **Meal Builder** - Drag-and-drop meal planning with nutrition tracking
- 📅 **Calendar System** - Weekly meal scheduling
- 🥗 **Food Database** - Comprehensive nutrition database
- 🛒 **Shopping List** - Auto-generated from calendar

### AI Features
- 🤖 **AI Chef** - Gemini-powered recipe generation
- 📸 **Vision API** - Food recognition (experimental)
- ✨ **Auto-Recipe** - Automatic procedure and image generation

### Gamification
- 🏆 **Points & Levels** - User progression system
- 🔥 **Streaks** - Daily engagement tracking
- 📊 **Leaderboard** - Community rankings

### Admin Features
- 👥 **User Management** - Create and manage users
- 🏥 **Dietician Portal** - Patient management for dieticians
- 📈 **Reports & Analytics** - User progress tracking

## 🗂️ Project Structure

```
zoneCalculatorPRO/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (18 endpoints)
│   │   ├── admin/             # Admin dashboard
│   │   ├── calculator/        # Protein calculator
│   │   ├── calendar/          # Meal calendar
│   │   ├── chef/              # AI recipe generator
│   │   ├── foods/             # Food database
│   │   ├── meals/             # Meal builder
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── admin/            # Admin-specific components
│   └── lib/                   # Utilities and helpers
├── prisma/
│   └── schema.prisma          # Database schema (14 models)
└── public/                    # Static assets
```

## 🔑 Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="mysql://user:password@localhost:3306/zonecalculator"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

## 📊 Database Schema

14 models including:
- **User** - User accounts with role hierarchy
- **Pasto** - Meals with AI-generated content
- **Alimento** - Food items with nutrition data
- **CalendarItem** - Meal scheduling
- **GamificationProfile** - User gamification data
- **Role/Feature** - RBAC system

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
npx prisma studio          # Visual database editor
npx prisma generate        # Generate Prisma Client
npx prisma db push         # Push schema changes
```

## 🧪 Testing

```bash
# Verify database connection
node verify_db.js

# Check database schema
node check-schema.js

# Run security audit
npm audit
```

## 📱 User Roles

1. **Super Admin (role=1)**
   - Full system access
   - User management
   - Platform configuration

2. **Dietician (role=2)**
   - Patient management
   - Meal plan creation
   - Progress tracking

3. **Patient (role=3)**
   - Personal meal planning
   - Progress tracking
   - Gamification features

## 🎨 UI Themes

- **Light Mode** - Clean, professional
- **Dark Mode** - Modern, cyberpunk-inspired
- **Tokyo Style** - Vibrant, neon accents
- **Glassmorphism** - Frosted glass effects

## 🚀 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Test production build locally
npm start
```

### Environment Setup

1. Setup MySQL database
2. Configure environment variables
3. Run database migrations
4. Seed initial data (roles, features)
5. Create admin user

### Recommended Platforms
- **Vercel** - Optimal for Next.js
- **Railway** - Database + App hosting
- **PlanetScale** - MySQL database

## 📈 Performance

- **Bundle Size**: 87.5 kB (shared JS)
- **Build Time**: ~30 seconds
- **Pages**: 36 routes (16 static, 11 dynamic, 9 API)
- **TypeScript**: Strict mode enabled
- **Security**: 0 vulnerabilities

## 🔒 Security

- ✅ NextAuth.js authentication
- ✅ Role-based access control
- ✅ bcrypt password hashing
- ✅ API route protection
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

## 📝 API Endpoints

### Public
- `POST /api/auth/[...nextauth]` - Authentication

### Protected
- `GET/POST /api/meals` - Meal management
- `GET/POST /api/calendar` - Calendar operations
- `GET /api/foods` - Food database
- `POST /api/recipe/generate` - AI recipe generation
- `GET/POST /api/admin/users` - User management
- `GET /api/leaderboard` - Gamification rankings
- `GET /api/reports` - Analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary software.

## 🆘 Support

For issues or questions:
- Check existing issues
- Create new issue with detailed description
- Contact: support@zonecalculator.app

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI meal recommendations
- [ ] Social features (meal sharing)
- [ ] Integration with fitness trackers
- [ ] Multi-language support expansion
- [ ] Offline mode (PWA)

---

**Built with ❤️ for the Zone Diet community**
