import { Student, InterventionProgram, AttendanceRecord } from "./types";

// Checklist generators
export const createBMChecklist = (k1_8: number, k9_16: number, k17_24: number): boolean[] => {
  const arr = new Array(32).fill(false);
  // K1-K8
  const limit1 = Math.round((k1_8 / 100) * 8);
  for (let i = 0; i < limit1; i++) arr[i] = true;
  // K9-K16
  const limit2 = Math.round((k9_16 / 100) * 8);
  for (let i = 0; i < limit2; i++) arr[i + 8] = true;
  // K17-K24
  const limit3 = Math.round((k17_24 / 100) * 8);
  for (let i = 0; i < limit3; i++) arr[i + 16] = true;
  // K25-K32
  const limit4 = k17_24 > 70 ? Math.round(((k17_24 - 15) / 100) * 8) : 0;
  for (let i = 0; i < limit4; i++) arr[i + 24] = true;
  return arr;
};

export const createMTChecklist = (m1_8: number, m9_16: number, m17_20: number): boolean[] => {
  const arr = new Array(20).fill(false);
  // Group 1: 6 skills (Pra Nombor, Konsep Nombor, Nombor Bulat hingga 10, 20, 100, 1000)
  const limit1 = Math.round((m1_8 / 100) * 6);
  for (let i = 0; i < limit1; i++) arr[i] = true;
  
  // Group 2: 8 skills (Operasi Tambah (4 skills), Operasi Tolak (4 skills))
  const limit2 = Math.round((m9_16 / 100) * 8);
  for (let i = 0; i < limit2; i++) arr[i + 6] = true;
  
  // Group 3: 6 skills (Operasi Darab, Operasi Bahagi, Wang (3 skills), Masa dan Waktu (1 skill))
  const limit3 = Math.round((m17_20 / 100) * 6);
  for (let i = 0; i < limit3; i++) arr[i + 14] = true;
  
  return arr;
};

// Help generate standard mock attendance dates
const createMockAttendanceHistory = (rate: number) => {
  const dates = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05", "2026-06-08", "2026-06-09", "2026-06-10"];
  return dates.map(d => ({
    date: d,
    status: Math.random() * 100 < rate ? ("Hadir" as const) : ("Tidak Hadir" as const)
  }));
};

