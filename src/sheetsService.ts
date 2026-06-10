import { Student } from "./types";
import { createBMChecklist, createMTChecklist } from "./initialData";

/**
 * Service to handle Google Sheets integration for PULIH360.
 * Supports public Visualization API (CORS-free, no key required if shared)
 * and manual CSV parsing as a backup.
 */

// Parse Gviz table format into Student entities
export function parseGvizToStudents(gvizData: any): Student[] {
  if (!gvizData || !gvizData.table || !gvizData.table.rows) {
    throw new Error("Format data Google Sheet tidak dikenali.");
  }

  const rows = gvizData.table.rows;
  
  const parsed = rows
    .filter((row: any) => row && row.c && Array.isArray(row.c))
    .map((row: any, index: number) => {
      const cells = row.c.map((cell: any) => cell ? cell.v : null);
      
      // Map cell position or column label to fields
      // Default fallback columns by index:
      // 0: ID, 1: Nama, 2: Tahun, 3: Mata Pelajaran, 4: Status, 5..10: Kemahiran / Markah, 11: Kehadiran, 12: Intervensi, 13: Catatan
      const getVal = (colIdx: number, defaultVal: any) => {
        if (cells[colIdx] === undefined || cells[colIdx] === null) return defaultVal;
        return cells[colIdx];
      };

      const idRaw = String(getVal(0, "")).trim();
      const nameRaw = String(getVal(1, "")).trim();

      // Skip row if both name and ID are missing/empty (probably blank rows at the end)
      if (!idRaw && !nameRaw) {
        return null;
      }

      const id = idRaw || `PK2026-${String(index + 20).padStart(3, "0")}`;
      const name = nameRaw || `Murid Tanpa Nama ${index + 1}`;
      const year = Number(getVal(2, 2)) || 2;
      
      let subjects = String(getVal(3, "BM")).toUpperCase() as "BM" | "MT" | "BM+MT";
      if (subjects !== "BM" && subjects !== "MT" && subjects !== "BM+MT") {
        subjects = "BM";
      }

      let status = String(getVal(4, "Aktif")) as "Aktif" | "Dalam Proses" | "Tamat";
      if (status !== "Aktif" && status !== "Dalam Proses" && status !== "Tamat") {
        status = "Aktif";
      }

      const k1_k8 = Number(getVal(5, 0)) || 0;
      const k9_k16 = Number(getVal(6, 0)) || 0;
      const k17_k24 = Number(getVal(7, 0)) || 0;
      const m1_m8 = Number(getVal(8, 0)) || 0;
      const m9_m16 = Number(getVal(9, 0)) || 0;
      const m17_m20 = Number(getVal(10, 0)) || 0;

      const attendanceRate = Number(getVal(11, 90)) || 90;
      const intervention = String(getVal(12, "Latihan Biasa"));
      const notes = String(getVal(13, ""));
      const updatedAt = new Date().toISOString().split("T")[0];

      const gRandom = index % 2 === 0 ? "Lelaki" as const : "Perempuan" as const;

      return {
        id,
        name,
        myKid: `${18 - year}0312-08-334${index}`,
        year,
        classGroup: `${year} Bestari`,
        gender: gRandom,
        joinedDate: "2026-01-04",
        subjects,
        status,
        skills: { k1_k8, k9_k16, k17_k24, m1_m8, m9_m16, m17_m20 },
        checklistsBM: createBMChecklist(k1_k8, k9_k16, k17_k24),
        checklistsMT: createMTChecklist(m1_m8, m9_m16, m17_m20),
        attendanceRate,
        attendanceHistory: [
          { date: "2026-06-08", status: "Hadir" },
          { date: "2026-06-09", status: "Hadir" },
          { date: "2026-06-10", status: "Hadir" }
        ] as { date: string; status: "Hadir" | "Tidak Hadir" }[],
        intervention,
        notes,
        guardianName: `Penjaga ${name.split(" ")[0]}`,
        guardianPhone: `+6015-321 00${index}`,
        updatedAt
      };
    })
    .filter((s): s is any => s !== null) as Student[];

  // Guarantee ID uniqueness
  const seenIds = new Set<string>();
  return parsed.map((student) => {
    let uniqueId = student.id;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${student.id}_${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);
    return { ...student, id: uniqueId };
  });
}

/**
 * Fetch Google Sheet via Visualization API (Gviz Table)
 */
