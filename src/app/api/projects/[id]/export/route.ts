import ExcelJS from "exceljs";
import type { GlobalRole } from "generated/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin, validateSessionAccess } from "~/lib/auth-guards";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

// ─── Helpers ────────────────────────────────────────────────────────────────

function applyHeaderStyle(
  cell: ExcelJS.Cell,
  options?: { bold?: boolean; size?: number; italic?: boolean; color?: string },
) {
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.font = {
    bold: options?.bold ?? false,
    size: options?.size ?? 11,
    italic: options?.italic ?? false,
    color: { argb: options?.color ?? "FF000000" },
  };
}

function applyTableHeaderStyle(cell: ExcelJS.Cell) {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
  };
  cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "FF1E3A5F" } },
    left: { style: "thin", color: { argb: "FF1E3A5F" } },
    bottom: { style: "thin", color: { argb: "FF1E3A5F" } },
    right: { style: "thin", color: { argb: "FF1E3A5F" } },
  };
}

function applyDataCellStyle(cell: ExcelJS.Cell, center = false) {
  cell.alignment = {
    horizontal: center ? "center" : "left",
    vertical: "middle",
    wrapText: true,
  };
  cell.border = {
    top: { style: "hair", color: { argb: "FFCCCCCC" } },
    left: { style: "hair", color: { argb: "FFCCCCCC" } },
    bottom: { style: "hair", color: { argb: "FFCCCCCC" } },
    right: { style: "hair", color: { argb: "FFCCCCCC" } },
  };
  cell.font = { size: 10 };
}

