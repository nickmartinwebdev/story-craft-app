import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, extractTokenFromHeader } from "../auth/utils";

export const ServerRoute = createServerFileRoute("/api/auth/me").methods({
  GET: async ({ request }) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get("Authorization");
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Authorization token required" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Verify JWT token
      const payload = verifyToken(token);
      if (!payload) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Find user by UUID from token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.uuid, payload.userId))
        .limit(1);

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Check if user is still active
      if (!user.isActive) {
        return new Response(
          JSON.stringify({ error: "Account is deactivated" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Remove password from response
      const { password: _, ...publicUser } = user;

      return new Response(
        JSON.stringify({
          user: publicUser,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Get user profile error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
