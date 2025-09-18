#!/bin/bash

# StoryCraft Deployment Script
# This script helps you deploy StoryCraft to Cloudflare Pages with Neon PostgreSQL

set -e

echo "🚀 StoryCraft Deployment Helper"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."

    required_files=("package.json" "vite.config.ts" "drizzle.config.ts" ".env.example" "src/db/schema.ts")

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file exists"
        else
            print_error "✗ $file is missing"
            exit 1
        fi
    done
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."

    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env with your actual values before proceeding!"
        return 1
    fi

    # Check if essential env vars are set
    source .env

    if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://username:password@localhost:5432/story_craft_db" ]; then
        print_error "DATABASE_URL not properly configured in .env"
        return 1
    fi

    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-very-secure-jwt-secret-key-change-this-in-production" ]; then
        print_error "JWT_SECRET not properly configured in .env"
        return 1
    fi

    print_success "Environment variables configured"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Run build test
test_build() {
    print_status "Testing production build..."
    npm run build
    print_success "Build completed successfully"
}

# Database operations
setup_database() {
    print_status "Setting up database..."

    # Generate migration files if needed
    if [ ! -d "drizzle" ] || [ -z "$(ls -A drizzle 2>/dev/null)" ]; then
        print_status "Generating database migrations..."
        npm run db:generate
    fi

    # Push schema to database
    print_status "Applying database schema..."
    npm run db:push

    print_success "Database setup completed"
}

# Git operations
check_git() {
    print_status "Checking Git repository..."

    if [ ! -d ".git" ]; then
        print_error "Not a Git repository. Initialize with: git init"
        return 1
    fi

    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Consider committing them before deploying."
        echo "Uncommitted files:"
        git status --porcelain
        echo ""
    fi

    # Check if we're on main/master branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_warning "You're on branch '$current_branch'. Cloudflare Pages typically deploys from 'main' or 'master'."
    fi

    print_success "Git repository check completed"
}

# Generate production secrets
generate_secrets() {
    print_status "Generating secure JWT secret for production..."
    jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo ""
    echo "🔐 Production JWT Secret (save this for Cloudflare Pages):"
    echo "JWT_SECRET=$jwt_secret"
    echo ""
}

# Deployment checklist
deployment_checklist() {
    echo ""
    print_status "📋 Deployment Checklist"
    echo "========================="
    echo ""
    echo "✅ Pre-deployment (completed by this script):"
    echo "   - Files and dependencies checked"
    echo "   - Build test passed"
    echo "   - Database schema ready"
    echo ""
    echo "🔄 Manual steps needed:"
    echo "   1. Set up Neon PostgreSQL database at https://neon.tech/"
    echo "   2. Copy your database connection string"
    echo "   3. Push your code to Git repository (GitHub/GitLab/Bitbucket)"
    echo "   4. Connect repository to Cloudflare Pages"
    echo "   5. Set environment variables in Cloudflare Pages:"
    echo "      - DATABASE_URL: [your-neon-connection-string]"
    echo "      - JWT_SECRET: [generated-above]"
    echo "      - NODE_ENV: production"
    echo "   6. Deploy and test!"
    echo ""
    echo "📖 Detailed instructions available in DEPLOYMENT.md"
}

# Main execution
main() {
    echo ""

    # Run checks
    check_files || exit 1

    if ! check_env; then
        print_error "Please configure your .env file and run this script again"
        exit 1
    fi

    install_deps || exit 1
    test_build || exit 1

    # Optional database setup (only if DATABASE_URL points to accessible DB)
    read -p "Do you want to set up the database now? (y/N): " setup_db
    if [[ $setup_db =~ ^[Yy]$ ]]; then
        setup_database || print_warning "Database setup failed - you may need to run this manually"
    fi

    check_git || print_warning "Git checks failed - please review manually"

    generate_secrets

    deployment_checklist

    echo ""
    print_success "🎉 Pre-deployment checks completed!"
    print_status "Your StoryCraft application is ready for deployment to Cloudflare Pages"
    echo ""
}

# Help function
show_help() {
    echo "StoryCraft Deployment Helper"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --check-only   Only run checks, don't install or build"
    echo "  --build-only   Only run build test"
    echo "  --db-only      Only set up database"
    echo ""
    echo "This script prepares your StoryCraft application for deployment by:"
    echo "  - Checking required files and configuration"
    echo "  - Installing dependencies"
    echo "  - Testing the production build"
    echo "  - Optionally setting up the database"
    echo "  - Providing deployment instructions"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --check-only)
        check_files
        check_env
        check_git
        exit 0
        ;;
    --build-only)
        test_build
        exit 0
        ;;
    --db-only)
        check_env || exit 1
        setup_database
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
