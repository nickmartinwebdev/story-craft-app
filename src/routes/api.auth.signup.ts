import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  isValidName,
  generateToken,
} from "../auth/utils";
import type { NewUser } from "../db/schema";

export const ServerRoute = createServerFileRoute("/api/auth/signup").methods({
  POST: async ({ request }) => {
    try {
      const body = (await request.json()) as {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
      };

      const { email, password, firstName, lastName } = body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return new Response(
          JSON.stringify({ error: "All fields are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return new Response(JSON.stringify({ error: "Invalid email format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate password strength
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        return new Response(
          JSON.stringify({ error: passwordValidation.message }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Validate names
      if (!isValidName(firstName) || !isValidName(lastName)) {
        return new Response(
          JSON.stringify({
            error:
              "First name and last name must be between 1 and 100 characters",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const newUserData: NewUser = {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        uuid: crypto.randomUUID(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newUser] = await db.insert(users).values(newUserData).returning();

      // Remove password from response
      const { password: _, ...publicUser } = newUser;

      // Generate JWT token
      const token = generateToken(publicUser);

      return new Response(
        JSON.stringify({
          user: publicUser,
          token,
          message: "Account created successfully",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Signup error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
