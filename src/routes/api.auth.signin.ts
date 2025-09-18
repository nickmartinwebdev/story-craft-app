import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, isValidEmail, generateToken } from "../auth/utils";

export const ServerRoute = createServerFileRoute("/api/auth/signin").methods({
  POST: async ({ request }) => {
    try {
      const body = (await request.json()) as {
        email: string;
        password: string;
      };

      const { email, password } = body;

      // Validate required fields
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
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

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Invalid email or password" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return new Response(
          JSON.stringify({
            error: "Account is deactivated. Please contact support.",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return new Response(
          JSON.stringify({ error: "Invalid email or password" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Remove password from response
      const { password: _, ...publicUser } = user;

      // Generate JWT token
      const token = generateToken(publicUser);

      return new Response(
        JSON.stringify({
          user: publicUser,
          token,
          message: "Signed in successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Signin error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