export async function fetchGoogleSheetLive(sheetId: string): Promise<Student[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal memuat turun: status ${response.status}`);
  }
  
  const text = await response.text();
  
  // Extract json callback
  const startIdx = text.indexOf("{");
  const endIdx = text.lastIndexOf("}");
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Struktur JSON Google Sheet tidak sah.");
  }
  
  const jsonStr = text.substring(startIdx, endIdx + 1);
  const data = JSON.parse(jsonStr);
  
  return parseGvizToStudents(data);
}

/**
 * Parse CSV data directly from manual raw string or CSV export file.
 */
export function parseCSVToStudents(csvText: string): Student[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length <= 1) {
    throw new Error("Fail CSV kosong atau kurang satu baris data.");
  }

  // Detect and strip headers if existing
  const firstLine = lines[0].toLowerCase();
  const hasHeaders = firstLine.includes("nama") || firstLine.includes("id") || firstLine.includes("tahun");
  const dataLines = hasHeaders ? lines.slice(1) : lines;

  const parsed = dataLines.map((line, index) => {
    // Basic CSV splitting, taking care of quoted values
    const parts: string[] = [];
    let currentPart = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        parts.push(currentPart.trim());
        currentPart = "";
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart.trim());

    // Clean up parts by removal of wrapping double quotes
    const cleanParts = parts.map(p => p.replace(/^["']|["']$/g, "").trim());

    const getVal = (colIdx: number, defaultVal: string) => {
      return cleanParts[colIdx] !== undefined ? cleanParts[colIdx] : defaultVal;
    };

    const idRaw = String(getVal(0, "")).trim();
    const nameRaw = String(getVal(1, "")).trim();

    // Skip row if both name and ID are missing/empty
    if (!idRaw && !nameRaw) {
      return null;
    }

    const id = idRaw || `M_CSV${index + 1}`;
    const name = nameRaw || `Murid Tanpa Nama ${index + 1}`;
    const year = Number(getVal(2, "3")) || 3;
    
    let subjects = getVal(3, "BM").toUpperCase() as "BM" | "MT" | "BM+MT";
    if (subjects !== "BM" && subjects !== "MT" && subjects !== "BM+MT") {
      subjects = "BM";
    }

    let status = getVal(4, "Aktif") as "Aktif" | "Dalam Proses" | "Tamat";
    if (status !== "Aktif" && status !== "Dalam Proses" && status !== "Tamat") {
      status = "Aktif";
    }

    const k1_k8 = Number(getVal(5, "0")) || 0;
    const k9_k16 = Number(getVal(6, "0")) || 0;
    const k17_k24 = Number(getVal(7, "0")) || 0;
    const m1_m8 = Number(getVal(8, "0")) || 0;
    const m9_m16 = Number(getVal(9, "0")) || 0;
    const m17_m20 = Number(getVal(10, "0")) || 0;

    const attendanceRate = Number(getVal(11, "90")) || 90;
    const intervention = getVal(12, "Latihan Biasa");
    const notes = getVal(13, "");
    const updatedAt = new Date().toISOString().split("T")[0];

    const gRandom = index % 2 === 0 ? "Lelaki" as const : "Perempuan" as const;

    return {
      id,
      name,
      myKid: `${18 - year}0515-08-445${index}`,
      year,
      classGroup: `${year} Cemerlang`,
      gender: gRandom,
      joinedDate: "2026-01-04",
      subjects,
      status,
      skills: { k1_k8, k9_k16, k17_k24, m1_m8, m9_m16, m17_m20 },
      checklistsBM: createBMChecklist(k1_k8, k9_k16, k17_k24),
      checklistsMT: createMTChecklist(m1_m8, m9_m16, m17_m20),
      attendanceRate,
      attendanceHistory: [
        { date: "2026-06-08", status: "Hadir" },
        { date: "2026-06-09", status: "Hadir" },
        { date: "2026-06-10", status: "Hadir" }
      ] as { date: string; status: "Hadir" | "Tidak Hadir" }[],
      intervention,
      notes,
      guardianName: `Penjaga ${name.split(" ")[0]}`,
      guardianPhone: `+6015-442 99${index}`,
      updatedAt
    };
  }).filter((s): s is any => s !== null) as Student[];

  // Guarantee ID uniqueness
  const seenIds = new Set<string>();
  return parsed.map((student) => {
    let uniqueId = student.id;
    let counter = 1;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${student.id}_${counter}`;
      counter++;
    }
    seenIds.add(uniqueId);
    return { ...student, id: uniqueId };
  });
}