export const initialStudents: Student[] = [
  {
    id: "PK2026-001",
    name: "Ahmad Hariz Bin Zainal",
    myKid: "170415-08-1123",
    year: 4,
    classGroup: "4 Cemerlang",
    gender: "Lelaki",
    joinedDate: "2026-01-04",
    subjects: "BM",
    status: "Aktif",
    skills: { k1_k8: 85, k9_k16: 70, k17_k24: 50, m1_m8: 0, m9_m16: 0, m17_m20: 0 },
    checklistsBM: createBMChecklist(85, 70, 50),
    checklistsMT: new Array(20).fill(false),
    attendanceRate: 92,
    attendanceHistory: createMockAttendanceHistory(92),
    intervention: "Pecutan Akhir",
    notes: "Menunjukkan minat dalam membaca suku kata terbuka.",
    guardianName: "Zainal Abidin Bin Md Isa",
    guardianPhone: "+6012-445 6172",
    updatedAt: "2026-06-08"
  },
  {
    id: "PK2026-002",
    name: "Nurul Ain Binti Yusof",
    myKid: "180211-10-5432",
    year: 3,
    classGroup: "3 Dinamik",
    gender: "Perempuan",
    joinedDate: "2026-01-11",
    subjects: "BM+MT",
    status: "Dalam Proses",
    skills: { k1_k8: 60, k9_k16: 45, k17_k24: 30, m1_m8: 70, m9_m16: 40, m17_m20: 10 },
    checklistsBM: createBMChecklist(60, 45, 30),
    checklistsMT: createMTChecklist(70, 40, 10),
    attendanceRate: 85,
    attendanceHistory: createMockAttendanceHistory(85),
    intervention: "Literasi X",
    notes: "Memerlukan bimbingan individu untuk menulis suku kata tertutup.",
    guardianName: "Yusof Bin Salleh",
    guardianPhone: "+6013-662 9011",
    updatedAt: "2026-06-09"
  },
  {
    id: "PK2026-003",
    name: "Rizqan Firdaus Bin Rosli",
    myKid: "160822-03-3311",
    year: 5,
    classGroup: "5 Amanah",
    gender: "Lelaki",
    joinedDate: "2026-02-01",
    subjects: "MT",
    status: "Aktif",
    skills: { k1_k8: 0, k9_k16: 0, k17_k24: 0, m1_m8: 90, m9_m16: 65, m17_m20: 40 },
    checklistsBM: new Array(32).fill(false),
    checklistsMT: createMTChecklist(90, 65, 40),
    attendanceRate: 96,
    attendanceHistory: createMockAttendanceHistory(96),
    intervention: "Kira-Kira Bestari",
    notes: "Sudah menguasai sifir 2, 3 dan 5 dengan baik.",
    guardianName: "Rosli Bin Jabar",
    guardianPhone: "+6019-211 4455",
    updatedAt: "2026-06-05"
  },
  {
    id: "PK2026-004",
    name: "Siti Hajar Binti Abdullah",
    myKid: "191130-05-6678",
    year: 2,
    classGroup: "2 Bestari",
    gender: "Perempuan",
    joinedDate: "2026-01-04",
    subjects: "BM",
    status: "Tamat",
    skills: { k1_k8: 100, k9_k16: 95, k17_k24: 90, m1_m8: 0, m9_m16: 0, m17_m20: 0 },
    checklistsBM: createBMChecklist(100, 95, 90),
    checklistsMT: new Array(20).fill(false),
    attendanceRate: 98,
    attendanceHistory: createMockAttendanceHistory(98),
    intervention: "Bacaan 15 Minit",
    notes: "Telah menguasai K1-K32, sedia untuk ditamatkan dari program pemulihan.",
    guardianName: "Abdullah Bin Omar",
    guardianPhone: "+6011-2233 4455",
    updatedAt: "2026-06-01"
  },
  {
    id: "PK2026-005",
    name: "Daniel Amsyar Bin Kamal",
    myKid: "171012-08-9987",
    year: 4,
    classGroup: "4 Cemerlang",
    gender: "Lelaki",
    joinedDate: "2026-01-15",
    subjects: "BM+MT",
    status: "Aktif",
    skills: { k1_k8: 75, k9_k16: 60, k17_k24: 40, m1_m8: 80, m9_m16: 50, m17_m20: 25 },
    checklistsBM: createBMChecklist(75, 60, 40),
    checklistsMT: createMTChecklist(80, 50, 25),
    attendanceRate: 88,
    attendanceHistory: createMockAttendanceHistory(88),
    intervention: "Bijak Sifir",
    notes: "Sering tersilap operasi tolak di bahagian pengumpulan semula.",
    guardianName: "Kamal Bin Mansur",
    guardianPhone: "+6017-333 4412",
    updatedAt: "2026-06-07"
  },
  {
    id: "PK2026-006",
    name: "Adam Syamil Bin Zulkifli",
    myKid: "180514-01-1153",
    year: 3,
    classGroup: "3 Dinamik",
    gender: "Lelaki",
    joinedDate: "2026-01-18",
    subjects: "BM",
    status: "Aktif",
    skills: { k1_k8: 80, k9_k16: 65, k17_k24: 45, m1_m8: 0, m9_m16: 0, m17_m20: 0 },
    checklistsBM: createBMChecklist(80, 65, 45),
    checklistsMT: new Array(20).fill(false),
    attendanceRate: 94,
    attendanceHistory: createMockAttendanceHistory(94),
    intervention: "Pecutan Akhir",
    notes: "Fokus menulis lebih baik daripada mengeja lisan.",
    guardianName: "Zulkifli Bin Ismail",
    guardianPhone: "+6013-334 5512",
    updatedAt: "2026-06-08"
  },
  {
    id: "PK2026-007",
    name: "Amira Natasya Binti Roslan",
    myKid: "190325-08-3344",
    year: 2,
    classGroup: "2 Pintar",
    gender: "Perempuan",
    joinedDate: "2026-02-15",
    subjects: "MT",
    status: "Aktif",
    skills: { k1_k8: 0, k9_k16: 0, k17_k24: 0, m1_m8: 85, m9_m16: 60, m17_m20: 30 },
    checklistsBM: new Array(32).fill(false),
    checklistsMT: createMTChecklist(85, 60, 30),
    attendanceRate: 90,
    attendanceHistory: createMockAttendanceHistory(90),
    intervention: "Kira-Kira Bestari",
    notes: "Menguasai konsep penambahan asas menggunakan pembilang.",
    guardianName: "Roslan Bin Baharuddin",
    guardianPhone: "+6012-778 9988",
    updatedAt: "2026-06-10"
  },
  {
    id: "PK2026-008",
    name: "Muhammad Faiz Bin Helmi",
    myKid: "160105-02-1111",
    year: 5,
    classGroup: "5 Amanah",
    gender: "Lelaki",
    joinedDate: "2026-01-05",
    subjects: "BM+MT",
    status: "Dalam Proses",
    skills: { k1_k8: 55, k9_k16: 40, k17_k24: 25, m1_m8: 65, m9_m16: 45, m17_m20: 15 },
    checklistsBM: createBMChecklist(55, 40, 25),
    checklistsMT: createMTChecklist(65, 45, 15),
    attendanceRate: 82,
    attendanceHistory: createMockAttendanceHistory(82),
    intervention: "Literasi X",
    notes: "Perlu bimbingan membaca suku kata kvkv.",
    guardianName: "Helmi Bin Yahya",
    guardianPhone: "+6018-912 3456",
    updatedAt: "2026-06-09"
  },
  {
    id: "PK2026-009",
    name: "Siti Nurhaliza Binti Ahmad",
    myKid: "181215-08-9990",
    year: 3,
    classGroup: "3 Dinamik",
    gender: "Perempuan",
    joinedDate: "2026-01-06",
    subjects: "BM",
    status: "Aktif",
    skills: { k1_k8: 90, k9_k16: 80, k17_k24: 55, m1_m8: 0, m9_m16: 0, m17_m20: 0 },
    checklistsBM: createBMChecklist(90, 80, 55),
    checklistsMT: new Array(20).fill(false),
    attendanceRate: 95,
    attendanceHistory: createMockAttendanceHistory(95),
    intervention: "Bacaan 15 Minit",
    notes: "Meningkat dengan cepat, suka membaca buku cerita berilustrasi.",
    guardianName: "Ahmad Bin Hassan",
    guardianPhone: "+6019-334 1122",
    updatedAt: "2026-06-08"
  },
  {
    id: "PK2026-010",
    name: "Aiman Hakim Bin Mustaffa",
    myKid: "170603-10-8877",
    year: 4,
    classGroup: "4 Pintar",
    gender: "Lelaki",
    joinedDate: "2026-02-12",
    subjects: "MT",
    status: "Aktif",
    skills: { k1_k8: 0, k9_k16: 0, k17_k24: 0, m1_m8: 95, m9_m16: 70, m17_m20: 45 },
    checklistsBM: new Array(32).fill(false),
    checklistsMT: createMTChecklist(95, 70, 45),
    attendanceRate: 91,
    attendanceHistory: createMockAttendanceHistory(91),
    intervention: "Bijak Sifir",
    notes: "Hampir menguasai sifir 4.",
    guardianName: "Mustaffa Bin Mohd",
    guardianPhone: "+6013-445 2299",
    updatedAt: "2026-06-06"
  }
];

