import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"

import { env } from "~/env"
import { db } from "~/server/db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),

  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },
  plugins: [nextCookies()],

  // Advanced Security Options
  advanced: {
    // Generate secure random session tokens
    generateId: undefined, // Uses default crypto.randomUUID()

    // Cross-site request forgery protection
    crossSubDomainCookies: {
      enabled: false, // Disable for better security
    },

    // Use secure cookies in production
    useSecureCookies: env.NODE_ENV === "production",
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // Max 10 requests per window per IP
  },

  // Social Providers
  socialProviders: {
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },

  // User Configuration with Custom Fields
  user: {
    additionalFields: {
      roleGlobal: {
        type: "string",
        required: false,
        defaultValue: "NONE",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },

  // Security Headers and Cookie Configuration
  secret: env.BETTER_AUTH_SECRET, // Make sure this is set in .env

  // Trust proxy for production deployments (Vercel, etc)
  trustedOrigins:
    env.NODE_ENV === "production"
      ? [env.BETTER_AUTH_URL]
      : ["http://localhost:3000"],
})

export type Session = typeof auth.$Infer.Session
