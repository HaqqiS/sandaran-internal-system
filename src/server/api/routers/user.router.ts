import { TRPCError } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import {
  adminOrCeoProcedure,
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  /**
   * Get all users with enhanced filtering (admin + CEO read-only)
   */
  getAllUsersWithFilter: adminOrCeoProcedure
    .input(
      z.object({
        filter: z.enum(["all", "pending", "active", "rejected"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build where clause based on filter
      const where: {
        isActive?: boolean;
        reviewedAt?: { not: null } | null;
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
          phoneNumber?: { contains: string; mode: "insensitive" };
        }>;
      } = {};

      if (input.filter === "pending") {
        where.isActive = false;
        where.reviewedAt = null;
      } else if (input.filter === "active") {
        where.isActive = true;
        where.reviewedAt = { not: null };
      } else if (input.filter === "rejected") {
        where.isActive = false;
        where.reviewedAt = { not: null };
      }
      // if filter === 'all' or undefined, no filter applied

      // Add search filter
      if (input.search && input.search.trim() !== "") {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { phoneNumber: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return ctx.db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          image: true,
          roleGlobal: true,
          isActive: true,
          reviewedAt: true,
          reviewedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          createdAt: true,
          _count: {
            select: {
              projectMembers: true,
            },
          },
        },
      });
    }),

  /**
   * Get user details by ID (admin + CEO read-only)
   */
  getUserDetails: adminOrCeoProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          reviewedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          projectMembers: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              reports: true,
              requests: true,
              documents: true,
            },
          },
        },
      });
    }),

  /**
   * Get current user info
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        phoneNumber: true,
        phoneNumberVerified: true,
        image: true,
        roleGlobal: true,
        isActive: true,
        reviewedAt: true,
        createdAt: true,
      },
    });
  }),

  /**
   * Search users (for adding members)
   * Returns users not strictly restricted
   */
  search: protectedProcedure
    .input(z.object({ query: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const query = input.query || "";

      return ctx.db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });
    }),

  /**
   * Approve user and optionally assign to project
   */
  approveUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        roleGlobal: z.enum(["ADMIN", "CEO", "USER", "NONE"]).default("USER"),
        projectAssignment: z
          .object({
            projectId: z.string(),
            role: z.enum(["MANDOR", "ARCHITECT", "FINANCE"]),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, roleGlobal, projectAssignment } = input;
      const approverId = ctx.session.user.id;

      // Validation: cannot approve self to ADMIN unless already ADMIN
      if (roleGlobal === "ADMIN" && userId === approverId) {
        if (ctx.session.user.roleGlobal !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot self-promote to ADMIN",
          });
        }
      }

      // Update user global role & status
      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          roleGlobal,
          isActive: true,
          reviewedAt: new Date(),
          reviewedById: approverId,
        },
      });

      // Handle project assignment if provided
      if (projectAssignment) {
        // Check if project exists
        const project = await ctx.db.project.findUnique({
          where: { id: projectAssignment.projectId },
        });

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        // Upsert project member
        await ctx.db.projectMember.upsert({
          where: {
            userId_projectId: {
              userId,
              projectId: projectAssignment.projectId,
            },
          },
          create: {
            userId,
            projectId: projectAssignment.projectId,
            role: projectAssignment.role,
          },
          update: {
            role: projectAssignment.role,
          },
        });
      }

      return user;
    }),

  /**
   * Reject user (soft delete)
   */
  rejectUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const reviewerId = ctx.session.user.id;

      // Validation: cannot reject self
      if (userId === reviewerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot reject yourself",
        });
      }

      return ctx.db.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          roleGlobal: "NONE",
          reviewedAt: new Date(),
          reviewedById: reviewerId,
        },
      });
    }),

  /**
   * Bulk approve users
   */
  bulkApprove: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        roleGlobal: z.enum(["ADMIN", "CEO", "USER"]).default("USER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userIds, roleGlobal } = input;
      const approverId = ctx.session.user.id;

      // Filter out self if trying to approve self to ADMIN
      const validUserIds =
        roleGlobal === "ADMIN"
          ? userIds.filter((id) => id !== approverId)
          : userIds;

      if (validUserIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid users to approve",
        });
      }

      await ctx.db.user.updateMany({
        where: {
          id: { in: validUserIds },
        },
        data: {
          roleGlobal,
          isActive: true,
          reviewedAt: new Date(),
          reviewedById: approverId,
        },
      });

      return { count: validUserIds.length };
    }),

  /**
   * Delete user (soft delete for inactive users only)
   */
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const currentUserId = ctx.session.user.id;

      // Validation: Cannot delete self
      if (userId === currentUserId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete yourself",
        });
      }

      // Get user to validate inactive status
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { isActive: true, roleGlobal: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Validation: Only delete inactive users
      if (user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can only delete inactive users. Reject the user first.",
        });
      }

      // Delete the user (hard delete or you can mark as deleted)
      return ctx.db.user.delete({
        where: { id: userId },
      });
    }),

  /**
   * Create user with credentials (Admin only)
   * Allows provisioning of internal staff with Email and/or Phone Number + Password
   */
  createUserWithCredentials: adminProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z
          .string()
          .email("Format email tidak valid")
          .optional()
          .or(z.literal("")),
        phoneNumber: z
          .string()
          .min(8, "Nomor telepon minimal 8 karakter")
          .optional()
          .or(z.literal("")),
        password: z.string().min(6, "Kata sandi minimal 6 karakter"),
        roleGlobal: z.enum(["USER", "ADMIN", "CEO"]).default("USER"),
        projectAssignment: z
          .object({
            projectId: z.string(),
            role: z.enum(["MANDOR", "ARCHITECT", "FINANCE"]),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, roleGlobal, projectAssignment, password } = input;
      const email = input.email?.trim().toLowerCase();
      const phoneNumber = input.phoneNumber?.trim();

      if (!email && !phoneNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Harap isi setidaknya salah satu dari Email atau Nomor Telepon",
        });
      }

      // Check existing email
      if (email) {
        const existingEmail = await ctx.db.user.findUnique({
          where: { email },
        });
        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Pengguna dengan email ${email} sudah terdaftar`,
          });
        }
      }

      // Check existing phone number
      if (phoneNumber) {
        const existingPhone = await ctx.db.user.findFirst({
          where: {
            OR: [
              { phoneNumber },
              { phoneNumber: phoneNumber.replace(/\s+/g, "") },
            ],
          },
        });
        if (existingPhone) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Pengguna dengan nomor telepon ${phoneNumber} sudah terdaftar`,
          });
        }
      }

      // If no email provided, generate internal email fallback for schema compliance
      const cleanedPhone = (phoneNumber || "").replace(/\D/g, "");
      const finalEmail = email || `${cleanedPhone}@sandaran.internal`;

      // Check if fallback email conflicts
      if (!email) {
        const conflictFallback = await ctx.db.user.findUnique({
          where: { email: finalEmail },
        });
        if (conflictFallback) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Pengguna dengan nomor telepon ini sudah memiliki akun internal",
          });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      const userId = crypto.randomUUID();
      const adminId = ctx.session.user.id;

      // Create User, Account, and ProjectMember atomically
      const user = await ctx.db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: userId,
            name: name.trim(),
            email: finalEmail,
            phoneNumber: phoneNumber || null,
            phoneNumberVerified: true,
            emailVerified: Boolean(email),
            roleGlobal,
            isActive: true,
            reviewedAt: new Date(),
            reviewedById: adminId,
          },
        });

        // Create credential account for Better Auth
        await tx.account.create({
          data: {
            id: crypto.randomUUID(),
            accountId: userId,
            providerId: "credential",
            userId,
            password: hashedPassword,
          },
        });

        // Project assignment if selected
        if (projectAssignment) {
          await tx.projectMember.create({
            data: {
              userId,
              projectId: projectAssignment.projectId,
              role: projectAssignment.role,
            },
          });
        }

        return newUser;
      });

      return user;
    }),

  /**
   * Update user details, credentials, and role (Admin only)
   */
  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z
          .string()
          .email("Format email tidak valid")
          .optional()
          .or(z.literal("")),
        phoneNumber: z
          .string()
          .min(8, "Nomor telepon minimal 8 karakter")
          .optional()
          .or(z.literal("")),
        password: z
          .string()
          .min(6, "Kata sandi minimal 6 karakter")
          .optional()
          .or(z.literal("")),
        roleGlobal: z.enum(["USER", "ADMIN", "CEO", "NONE"]),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, name, roleGlobal, isActive } = input;
      const email = input.email?.trim().toLowerCase();
      const phoneNumber = input.phoneNumber?.trim();
      const password = input.password?.trim();
      const currentUserId = ctx.session.user.id;

      // 1. Check if user exists
      const targetUser = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pengguna tidak ditemukan",
        });
      }

      // 2. Prevent self-demotion from ADMIN
      if (userId === currentUserId && targetUser.roleGlobal === "ADMIN") {
        if (roleGlobal !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Tidak dapat menurunkan peran sendiri dari ADMIN",
          });
        }
        if (!isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Tidak dapat menonaktifkan akun sendiri",
          });
        }
      }

      // 3. Protect last active admin
      if (
        targetUser.roleGlobal === "ADMIN" &&
        (roleGlobal !== "ADMIN" || !isActive)
      ) {
        const adminCount = await ctx.db.user.count({
          where: {
            roleGlobal: "ADMIN",
            isActive: true,
          },
        });

        if (adminCount <= 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Tidak dapat mengubah atau menonaktifkan admin terakhir. Jadikan pengguna lain sebagai ADMIN terlebih dahulu.",
          });
        }
      }

      // 4. Validate email uniqueness if changed
      if (email && email !== targetUser.email) {
        const duplicateEmail = await ctx.db.user.findFirst({
          where: {
            email,
            NOT: { id: userId },
          },
        });
        if (duplicateEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Email ${email} sudah digunakan oleh pengguna lain`,
          });
        }
      }

      // 5. Validate phone number uniqueness if changed
      if (phoneNumber && phoneNumber !== targetUser.phoneNumber) {
        const duplicatePhone = await ctx.db.user.findFirst({
          where: {
            OR: [
              { phoneNumber },
              { phoneNumber: phoneNumber.replace(/\s+/g, "") },
            ],
            NOT: { id: userId },
          },
        });
        if (duplicatePhone) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Nomor telepon ${phoneNumber} sudah digunakan oleh pengguna lain`,
          });
        }
      }

      // Determine final email
      let finalEmail = targetUser.email;
      if (email) {
        finalEmail = email;
      } else if (!targetUser.email && phoneNumber) {
        const cleanedPhone = phoneNumber.replace(/\D/g, "");
        finalEmail = `${cleanedPhone}@sandaran.internal`;
      }

      // Execute transaction for User and Account
      return ctx.db.$transaction(async (tx) => {
        // Update password if provided
        if (password && password.length >= 6) {
          const hashedPassword = await hashPassword(password);
          const existingAccount = await tx.account.findFirst({
            where: { userId, providerId: "credential" },
          });

          if (existingAccount) {
            await tx.account.update({
              where: { id: existingAccount.id },
              data: { password: hashedPassword },
            });
          } else {
            await tx.account.create({
              data: {
                id: crypto.randomUUID(),
                accountId: userId,
                providerId: "credential",
                userId,
                password: hashedPassword,
              },
            });
          }
        }

        // Update User
        return tx.user.update({
          where: { id: userId },
          data: {
            name: name.trim(),
            email: finalEmail,
            phoneNumber: phoneNumber || null,
            roleGlobal,
            isActive,
            reviewedAt: targetUser.reviewedAt ?? new Date(),
            reviewedById: targetUser.reviewedById ?? currentUserId,
          },
        });
      });
    }),

  /**
   * Update own profile (name, email, phone number, password)
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z
          .string()
          .email("Format email tidak valid")
          .optional()
          .or(z.literal("")),
        phoneNumber: z
          .string()
          .min(8, "Nomor telepon minimal 8 karakter")
          .optional()
          .or(z.literal("")),
        password: z
          .string()
          .min(6, "Kata sandi minimal 6 karakter")
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const name = input.name.trim();
      const email = input.email?.trim().toLowerCase();
      const phoneNumber = input.phoneNumber?.trim();
      const password = input.password?.trim();

      // Check current user
      const currentUser = await ctx.db.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pengguna tidak ditemukan",
        });
      }

      // Check duplicate phone if provided
      if (phoneNumber) {
        const cleanDigits = phoneNumber.replace(/\D/g, "");
        const duplicatePhone = await ctx.db.user.findFirst({
          where: {
            OR: [
              { phoneNumber },
              { phoneNumber: cleanDigits },
              { phoneNumber: `+${cleanDigits}` },
            ],
            NOT: { id: userId },
          },
        });
        if (duplicatePhone) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Nomor telepon ${phoneNumber} sudah digunakan oleh akun lain`,
          });
        }
      }

      // Determine final email
      let finalEmail = currentUser.email;
      if (email) {
        const duplicateEmail = await ctx.db.user.findFirst({
          where: {
            email,
            NOT: { id: userId },
          },
        });
        if (duplicateEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Email ${email} sudah digunakan oleh akun lain`,
          });
        }
        finalEmail = email;
      } else if (
        (!currentUser.email ||
          currentUser.email.endsWith("@sandaran.internal")) &&
        phoneNumber
      ) {
        const cleanedPhone = phoneNumber.replace(/\D/g, "");
        finalEmail = `${cleanedPhone}@sandaran.internal`;
      }

      return ctx.db.$transaction(async (tx) => {
        // Handle password update if provided
        if (password) {
          const hashedPassword = await hashPassword(password);
          const existingAccount = await tx.account.findFirst({
            where: {
              userId,
              providerId: "credential",
            },
          });

          if (existingAccount) {
            await tx.account.update({
              where: { id: existingAccount.id },
              data: { password: hashedPassword },
            });
          } else {
            await tx.account.create({
              data: {
                id: crypto.randomUUID(),
                accountId: userId,
                providerId: "credential",
                userId,
                password: hashedPassword,
              },
            });
          }
        }

        // Update user record
        return tx.user.update({
          where: { id: userId },
          data: {
            name,
            email: finalEmail,
            emailVerified: Boolean(
              email && email !== currentUser.email
                ? false
                : currentUser.emailVerified,
            ),
            phoneNumber: phoneNumber || null,
          },
        });
      });
    }),
});
