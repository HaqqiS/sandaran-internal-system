import type { Project, ProjectStatus } from "generated/prisma";

export const DUMMY_PROJECTS: Omit<Project, "createdAt" | "updatedAt">[] = [
  {
    id: "proj_sadara_boutique",
    name: "Sadara Boutique Resort",
    slug: "sadara-boutique-resort",
    description:
      "Revitalisasi interior lobi utama dan villa suite dengan konsep modern tropis Bali. Desain menekankan penggunaan material lokal seperti kayu jati bekas, batu alam, dan kerajinan anyaman rotan untuk menciptakan suasana hangat dan mewah.",
    location: "Nusa Dua, Bali",
    startDate: new Date("2026-01-15T00:00:00.000Z"),
    endDate: new Date("2026-08-30T00:00:00.000Z"),
    status: "ACTIVE" as ProjectStatus,
  },
  {
    id: "proj_ba_house",
    name: "B A House",
    slug: "b-a-house",
    description:
      "Pembangunan rumah tinggal minimalis kontemporer 2 lantai. Fokus pada tata ruang fungsional, pencahayaan alami maksimal melalui bukaan jendela besar, serta integrasi ruang hijau indoor.",
    location: "Canggu, Bali",
    startDate: new Date("2025-09-01T00:00:00.000Z"),
    endDate: new Date("2026-04-15T00:00:00.000Z"),
    status: "DONE" as ProjectStatus,
  },
  {
    id: "proj_sekar_tunjung",
    name: "Sekar Tunjung House",
    slug: "sekar-tunjung-house",
    description:
      "Proyek renovasi interior ruang keluarga, dapur bersih (dry kitchen), dan kamar tidur utama dengan style modern classic. Sentuhan warna netral hangat dikombinasikan dengan profil dinding (wainscoting) yang elegan.",
    location: "Denpasar, Bali",
    startDate: new Date("2026-05-10T00:00:00.000Z"),
    endDate: new Date("2026-11-20T00:00:00.000Z"),
    status: "ACTIVE" as ProjectStatus,
  },
  {
    id: "proj_villa_jimbaran",
    name: "Villa Jimbaran",
    slug: "villa-jimbaran",
    description:
      "Pekerjaan desain interior villa privat mewah di atas bukit Jimbaran. Konsep open-plan living dengan pemandangan langsung ke arah laut, dilengkapi furnitur custom bernilai estetika tinggi.",
    location: "Jimbaran, Bali",
    startDate: new Date("2026-04-01T00:00:00.000Z"),
    endDate: null,
    status: "PAUSED" as ProjectStatus,
  },
];
