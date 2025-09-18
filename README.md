# StoryCraft

A modern full-stack web application built with **TanStack Start**, **TanStack DB**, **Mantine UI**, and **Neon PostgreSQL**. This project demonstrates authentication, real-time data management, and deployment to Cloudflare Pages.

## 🚀 Features

- **Modern Stack**: Built with TanStack Start (React SSR), TanStack DB (reactive client store), and Mantine UI
- **Authentication**: Complete sign-up/sign-in system with JWT tokens and password hashing
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Updates**: TanStack DB provides optimistic mutations and live queries
- **Beautiful UI**: Mantine components for a polished user interface
- **Deployment Ready**: Configured for Cloudflare Pages with Neon PostgreSQL

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- **Database**: [TanStack DB](https://tanstack.com/db) - Reactive client store
- **UI Library**: [Mantine](https://mantine.dev/) - React components and hooks
- **Database**: [Neon PostgreSQL](https://neon.tech/) - Serverless PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL toolkit
- **Authentication**: JWT tokens with bcrypt password hashing
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or Neon)

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Navigate to the project directory
cd story-craft-app

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database - Use Neon for production or local PostgreSQL for development
DATABASE_URL="postgresql://username:password@localhost:5432/story_craft_db"

# Authentication - Change this to a secure random string in production
JWT_SECRET="your-very-secure-jwt-secret-key"

# App Configuration
NODE_ENV="development"
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `story_craft_db`
3. Update `DATABASE_URL` in `.env` with your local connection string

#### Option B: Neon PostgreSQL (Recommended)

1. Sign up at [Neon](https://neon.tech/)
2. Create a new project and database
3. Copy the connection string to `DATABASE_URL` in `.env`

### 4. Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations to your database
npm run db:migrate

# Or use push for development (applies schema directly)
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📁 Project Structure

```
src/
├── auth/                 # Authentication logic
│   ├── context.tsx      # Auth context provider
│   └── utils.ts         # JWT and password utilities
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   └── MantineProvider.tsx  # Mantine theme provider
├── db/                  # Database configuration
│   ├── connection.ts    # Database connection
│   ├── schema.ts        # Database schema (users table)
│   └── collections.ts   # TanStack DB collections
└── routes/              # File-based routing
    ├── __root.tsx       # Root layout
    ├── index.tsx        # Home page
    ├── signin.tsx       # Sign-in page
    ├── signup.tsx       # Sign-up page
    ├── dashboard.tsx    # User dashboard
    └── api.auth.*       # Authentication API routes
```

## 🔐 Authentication Flow

1. **Sign Up**: Users create accounts with email/password
2. **Password Security**: Passwords are hashed using bcrypt
3. **JWT Tokens**: Authentication uses JSON Web Tokens
4. **Protected Routes**: Dashboard requires authentication
5. **Session Management**: Tokens stored in localStorage with auto-refresh

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run serve        # Preview production build

# Database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes (dev)
npm run db:studio    # Open Drizzle Studio
npm run db:drop      # Drop database

# Testing
npm run test         # Run tests
```

## 🚀 Deployment to Cloudflare Pages

### 1. Prepare Your Repository

Ensure your code is in a Git repository (GitHub, GitLab, etc.).

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect your Git repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18` or higher

### 3. Environment Variables

In Cloudflare Pages settings, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=your-neon-postgres-connection-string
JWT_SECRET=your-secure-jwt-secret-for-production
```

### 4. Deploy

Cloudflare Pages will automatically deploy on every git push to your main branch.

## 🎨 UI Components

This project uses **Mantine** for UI components:

- **Forms**: Validation with `@mantine/form`
- **Notifications**: Toast messages with `@mantine/notifications`
- **Icons**: Tabler icons via `@tabler/icons-react`
- **Theme**: Custom blue theme with responsive design

## 🔧 Development Tips

### Database Management

```bash
# View your database in browser
npm run db:studio

# Reset database (careful!)
npm run db:drop
npm run db:generate
npm run db:migrate
```

### Authentication Testing

1. Sign up with a test account
2. Check the dashboard for user info
3. Sign out and sign back in
4. Try accessing protected routes

### Adding New Features

1. **Database**: Add tables to `src/db/schema.ts`
2. **Collections**: Create TanStack DB collections in `src/db/collections.ts`
3. **API Routes**: Add server functions in `src/routes/api.*`
4. **UI**: Create pages in `src/routes/` and components in `src/components/`

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify your `DATABASE_URL` is correct
- Ensure your database is running and accessible
- Check firewall settings for remote databases

**Build Errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure all environment variables are set
- Check TypeScript errors: `npx tsc --noEmit`

**Authentication Issues**
- Verify `JWT_SECRET` is set in environment
- Check browser localStorage for token
- Ensure API routes are accessible

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have questions or need help:

1. Check the [TanStack Start Documentation](https://tanstack.com/start/latest/docs)
2. Visit [Mantine Documentation](https://mantine.dev/)
3. Review [Neon Documentation](https://neon.tech/docs)
4. Open an issue on GitHub

---

**Happy coding!** 🎉