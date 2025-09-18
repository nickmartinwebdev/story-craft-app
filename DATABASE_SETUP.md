# Database Setup Guide

This guide will help you set up a local PostgreSQL database using Docker Compose for the Story Craft application.

## Prerequisites

- Docker and Docker Compose installed on your system
- Node.js and npm (for running database migrations)

## Quick Start

1. **Start the database services:**
   ```bash
   docker-compose up -d
   ```

2. **Create your `.env` file:**
   Copy the example below and create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://story_craft_user:story_craft_password@localhost:5432/story_craft
   ```

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```
   
   Or if you have migration files:
   ```bash
   npm run db:migrate
   ```

4. **Verify the setup:**
   ```bash
   npm run db:studio
   ```
   This will open Drizzle Studio in your browser to view your database.

## Services Included

### PostgreSQL Database
- **Container:** `story-craft-postgres`
- **Port:** `5432`
- **Database:** `story_craft`
- **Username:** `story_craft_user`
- **Password:** `story_craft_password`

### pgAdmin (Optional)
- **Container:** `story-craft-pgadmin`
- **URL:** `http://localhost:8080`
- **Email:** `admin@storycraft.local`
- **Password:** `admin123`

## Available Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker-compose exec postgres psql -U story_craft_user -d story_craft

# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d
```

## Database Schema Management

The project uses Drizzle ORM for database management. Available npm scripts:

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes directly (development)
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:drop` - Drop database tables

## Troubleshooting

### Connection Issues
If you can't connect to the database:
1. Ensure Docker services are running: `docker-compose ps`
2. Check if the port 5432 is available: `lsof -i :5432`
3. Verify environment variables in your `.env` file

### Permission Issues
If you encounter permission issues:
```bash
# Reset volumes and restart
docker-compose down -v
docker-compose up -d
```

### Port Conflicts
If port 5432 is already in use, modify the `docker-compose.yml` file:
```yaml
ports:
  - "5433:5432"  # Use different host port
```

And update your DATABASE_URL accordingly:
```env
DATABASE_URL=postgresql://story_craft_user:story_craft_password@localhost:5433/story_craft
```

## Production Considerations

- Change default passwords in production
- Use environment-specific configuration
- Set up proper backup strategies
- Consider using managed database services for production deployments