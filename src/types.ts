/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // Auto code (e.g. PK2026-001)
  name: string;
  myKid: string;
  year: number;
  classGroup: string;
  gender: "Lelaki" | "Perempuan";
  joinedDate: string; // Tarikh Masuk Pemulihan
  subjects: "BM" | "MT" | "BM+MT";
  status: "Aktif" | "Dalam Proses" | "Tamat";
  skills: {
    k1_k8: number; // Asas Bacaan
    k9_k16: number; // Suku Kata
    k17_k24: number; // Perkataan
    m1_m8: number; // Nombor Asas
    m9_m16: number; // Operasi +-×÷
    m17_m20: number; // Wang & Masa
  };
  checklistsBM: boolean[]; // Array representing 32 BM skills (K1 to K32)
  checklistsMT: boolean[]; // Array representing 20 MT skills (M1 to M20)
  attendanceRate: number;
  attendanceHistory?: { date: string; status: "Hadir" | "Tidak Hadir" | "MC" }[]; // Daily attendance list
  intervention: string;
  notes: string;
  guardianName: string;
  guardianPhone: string;
  updatedAt: string;
}

export interface InterventionProgram {
  id: string;
  name: string;
  subject: "BM" | "MT";
  frequency: string;
  studentCount: number;
  bgColor: string;
  textColor: string;
  iconName: string;
}

export interface AttendanceRecord {
  month: string;
  bm: number;
  mt: number;
}

export interface SheetConfig {
  sheetId: string;
  apiKey: string;
  useMock: boolean;
  isSharingPublic: boolean;
}
