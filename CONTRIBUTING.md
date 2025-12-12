# Contributing to ZoneCalculator PRO

First off, thank you for considering contributing to ZoneCalculator PRO! 🎉

It's people like you that make ZoneCalculator PRO such a great tool for the Zone Diet community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@zonecalculator.app.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simple issues perfect for beginners
- `help wanted` - Issues where we need community help

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- MySQL database
- Google Gemini API key (for AI features)

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/zoneCalculator.git
cd zoneCalculator

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Seed database (optional)
node seed_db.js

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000` to see your changes!

### Project Structure

```
zoneCalculatorPRO/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   └── lib/             # Utilities and helpers
├── prisma/              # Database schema
└── public/              # Static assets
```

## 🔄 Pull Request Process

1. **Update Documentation**: Update the README.md with details of changes if needed
2. **Follow Coding Standards**: Ensure your code follows our style guide
3. **Write Tests**: Add tests for new features
4. **Update Changelog**: Add your changes to CHANGELOG.md
5. **One Feature Per PR**: Keep pull requests focused on a single feature or fix
6. **Describe Your Changes**: Write a clear PR description

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Dependent changes merged

## 💻 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any` when possible
- Use interfaces for object shapes
- Use enums for fixed sets of values

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names
- Extract reusable logic into custom hooks

### Code Style

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

export function UserCard({ name, email }: UserProps) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// ❌ Bad
export function UserCard(props: any) {
  return <div><h2>{props.name}</h2></div>;
}
```

### File Organization

- One component per file
- Group related files in directories
- Use index files for clean imports
- Keep file names lowercase with hyphens

### CSS/Styling

- Use TailwindCSS utility classes
- Follow mobile-first approach
- Keep custom CSS minimal
- Use CSS variables for theming

## 📝 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(meals): add AI-powered recipe generation

Implemented Gemini AI integration for automatic recipe generation
including cooking instructions and images.

Closes #123

fix(auth): resolve session timeout issue

Users were being logged out prematurely. Increased session
timeout and added refresh token logic.

Fixes #456

docs(readme): update installation instructions

Added troubleshooting section and clarified database setup steps.
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

```typescript
describe('ProteinCalculator', () => {
  it('should calculate correct protein needs for male user', () => {
    const result = calculateProtein({
      weight: 70,
      height: 175,
      gender: 'male',
      activityLevel: 1.5
    });
    
    expect(result.blocks).toBe(12);
    expect(result.proteinGrams).toBe(84);
  });
});
```

## 🐛 Debugging

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Issues**
```bash
# Reset database
npx prisma migrate reset
npx prisma db push
```

**Environment Variables**
- Ensure `.env` file exists
- Check all required variables are set
- Restart dev server after changes

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 Areas Needing Help

We especially welcome contributions in these areas:

- 🧪 **Testing** - Expand test coverage
- 🌍 **Internationalization** - Add language support
- 📱 **Mobile App** - React Native development
- 🎨 **UI/UX** - Design improvements
- 📖 **Documentation** - Tutorials and guides
- 🐛 **Bug Fixes** - Check open issues

## 💬 Questions?

- 📧 Email: support@zonecalculator.app
- 💬 Discord: [Join our server](https://discord.gg/zonecalculator)
- 🐛 Issues: [GitHub Issues](https://github.com/MarcoBischero/zoneCalculator/issues)

## 🙏 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Invited to our contributors Discord channel
- Eligible for swag (coming soon!)

---

**Thank you for contributing to ZoneCalculator PRO!** 🎉

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making this project better for everyone.