function formatDateID(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMonthYearID(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function buildCloudinaryThumbUrl(url: string): string {
  // Insert transformation after /upload/ in Cloudinary URL
  return url.replace("/upload/", "/upload/w_100,h_80,c_fill,q_auto,f_auto/");
}

async function fetchImageBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Autentikasi
  const session = await getSession();
  const validation = validateSessionAccess(session);
  if (!validation.isValid || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Otorisasi — hanya ADMIN dan CEO
  const canExport = isAdmin(session.user.roleGlobal as GlobalRole);
  if (!canExport) {
    return NextResponse.json(
      {
        error: "Forbidden: Hanya ADMIN dan CEO yang dapat mengekspor laporan.",
      },
      { status: 403 },
    );
  }

  // 3. Validasi query param `month`
  const { searchParams } = req.nextUrl;
  const monthParam = searchParams.get("month");
  const parsed = monthParam?.match(/^(\d{4})-(\d{2})$/);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Format bulan tidak valid. Gunakan format YYYY-MM (contoh: 2026-06).",
      },
      { status: 400 },
    );
  }

  const year = parseInt(parsed[1] ?? "0", 10);
  const monthIndex = parseInt(parsed[2] ?? "1", 10) - 1; // 0-indexed
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  // 4. Ambil project
  const { id: projectId } = await params;
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      location: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Proyek tidak ditemukan." },
      { status: 404 },
    );
  }

  // 5. Ambil laporan bulanan
  const reports = await db.dailyReport.findMany({
    where: {
      projectId,
      reportDate: { gte: startDate, lte: endDate },
    },
    include: {
      user: { select: { name: true } },
      tasks: {
        select: {
          taskName: true,
          workerCount: true,
          progress: true,
          notes: true,
        },
        orderBy: { createdAt: "asc" },
      },
      media: {
        select: { url: true, publicId: true },
        take: 3, // Batasi 3 foto per laporan
      },
    },
    orderBy: { reportDate: "asc" },
  });

  if (reports.length === 0) {
    return NextResponse.json(
      { error: `Tidak ada data laporan untuk periode ${monthParam}.` },
      { status: 404 },
    );
  }

  // ─── 6. Bangun Excel ─────────────────────────────────────────────────────

  const workbook = new ExcelJS.Workbook();
  workbook.creator = session.user.name;
  workbook.created = new Date();

  // ─── Sheet 1: Detail Laporan ─────────────────────────────────────────────

  const ws = workbook.addWorksheet("Detail Laporan", {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
    views: [{ state: "frozen", ySplit: 6 }],
  });

  // Definisi kolom
  ws.columns = [
    { key: "no", width: 5 },
    { key: "tanggal", width: 16 },
    { key: "cuaca", width: 13 },
    { key: "pekerja", width: 14 },
    { key: "lokasi", width: 20 },
    { key: "progress", width: 13 },
    { key: "detail", width: 36 },
    { key: "kendala", width: 30 },
    { key: "foto", width: 22 },
  ];

  // ── Header Laporan (Baris 1–4) ──
  const periodLabel = formatMonthYearID(year, monthIndex);
  const exportedAt = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const headerRows: Array<{
    text: string;
    bold?: boolean;
    size?: number;
    italic?: boolean;
  }> = [
    { text: "LAPORAN BULANAN PROYEK", bold: true, size: 16 },
    { text: project.name, bold: true, size: 13 },
    { text: `Periode: ${periodLabel}`, italic: true, size: 11 },
    {
      text: `Diekspor oleh: ${session.user.name}  |  ${exportedAt}`,
      size: 10,
    },
  ];

  headerRows.forEach((h, i) => {
    const row = ws.getRow(i + 1);
    row.height = i === 0 ? 28 : 20;
    const cell = ws.getCell(`A${i + 1}`);
    cell.value = h.text;
    applyHeaderStyle(cell, { bold: h.bold, size: h.size, italic: h.italic });
    ws.mergeCells(`A${i + 1}:I${i + 1}`);
  });

  // Baris 5: spasi kosong
  ws.getRow(5).height = 8;

  // ── Header Tabel (Baris 6) ──
  const tableHeaderRow = ws.getRow(6);
  tableHeaderRow.height = 30;
  const tableHeaders = [
    "No.",
    "Tanggal",
    "Cuaca",
    "Jml. Pekerja",
    "Lokasi",
    "Progress (%)",
    "Detail Pekerjaan",
    "Kendala",
    "Dokumentasi",
  ];
  tableHeaders.forEach((h, i) => {
    const cell = tableHeaderRow.getCell(i + 1);
    cell.value = h;
    applyTableHeaderStyle(cell);
  });

  // ── Iterasi Data ──
  let rowIndex = 7;
  let reportNo = 1;

  for (const report of reports) {
    const tasks = report.tasks;
    const media = report.media;
    const rowSpan = Math.max(tasks.length, media.length, 1);

    // Download semua thumbnail untuk laporan ini secara paralel
    const thumbBuffers = await Promise.all(
      media.map(async (m) => {
        const thumbUrl = buildCloudinaryThumbUrl(m.url);
        const buf = await fetchImageBuffer(thumbUrl);
        return { buf, originalUrl: m.url };
      }),
    );

    // Tulis kolom yang akan di-merge (A–F, H)
    const mergedCols = [
      { col: 1, value: reportNo, center: true },
      {
        col: 2,
        value: formatDateID(new Date(report.reportDate)),
        center: true,
      },
      { col: 3, value: report.weather ?? "-", center: true },
      { col: 4, value: report.totalWorkers, center: true },
      { col: 5, value: report.location ?? "-", center: false },
      { col: 6, value: `${report.progressPercent}%`, center: true },
      { col: 8, value: report.issues ?? "-", center: false },
    ];

    for (const { col, value, center } of mergedCols) {
      const cell = ws.getCell(rowIndex, col);
      cell.value = value;
      applyDataCellStyle(cell, center);

      if (rowSpan > 1) {
        ws.mergeCells(rowIndex, col, rowIndex + rowSpan - 1, col);
      }
    }

    // Tulis setiap task di kolom G (col 7), baris terpisah
    for (let t = 0; t < rowSpan; t++) {
      const currentRow = rowIndex + t;
      const task = tasks[t];

      const taskCell = ws.getCell(currentRow, 7);
      if (task) {
        const taskParts = [`📌 ${task.taskName}`];
        if (task.workerCount > 0)
          taskParts.push(`   👷 ${task.workerCount} orang`);
        if (task.progress > 0) taskParts.push(`   📈 ${task.progress}%`);
        if (task.notes) taskParts.push(`   📝 ${task.notes}`);
        taskCell.value = taskParts.join("\n");
      } else {
        if (t === 0) taskCell.value = report.taskDescription ?? "-";
      }
      applyDataCellStyle(taskCell, false);

      // Tulis foto di kolom I (col 9)
      const photoCell = ws.getCell(currentRow, 9);
      const photoItem = thumbBuffers[t];

      if (photoItem?.buf) {
        try {
          const imageId = workbook.addImage({
            buffer: photoItem.buf,
            extension: "jpeg",
          });
          ws.addImage(imageId, {
            tl: { col: 8, row: currentRow - 1 } as ExcelJS.Anchor,
            br: { col: 9, row: currentRow } as ExcelJS.Anchor,
            editAs: "oneCell",
          });
          // Hyperlink ke foto full-res di sel yang sama
          photoCell.value = {
            text: "Lihat Foto ↗",
            hyperlink: photoItem.originalUrl,
          };
          photoCell.font = {
            color: { argb: "FF1E3A5F" },
            underline: true,
            size: 9,
          };
          photoCell.alignment = { horizontal: "center", vertical: "bottom" };
          ws.getRow(currentRow).height = 65;
        } catch {
          photoCell.value = photoItem.originalUrl;
          applyDataCellStyle(photoCell, true);
        }
      } else if (photoItem && !photoItem.buf) {
        // Thumbnail gagal didownload, tampilkan URL saja
        photoCell.value = {
          text: "Lihat Foto ↗",
          hyperlink: photoItem.originalUrl,
        };
        photoCell.font = {
          color: { argb: "FF1E3A5F" },
          underline: true,
          size: 9,
        };
        photoCell.alignment = { horizontal: "center", vertical: "middle" };
        applyDataCellStyle(photoCell, true);
      } else {
        photoCell.value = "-";
        applyDataCellStyle(photoCell, true);
      }

      // Style tambahan untuk baris di dalam rowspan
      if (t > 0) {
        // Pastikan border kiri-kanan tetap ada pada baris yang di-merge
        for (const col of [1, 2, 3, 4, 5, 6, 8]) {
          const c = ws.getCell(currentRow, col);
          c.border = {
            left: { style: "hair", color: { argb: "FFCCCCCC" } },
            right: { style: "hair", color: { argb: "FFCCCCCC" } },
          };
        }
      }
    }

    rowIndex += rowSpan;
    reportNo++;
  }

  // ─── Sheet 2: Ringkasan ──────────────────────────────────────────────────

  const ws2 = workbook.addWorksheet("Ringkasan");
  ws2.columns = [
    { key: "metric", width: 32 },
    { key: "value", width: 22 },
  ];

  // Header sheet ringkasan
  ws2.mergeCells("A1:B1");
  const ws2Title = ws2.getCell("A1");
  ws2Title.value = "RINGKASAN LAPORAN BULANAN";
  ws2Title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  ws2Title.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
  };
  ws2Title.alignment = { horizontal: "center", vertical: "middle" };
  ws2.getRow(1).height = 28;

  ws2.mergeCells("A2:B2");
  ws2.getCell("A2").value = `${project.name} — ${periodLabel}`;
  ws2.getCell("A2").font = { bold: true, size: 11 };
  ws2.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };
  ws2.getRow(2).height = 20;

  // Header kolom
  ["Metrik", "Nilai"].forEach((h, i) => {
    const cell = ws2.getCell(3, i + 1);
    cell.value = h;
    applyTableHeaderStyle(cell);
  });
  ws2.getRow(3).height = 24;

  // Hitung statistik
  const totalWorkers = reports.reduce((s, r) => s + r.totalWorkers, 0);
  const avgWorkers =
    reports.length > 0 ? Math.round(totalWorkers / reports.length) : 0;
  const progressValues = reports.map((r) => r.progressPercent);
  const avgProgress =
    progressValues.length > 0
      ? Math.round(
          progressValues.reduce((a, b) => a + b, 0) / progressValues.length,
        )
      : 0;
  const maxProgress =
    progressValues.length > 0 ? Math.max(...progressValues) : 0;
  const minProgress =
    progressValues.length > 0 ? Math.min(...progressValues) : 0;
  const totalTasks = reports.reduce((s, r) => s + r.tasks.length, 0);
  const totalPhotos = reports.reduce((s, r) => s + r.media.length, 0);
  const daysWithIssues = reports.filter(
    (r) => r.issues && r.issues.trim().length > 0,
  ).length;

  const metrics: Array<[string, string | number]> = [
    ["Nama Proyek", project.name],
    ["Lokasi", project.location ?? "-"],
    ["Periode Laporan", periodLabel],
    ["Total Hari Laporan", reports.length],
    ["Total Pekerja (Kumulatif)", totalWorkers],
    ["Rata-rata Pekerja / Hari", avgWorkers],
    ["Rata-rata Progress (%)", `${avgProgress}%`],
    ["Progress Tertinggi", `${maxProgress}%`],
    ["Progress Terendah", `${minProgress}%`],
    ["Total Task Dikerjakan", totalTasks],
    ["Total Foto Dokumentasi", totalPhotos],
    ["Hari dengan Kendala", daysWithIssues],
    ["Tanggal Ekspor", exportedAt],
    ["Diekspor Oleh", session.user.name],
  ];

  metrics.forEach(([metric, value], i) => {
    const row = ws2.getRow(i + 4);
    row.height = 20;
    const cellA = row.getCell(1);
    const cellB = row.getCell(2);

    cellA.value = metric;
    cellA.font = { bold: true, size: 10 };
    cellA.alignment = { vertical: "middle" };
    cellA.border = {
      top: { style: "hair", color: { argb: "FFCCCCCC" } },
      bottom: { style: "hair", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FF1E3A5F" } },
      right: { style: "hair", color: { argb: "FFCCCCCC" } },
    };

    // Zebra stripe
    if (i % 2 === 0) {
      cellA.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F8FF" },
      };
    }

    cellB.value = value;
    cellB.font = { size: 10 };
    cellB.alignment = { horizontal: "center", vertical: "middle" };
    cellB.border = {
      top: { style: "hair", color: { argb: "FFCCCCCC" } },
      bottom: { style: "hair", color: { argb: "FFCCCCCC" } },
      left: { style: "hair", color: { argb: "FFCCCCCC" } },
      right: { style: "thin", color: { argb: "FF1E3A5F" } },
    };
    if (i % 2 === 0) {
      cellB.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F8FF" },
      };
    }
  });

  // ─── 7. Tulis Buffer & Kirim Response ────────────────────────────────────

  const buffer = await workbook.xlsx.writeBuffer();

  const safeProjectName = project.name
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const filename = `Laporan_${safeProjectName}_${monthParam?.replace("-", "_") ?? ""}.xlsx`;

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
