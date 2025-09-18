# StoryCraft Deployment Guide

This guide walks you through deploying StoryCraft to Cloudflare Pages with Neon PostgreSQL.

## 🚀 Quick Deployment Checklist

- [ ] Set up Neon PostgreSQL database
- [ ] Configure environment variables
- [ ] Push code to Git repository
- [ ] Deploy to Cloudflare Pages
- [ ] Run database migrations
- [ ] Test authentication flow

## 📋 Prerequisites

- GitHub/GitLab/Bitbucket account
- Cloudflare account
- Neon account (or other PostgreSQL provider)

## 1. Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click "Create a project"
3. Choose a project name (e.g., "storycraft-db")
4. Select your preferred region
5. Note down the connection details

### Step 2: Get Connection String

1. In your Neon dashboard, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this for later use

### Step 3: Create Database Tables

You can run the migration directly in Neon's SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
```

## 2. Repository Setup

### Step 1: Push to Git

Ensure your code is in a Git repository:

```bash
git add .
git commit -m "Initial StoryCraft setup"
git push origin main
```

### Step 2: Verify Files

Make sure these files exist in your repository:
- `package.json` with build script
- `vite.config.ts` properly configured
- All source files in `src/`
- Environment example file `.env.example`

## 3. Cloudflare Pages Deployment

### Step 1: Connect Repository

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create a project"
3. Choose "Connect to Git"
4. Select your Git provider and repository
5. Click "Begin setup"

### Step 2: Configure Build Settings

Set these build configuration options:

- **Project name**: `storycraft-app` (or your preferred name)
- **Production branch**: `main`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (or leave empty)

### Step 3: Environment Variables

In the "Environment variables" section, add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | A secure random string (min 32 characters) |

**⚠️ Important**: Generate a strong JWT secret:
```bash
# Use this to generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Advanced Settings

Click "Advanced" and set:

- **Node.js version**: `18` or `20`
- **Root directory**: Leave empty
- **Build timeout**: `30` minutes (default is fine)

### Step 5: Deploy

1. Click "Save and Deploy"
2. Wait for the build to complete (usually 2-5 minutes)
3. Note the deployment URL (e.g., `https://storycraft-app.pages.dev`)

## 4. Post-Deployment Verification

### Step 1: Check Application

1. Visit your deployment URL
2. Verify the home page loads correctly
3. Check that the header navigation works

### Step 2: Test Authentication

1. Click "Sign Up" and create a test account
2. Verify you receive success notification
3. Check that you're redirected to the dashboard
4. Try signing out and signing back in

### Step 3: Database Verification

In your Neon console, run this query to verify user creation:

```sql
SELECT id, email, first_name, last_name, created_at FROM users;
```

## 5. Custom Domain (Optional)

### Step 1: Add Custom Domain

1. In Cloudflare Pages, go to your project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `storycraft.yourdomain.com`)

### Step 2: DNS Configuration

1. In your domain provider's DNS settings, add a CNAME record:
   ```
   Name: storycraft (or your subdomain)
   Value: storycraft-app.pages.dev
   ```

### Step 3: SSL Certificate

Cloudflare will automatically provision an SSL certificate for your custom domain.

## 6. Environment-Specific Configuration

### Development

Create `.env` file:
```env
DATABASE_URL="postgresql://localhost:5432/story_craft_dev"
JWT_SECRET="dev-secret-key-not-for-production"
NODE_ENV="development"
```

### Production

Set in Cloudflare Pages dashboard:
- `DATABASE_URL`: Your Neon production connection string
- `JWT_SECRET`: Secure random string (32+ characters)
- `NODE_ENV`: `production`

## 7. Monitoring and Maintenance

### Performance Monitoring

1. Use Cloudflare Analytics to monitor traffic
2. Check Core Web Vitals in the Pages dashboard
3. Monitor database performance in Neon console

### Error Monitoring

1. Check Cloudflare Pages function logs
2. Monitor database logs in Neon
3. Set up alerts for critical errors

### Database Maintenance

1. Monitor connection usage in Neon
2. Set up automated backups
3. Review query performance periodically

## 8. Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Database Connection Error**
- Verify DATABASE_URL is correct
- Check if database is accessible from Cloudflare
- Ensure connection string includes `?sslmode=require`

**Authentication Not Working**
- Verify JWT_SECRET is set and secure
- Check API routes are accessible
- Ensure CORS is properly configured

**502 Bad Gateway**
- Check if build output directory is correct (`dist`)
- Verify all dependencies are in `package.json`
- Check for any server-side errors

### Getting Help

1. **Cloudflare Pages**: [Community Forum](https://community.cloudflare.com/)
2. **Neon Database**: [Documentation](https://neon.tech/docs)
3. **TanStack Start**: [GitHub Issues](https://github.com/TanStack/router)
4. **Mantine UI**: [Documentation](https://mantine.dev/)

## 9. Next Steps

After successful deployment:

1. **Security**: Set up proper CORS policies
2. **Monitoring**: Implement error tracking (Sentry, LogRocket)
3. **Performance**: Set up CDN caching strategies
4. **Features**: Add password reset functionality
5. **Testing**: Set up automated testing pipeline
6. **Scaling**: Monitor usage and scale database as needed

## 10. Deployment Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve

# Database commands
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open database studio
```

## 🎉 Success!

Once deployed successfully:

- ✅ Your app is live at your Cloudflare Pages URL
- ✅ Database is connected and working
- ✅ Authentication system is functional
- ✅ SSL certificate is active
- ✅ Ready for production use

**Deployment URL**: `https://your-project.pages.dev`

---

*For questions or issues, refer to the main README.md or create an issue in the repository.*