// Complete the active list to 48 students to match dashboard statistics
// 22 BM, 18 MT, 8 BM+MT. All with auto-incremented PK2026-xxx codes
export const generateCompleteStudents = (): Student[] => {
  const list = [...initialStudents];
  let currentCounter = list.length + 1;
  const nextId = () => {
    const idStr = `PK2026-${String(currentCounter).padStart(3, "0")}`;
    currentCounter++;
    return idStr;
  };
  
  // Need 18 more BM students
  const bmNames = [
    "Khairul Bin Anwar", "Farah Binti Fauzi", "Mohd Daniel Bin Razali", "Aqilah Binti Azmi",
    "Hafiz Bin Syahmi", "Sofea Binti Hazmi", "Zikri Bin Muaz", "Alyaa Binti Ridzuan",
    "Rayyan Bin Iskandar", "Balqis Binti Rizal", "Arif Bin Shahrul", "Melissa Binti Amin",
    "Imran Bin Zahid", "Zara Binti Luqman", "Nabil Bin Razi", "Syafiqah Binti Jamil",
    "Irfan Bin Nazri", "Auni Binti Kamal"
  ];
  bmNames.forEach((name, idx) => {
    const yRandom = Math.floor(Math.random() * 4) + 2; // 2-5
    const k1 = Math.floor(Math.random() * 30) + 70;
    const k9 = Math.floor(Math.random() * 40) + 40;
    const k17 = Math.floor(Math.random() * 30) + 20;
    const gRandom = idx % 2 === 0 ? "Lelaki" as const : "Perempuan" as const;
    
    list.push({
      id: nextId(),
      name: name,
      myKid: `${20 - yRandom}0312-08-${idx + 4123}`,
      year: yRandom,
      classGroup: `${yRandom} Cemerlang`,
      gender: gRandom,
      joinedDate: "2026-01-08",
      subjects: "BM",
      status: idx % 6 === 0 ? "Tamat" : idx % 5 === 0 ? "Dalam Proses" : "Aktif",
      skills: {
        k1_k8: k1,
        k9_k16: k9,
        k17_k24: k17,
        m1_m8: 0, m9_m16: 0, m17_m20: 0
      },
      checklistsBM: createBMChecklist(k1, k9, k17),
      checklistsMT: new Array(20).fill(false),
      attendanceRate: Math.floor(Math.random() * 15) + 84,
      attendanceHistory: createMockAttendanceHistory(Math.floor(Math.random() * 15) + 84),
      intervention: idx % 2 === 0 ? "Pecutan Akhir" : "Bacaan 15 Minit",
      notes: "Memerlukan bimbingan fonika dan suku kata tertutup.",
      guardianName: gRandom === "Lelaki" ? `Anwar Bin ${name.split(" ")[1] || "Zakaria"}` : `Fauzi Bin Md Isa`,
      guardianPhone: `+6015-998 12${idx}`,
      updatedAt: "2026-06-08"
    });
  });

  // Need 15 more MT students
  const mtNames = [
    "Muaz Bin Khairul", "Batrisyia Binti Roslan", "Syahmeen Bin Rizal", "Damia Binti Azman",
    "Farish Bin Imran", "Humaira Binti Shahrir", "Zafri Bin Syafiq", "Qistina Binti Nazmi",
    "Adib Bin Hakim", "Alya Bin Zamri", "Taufiq Bin Safuan", "Dania Binti Affendi",
    "Zharif Bin Yahya", "Mia Bin Shukri", "Khairi Bin Zakaria"
  ];
  mtNames.forEach((name, idx) => {
    const yRandom = Math.floor(Math.random() * 4) + 2; // 2-5
    const m1 = Math.floor(Math.random() * 25) + 75;
    const m9 = Math.floor(Math.random() * 35) + 45;
    const m17 = Math.floor(Math.random() * 25) + 20;
    const gRandom = idx % 2 === 0 ? "Lelaki" as const : "Perempuan" as const;

    list.push({
      id: nextId(),
      name: name,
      myKid: `${20 - yRandom}0724-10-${idx + 6144}`,
      year: yRandom,
      classGroup: `${yRandom} Dinamik`,
      gender: gRandom,
      joinedDate: "2026-02-10",
      subjects: "MT",
      status: idx % 5 === 0 ? "Tamat" : "Aktif",
      skills: {
        k1_k8: 0, k9_k16: 0, k17_k24: 0,
        m1_m8: m1,
        m9_m16: m9,
        m17_m20: m17
      },
      checklistsBM: new Array(32).fill(false),
      checklistsMT: createMTChecklist(m1, m9, m17),
      attendanceRate: Math.floor(Math.random() * 12) + 87,
      attendanceHistory: createMockAttendanceHistory(Math.floor(Math.random() * 12) + 87),
      intervention: idx % 2 === 0 ? "Kira-Kira Bestari" : "Bijak Sifir",
      notes: "Memerlukan latihan berulang dengan visual manipulatif.",
      guardianName: `Bapa kepada ${name.split(" ")[0]}`,
      guardianPhone: `+6011-332 99${idx}`,
      updatedAt: "2026-06-08"
    });
  });

  // Need 5 more BM+MT students
  const bothNames = [
    "Rania Binti Rosli", "Syazwan Bin Safian", "Fatin Binti Ridzuan", 
    "Afiqah Binti Bakri", "Zulhelmi Bin Hassan"
  ];
  bothNames.forEach((name, idx) => {
    const yRandom = Math.floor(Math.random() * 3) + 2; // 2-4
    const k1 = Math.floor(Math.random() * 25) + 60;
    const k9 = Math.floor(Math.random() * 25) + 40;
    const k17 = Math.floor(Math.random() * 20) + 15;
    const m1 = Math.floor(Math.random() * 25) + 65;
    const m9 = Math.floor(Math.random() * 25) + 35;
    const m17 = Math.floor(Math.random() * 20) + 10;
    const gRandom = idx % 2 === 0 ? "Lelaki" as const : "Perempuan" as const;

    list.push({
      id: nextId(),
      name: name,
      myKid: `${20 - yRandom}1102-03-${idx + 8812}`,
      year: yRandom,
      classGroup: `${yRandom} Bestari`,
      gender: gRandom,
      joinedDate: "2026-01-14",
      subjects: "BM+MT",
      status: "Aktif",
      skills: {
        k1_k8: k1,
        k9_k16: k9,
        k17_k24: k17,
        m1_m8: m1,
        m9_m16: m9,
        m17_m20: m17
      },
      checklistsBM: createBMChecklist(k1, k9, k17),
      checklistsMT: createMTChecklist(m1, m9, m17),
      attendanceRate: Math.floor(Math.random() * 10) + 85,
      attendanceHistory: createMockAttendanceHistory(Math.floor(Math.random() * 10) + 85),
      intervention: "Bacaan 15 Minit",
      notes: "Fokus dwi-subjek dengan sesi pembelajaran fleksibel.",
      guardianName: `Penjaga ${name.split(" ")[0]}`,
      guardianPhone: `+6019-881 22${idx}`,
      updatedAt: "2026-06-09"
    });
  });

  return list;
};

