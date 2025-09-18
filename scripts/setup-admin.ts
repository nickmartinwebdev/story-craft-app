#!/usr/bin/env tsx

/**
 * Admin User Setup Script
 *
 * This script helps you create your first admin user or upgrade an existing user to admin.
 *
 * Usage:
 * npx tsx scripts/setup-admin.ts --email your@email.com
 * npx tsx scripts/setup-admin.ts --email your@email.com --password newpassword
 * npx tsx scripts/setup-admin.ts --create --email admin@example.com --password adminpass --name "Admin User"
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { users } from '../src/db/schema'
import { hashPassword } from '../src/auth/utils'
import { getRolePermissions } from '../src/auth/types'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (flag: string): string | undefined => {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined
}

const hasFlag = (flag: string): boolean => args.includes(flag)

const email = getArg('--email')
const password = getArg('--password')
const name = getArg('--name')
const create = hasFlag('--create')
const help = hasFlag('--help') || hasFlag('-h')

// Display help
if (help || !email) {
  console.log(`
Admin User Setup Script

Usage:
  npx tsx scripts/setup-admin.ts --email <email> [options]

Options:
  --email <email>      Email of the user to make admin (required)
  --password <pass>    New password (optional, only for --create)
  --name <name>        Full name (optional, only for --create, format: "First Last")
  --create             Create new admin user instead of upgrading existing
  --help, -h           Show this help message

Examples:
  # Make existing user admin
  npx tsx scripts/setup-admin.ts --email user@example.com

  # Create new admin user
  npx tsx scripts/setup-admin.ts --create --email admin@example.com --password securepass --name "Admin User"

  # Create new admin with prompt for password
  npx tsx scripts/setup-admin.ts --create --email admin@example.com --name "Admin User"
`)
  process.exit(0)
}

// Database connection
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set')
  console.log('Make sure your .env file contains:')
  console.log('DATABASE_URL=postgresql://story_craft_user:story_craft_password@localhost:5432/story_craft')
  process.exit(1)
}

const client = postgres(connectionString)
const db = drizzle(client)

// Admin permissions
const adminPermissions = [
  'users:read', 'users:write', 'users:delete', 'users:manage',
  'content:read', 'content:write', 'content:delete', 'content:publish', 'content:moderate', 'content:manage',
  'stories:read', 'stories:write', 'stories:delete', 'stories:publish', 'stories:manage',
  'admin:access', 'admin:settings', 'admin:logs', 'admin:backup',
  'moderation:reports', 'moderation:users', 'moderation:content',
  'analytics:view', 'analytics:export',
  'system:maintenance', 'system:config'
]

async function promptPassword(): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    readline.question('Enter admin password: ', (answer: string) => {
      readline.close()
      resolve(answer)
    })
  })
}

async function upgradeExistingUser(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUsers.length === 0) {
      console.error(`❌ User with email ${email} not found`)
      console.log('💡 Use --create flag to create a new admin user')
      process.exit(1)
    }

    const user = existingUsers[0]

    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Current role: ${user.role}`)

    if (user.role === 'admin') {
      console.log('⚠️  User is already an admin')
      console.log('🔄 Updating permissions anyway...')
    }

    // Update user to admin
    await db
      .update(users)
      .set({
        role: 'admin',
        roles: ['admin', 'user'],
        permissions: adminPermissions,
        updatedAt: new Date()
      })
      .where(eq(users.email, email))

    console.log('🎉 Successfully upgraded user to admin!')
    console.log('👑 Admin permissions granted:')
    adminPermissions.forEach(permission => {
      console.log(`   - ${permission}`)
    })

  } catch (error) {
    console.error('❌ Error upgrading user:', error)
    process.exit(1)
  }
}

async function createNewAdmin(email: string, password?: string, name?: string) {
  try {
    console.log(`🔍 Checking if user already exists: ${email}`)

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUsers.length > 0) {
      console.error(`❌ User with email ${email} already exists`)
      console.log('💡 Remove --create flag to upgrade existing user instead')
      process.exit(1)
    }

    // Get password
    let adminPassword = password
    if (!adminPassword) {
      adminPassword = await promptPassword()
    }

    if (!adminPassword || adminPassword.length < 6) {
      console.error('❌ Password must be at least 6 characters long')
      process.exit(1)
    }

    // Parse name
    let firstName = 'Admin'
    let lastName = 'User'

    if (name) {
      const nameParts = name.split(' ')
      if (nameParts.length >= 2) {
        firstName = nameParts[0]
        lastName = nameParts.slice(1).join(' ')
      } else {
        firstName = name
        lastName = 'User'
      }
    }

    console.log('🔐 Hashing password...')
    const hashedPassword = await hashPassword(adminPassword)

    console.log('👤 Creating admin user...')
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'admin',
        roles: ['admin', 'user'],
        permissions: adminPermissions,
        isActive: true
      })
      .returning()

    console.log('🎉 Successfully created admin user!')
    console.log(`👤 Name: ${firstName} ${lastName}`)
    console.log(`📧 Email: ${email}`)
    console.log(`👑 Role: admin`)
    console.log('✅ Admin permissions granted:')
    adminPermissions.forEach(permission => {
      console.log(`   - ${permission}`)
    })

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Admin User Setup Script')
  console.log('==========================')

  try {
    // Test database connection
    console.log('🔌 Testing database connection...')
    await db.select().from(users).limit(1)
    console.log('✅ Database connection successful')

    if (create) {
      await createNewAdmin(email!, password, name)
    } else {
      await upgradeExistingUser(email!)
    }

    console.log('\n🎊 Setup complete!')
    console.log('💡 You can now sign in with admin privileges')
    console.log('🔐 Visit /dashboard to test your admin access')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
