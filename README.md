<div align="center">

# 🎯 ZoneCalculator PRO

### *The Complete Zone Diet Management Platform*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

**From simple calculator to complete platform** - ZoneCalculator PRO is a modern, AI-powered platform for Zone Diet management, featuring meal planning, gamification, and multi-user support.

[🚀 Quick Start](#-quick-start) • [📚 API Docs](./API_DOCS.md) • [🏗️ Architecture](./ARCHITECTURE.md) • [🐛 Report Bug](https://github.com/MarcoBischero/zoneCalculator/issues)

</div>

---

## 🌟 What's New in v2.0 PRO

ZoneCalculator has evolved from a simple protein calculator into a **complete Zone Diet management platform**:

### 🎯 From Calculator to Platform

| v1.0 (Calculator) | v2.0 PRO (Platform) |
|-------------------|---------------------|
| Basic protein calculation | **Full nutrition platform** |
| Single user | **Multi-user with RBAC** |
| Manual meal planning | **AI-powered meal generation** |
| Static interface | **Gamification & engagement** |
| Basic features | **19 integrated features** |

### ✨ Major Enhancements

- 🤖 **AI Integration** - Google Gemini for recipe generation & image creation
- 👥 **Multi-User Platform** - Admin, Dietician, and Patient roles
- 🎮 **Gamification** - Points, levels, streaks, and leaderboards
- 📅 **Smart Calendar** - Weekly meal planning with drag & drop
- 🛒 **Auto Shopping Lists** - Generated from your meal plan
- 📊 **Analytics Dashboard** - Track progress and nutrition trends
- 🎨 **Modern UI** - Cyberpunk-inspired design with dark mode
- 🔒 **Enterprise Security** - NextAuth.js with role-based access

---

## 🚀 Features

### 🧮 Core Features

- **Protein Calculator** - Zone diet calculations based on body metrics
- **Meal Builder** - Drag-and-drop interface with 1000+ foods
- **Weekly Calendar** - Visual meal planning and scheduling
- **Food Database** - Comprehensive nutrition database
- **Shopping Lists** - Auto-generated from your calendar

### 🤖 AI-Powered Features

- **AI Chef** - Generate complete recipes from ingredients
- **Auto-Recipe** - Automatic cooking instructions & images
- **Vision API** - Food recognition from photos (experimental)
- **Smart Suggestions** - Personalized meal recommendations

### 👥 Multi-User Platform

- **Admin Dashboard** - Complete platform management
- **Dietician Portal** - Manage patients and meal plans
- **Patient Accounts** - Personal nutrition tracking
- **Role-Based Access** - Secure, hierarchical permissions

### 🎮 Gamification

- **Points System** - Earn points for healthy habits
- **Level Progression** - Unlock achievements
- **Daily Streaks** - Build consistency
- **Leaderboard** - Compete with community

### 📊 Analytics & Reports

- **Nutrition Trends** - Track macros over time
- **Progress Reports** - Visual analytics
- **Goal Tracking** - Monitor achievements
- **Daily News** - Personalized nutrition tips

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Next.js 14 | Modern UI framework |
| **Styling** | TailwindCSS + Radix UI | Beautiful, accessible design |
| **Backend** | Next.js API Routes | Serverless API |
| **Database** | MySQL + Prisma ORM | Type-safe data layer |
| **Auth** | NextAuth.js | Secure authentication |
| **AI** | Google Gemini | Recipe & image generation |
| **Deployment** | Vercel-ready | One-click deploy |

</div>

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- Google Gemini API key (for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/MarcoBischero/zoneCalculator.git
cd zoneCalculator

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma generate
npx prisma db push

# Seed database (optional)
node seed_db.js

# Start development server
npm run dev
```

Visit `http://localhost:3000` 🎉

### Environment Variables

```env
DATABASE_URL="mysql://user:password@localhost:3306/zonecalculator"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

---

## 📚 Documentation

- **[📖 API Documentation](./API_DOCS.md)** - Complete API reference
- **[🏗️ Architecture](./ARCHITECTURE.md)** - System design & patterns
- **[🚀 Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[🤖 AI Models](./docs/AI_MODELS.md)** - Logic and configuration of AI features

---

## 🎯 Use Cases

### For Individuals
- Track Zone diet macros effortlessly
- Get AI-generated meal ideas
- Build sustainable healthy habits
- Compete with friends via leaderboard

### For Dieticians
- Manage multiple patients
- Create custom meal plans
- Track patient progress
- Share recipes and tips

### For Clinics
- Multi-dietician support
- Patient management system
- Analytics and reporting
- White-label ready

---

## 🏗️ Project Structure

```
zoneCalculatorPRO/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # 19 API endpoints
│   │   ├── (pages)/           # 19 application pages
│   │   └── globals.css        # Global styles
│   ├── components/            # 19 React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── admin/            # Admin components
│   │   └── ...
│   └── lib/                   # Utilities & helpers
├── prisma/
│   └── schema.prisma          # Database schema (14 models)
├── public/                    # Static assets
└── docs/                      # Documentation
```

---

## 🎨 Screenshots

<div align="center">

### Dashboard
*Modern, cyberpunk-inspired interface with dark mode*

### Meal Builder
*Drag-and-drop meal planning with real-time nutrition tracking*

### AI Chef
*Generate complete recipes with images in seconds*

### Analytics
*Track your progress with beautiful charts*

</div>

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Mobile app (React Native)
- [ ] Advanced AI meal recommendations
- [ ] Social features (meal sharing)
- [ ] Integration with fitness trackers

### Q2 2025
- [ ] Multi-language support (ES, FR, DE)
- [ ] Offline mode (PWA)
- [ ] Barcode scanner
- [ ] Recipe import from websites

### Q3 2025
- [ ] White-label solution for clinics
- [ ] Advanced analytics & ML insights
- [ ] Marketplace for meal plans
- [ ] API for third-party integrations

[View full roadmap →](https://github.com/MarcoBischero/zoneCalculator/projects)

### 🚀 Roadmap 2.0: The "Killer App" Evolution
We are targeting 4 strategic pillars to revolutionize Zone Diet management:
1. **Hyper-Personalization (Digital Twin)**
2. **Frictionless Logging (Voice & Vision)**
3. **AI Nutritionist Coach (ZoneMentor)**
4. **Professional Marketplace**

[👉 Read the full Strategic Vision](./docs/ROADMAP_2.0.md)

---

## 📊 Stats

<div align="center">

| Metric | Count |
|--------|-------|
| **Pages** | 19 |
| **API Endpoints** | 19 |
| **Components** | 19 |
| **Database Models** | 14 |
| **Lines of Code** | 21,000+ |
| **Bundle Size** | 87.5 KB |

</div>

---

## 🌍 Community

- **[Discord](https://discord.gg/zonecalculator)** - Join our community
- **[Twitter](https://twitter.com/zonecalculator)** - Follow for updates
- **[Blog](https://blog.zonecalculator.app)** - Tips & tutorials
- **[YouTube](https://youtube.com/@zonecalculator)** - Video guides

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zone Diet** - Dr. Barry Sears for the Zone Diet methodology
- **Google Gemini** - AI-powered features
- **Vercel** - Hosting and deployment
- **Prisma** - Database ORM
- **Radix UI** - Accessible components
- **All Contributors** - Thank you! 🎉

---

## 💬 Support

Need help? We're here for you:

- 📧 **Email**: support@zonecalculator.app
- 💬 **Discord**: [Join our server](https://discord.gg/zonecalculator)
- 🐛 **Issues**: [GitHub Issues](https://github.com/MarcoBischero/zoneCalculator/issues)
- 📚 **Docs**: [API Documentation](./API_DOCS.md)

---

<div align="center">

**Made with ❤️ for the Zone Diet community**

⭐ **Star us on GitHub** — it helps!

[⬆ Back to top](#-zonecalculator-pro)

</div>
