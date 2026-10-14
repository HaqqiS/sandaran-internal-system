import type { GlobalRole } from "@prisma/client";

export interface DummyUser {
  id: string;
  name: string;
  email: string;
  roleGlobal: GlobalRole;
  isActive: boolean;
  password?: string;
}

export const DEFAULT_SEED_PASSWORD = "password";

export const DUMMY_USERS: DummyUser[] = [
  // 1. GLOBAL ROLE: ADMIN
  // Email akun utama (dapat langsung digunakan saat login Google OAuth maupun Email + Password)
  {
    id: "user_admin_haqqi",
    name: "Haqqi Sukmara (Admin)",
    email: "haqqi30sukmara@gmail.com",
    roleGlobal: "ADMIN",
    isActive: true,
    password: "password",
  },
  // Dummy Admin tambahan untuk testing
  {
    id: "user_admin_system",
    name: "System Administrator",
    email: "admin@sandaran.id",
    roleGlobal: "ADMIN",
    isActive: true,
    password: "password",
  },

  // 2. GLOBAL ROLE: EXECUTIVE
  // Akses pemantauan portofolio dan keuangan seluruh proyek
  {
    id: "user_executive_1",
    name: "Executive Astaloka",
    email: "executive@sandaran.id",
    roleGlobal: "EXECUTIVE",
    isActive: true,
    password: "password",
  },

  // 3. GLOBAL ROLE: USER (Project-Based Members)
  // Pengguna operasional lapangan yang ditugaskan ke ProjectMember spesifik
  {
    id: "user_supervisor_1",
    name: "Budi Santoso (Supervisor)",
    email: "supervisor@sandaran.id",
    roleGlobal: "USER",
    isActive: true,
    password: "password",
  },
  {
    id: "user_architect_1",
    name: "Aris Pratama (Architect)",
    email: "architect@sandaran.id",
    roleGlobal: "USER",
    isActive: true,
    password: "password",
  },
  {
    id: "user_finance_1",
    name: "Fani Rahmawati (Finance)",
    email: "finance@sandaran.id",
    roleGlobal: "USER",
    isActive: true,
    password: "password",
  },
  {
    id: "user_logistic_1",
    name: "Luki Wijaya (Logistics)",
    email: "logistic@sandaran.id",
    roleGlobal: "USER",
    isActive: true,
    password: "password",
  },

  // 4. GLOBAL ROLE: NONE (Pending Approval)
  // Untuk menguji halaman proteksi /waiting-approval
  {
    id: "user_pending_1",
    name: "User Baru (Pending Approval)",
    email: "pending@sandaran.id",
    roleGlobal: "NONE",
    isActive: false,
    password: "password",
  },
];
