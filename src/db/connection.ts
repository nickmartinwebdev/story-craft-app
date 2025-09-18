import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Get the database URL from environment variables
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the connection
const client = postgres(connectionString, {
  prepare: false,
  // For Neon, we want to handle SSL properly
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
})

// Create the Drizzle instance
export const db = drizzle(client, { schema })

export type DbType = typeof db