export const initialInterventions: InterventionProgram[] = [
  {
    id: "int01",
    name: "Pecutan Akhir",
    subject: "BM",
    frequency: "3 sesi/minggu",
    studentCount: 14,
    bgColor: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    textColor: "#1d4ed8",
    iconName: "Zap"
  },
  {
    id: "int02",
    name: "Literasi X",
    subject: "BM",
    frequency: "5 sesi/minggu",
    studentCount: 11,
    bgColor: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    textColor: "#7c3aed",
    iconName: "BookOpen"
  },
  {
    id: "int03",
    name: "Kira-Kira Bestari",
    subject: "MT",
    frequency: "4 sesi/minggu",
    studentCount: 9,
    bgColor: "bg-teal-50 text-teal-700 hover:bg-teal-100",
    textColor: "#0f766e",
    iconName: "Calculator"
  },
  {
    id: "int04",
    name: "Bijak Sifir",
    subject: "MT",
    frequency: "2 sesi/minggu",
    studentCount: 7,
    bgColor: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    textColor: "#b45309",
    iconName: "Star"
  },
  {
    id: "int05",
    name: "Bacaan 15 Minit",
    subject: "BM",
    frequency: "Harian",
    studentCount: 18,
    bgColor: "bg-pink-50 text-pink-700 hover:bg-pink-100",
    textColor: "#be185d",
    iconName: "Clock"
  }
];

export const initialAttendance: AttendanceRecord[] = [
  { month: "Jan", bm: 72, mt: 55 },
  { month: "Feb", bm: 80, mt: 62 },
  { month: "Mac", bm: 68, mt: 58 },
  { month: "Apr", bm: 90, mt: 74 },
  { month: "Mei", bm: 85, mt: 80 },
  { month: "Jun", bm: 100, mt: 88 }
];
