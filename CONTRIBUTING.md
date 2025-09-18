# Contributing to StoryCraft

Thank you for your interest in contributing to StoryCraft! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm (comes with Node.js)
- PostgreSQL database (we recommend Neon for development)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:nickmartinwebdev/story-craft-app.git
   cd story-craft-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your database connection details and other required environment variables.

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes that need immediate attention
- `chore/` - Maintenance tasks, dependency updates, etc.
- `docs/` - Documentation updates

Example: `feature/user-authentication`, `bugfix/login-validation`

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(db): resolve connection timeout issues
docs: update README with new deployment instructions
```

### Pull Request Process

1. **Create a feature branch** from `master`
2. **Make your changes** following our coding standards
3. **Write or update tests** for your changes
4. **Run the test suite** to ensure everything passes
5. **Update documentation** if necessary
6. **Submit a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - List any breaking changes

### Code Review Guidelines

- All PRs require at least one review before merging
- Address all review comments before requesting re-review
- Keep PRs focused and reasonably sized
- Write descriptive PR descriptions

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions and components
- Write integration tests for API endpoints
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

## 🎨 Code Style

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use strict type checking

### React Guidelines

- Use functional components with hooks
- Keep components focused and single-responsibility
- Use proper prop types
- Follow React best practices for performance

### Database Guidelines

- Use Drizzle ORM for all database operations
- Write migrations for schema changes
- Use proper indexing for query performance
- Follow PostgreSQL best practices

## 📁 Project Structure

```
src/
├── app.tsx              # Main app component
├── auth/                # Authentication logic
├── components/          # Reusable UI components
├── db/                  # Database schema and connections
├── routes/              # TanStack Router routes
└── styles.css           # Global styles

.github/
└── workflows/           # GitHub Actions workflows

drizzle/                 # Database migrations
public/                  # Static assets
scripts/                 # Utility scripts
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Node.js version, browser)
- **Screenshots** if applicable
- **Error messages** or logs

### Feature Requests

For feature requests, please provide:

- **Problem description** - What problem does this solve?
- **Proposed solution** - How would you like it to work?
- **Alternatives considered** - What other solutions did you consider?
- **Additional context** - Any other relevant information

## 🔒 Security

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.

## 📜 License

By contributing to StoryCraft, you agree that your contributions will be licensed under the same license as the project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

## 📞 Getting Help

- Check existing issues and discussions
- Read the documentation thoroughly
- Ask questions in GitHub Discussions
- Join our community chat (if available)

Thank you for contributing to StoryCraft! 🎉