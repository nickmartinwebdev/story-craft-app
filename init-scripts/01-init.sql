-- Database initialization script for Story Craft application
-- This script runs when the PostgreSQL container is first created

-- Enable commonly used PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional schemas if needed (optional)
-- CREATE SCHEMA IF NOT EXISTS app;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE story_craft TO story_craft_user;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Story Craft database initialization completed successfully!';
END $$;
