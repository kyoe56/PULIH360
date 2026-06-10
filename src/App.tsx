import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  Calculator,
  Rocket,
  FileBarChart2,
  Settings,
  Folder,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Save,
  Database,
  Upload,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Share2,
  FileText,
  Printer,
  RefreshCw,
  Sliders,
  X,
  FileSpreadsheet,
  Check,
  ChevronRight,
  TrendingDown,
  Info
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { Student, InterventionProgram, AttendanceRecord } from "./types";
import { motion } from "motion/react";
import {
  generateCompleteStudents,
  initialInterventions,
  initialAttendance
} from "./initialData";
import {
  fetchGoogleSheetLive,
  parseCSVToStudents
} from "./sheetsService";

// Standard Plus Jakarta Sans/Inter fallback setup styling in index.css includes clean definitions
export const BM_SKILL_LABELS = [
  "KP1: Huruf Kecil a-z", "KP2: Huruf Besar A-Z", "KP3: Suku Kata KV", "KP4: Perkataan KV", 
  "KP5: Dua Suku Kata Terbuka (KV+KV)", "KP6: Suku Kata Dua Huruf Tertutup KVK", "KP7: Perkataan V+KV", "KP8: Suku Kata Tertutup KVK",
  "KP9: Suku Kata Terbuka KV+KVK", "KP10: Suku Kata Tertutup KVK+KV", "KP11: Perkataan KVK+KVK", "KP12: Suku Kata Tertutup KVKK",
  "KP13: Perkataan KV+KVKK", "KP14: Perkataan KVK+KVKK", "KP15: Perkataan KVKK+KV", "KP16: Perkataan KVKK+KVK",
  "KP17: Suku Kata Tertutup KVKK+KVKK", "KP18: Perkataan Diftang", "KP19: Perkataan Digraf", "KP20: Suku Kata Konsonan Bergabung",
  "KP21: Imbuhan Awalan", "KP22: Imbuhan Akhiran", "KP23: Ayat Mudah", "KP24: Karangan Pendek",
  "KP25: Suku Kata KV+KV+KV", "KP26: Suku Kata KVK+KV+KVK", "KP27: Suku Kata KVKK+KV+KV", "KP28: Suku Kata KVK+KVK+KV",
  "KP29: Kata Hubung & Sendi", "KP30: Tanda Bacaan Dasar", "KP31: Pemahaman Teks Sederhana", "KP32: Penguasaan Literasi Sempurna"
];

export const MT_SKILL_LABELS = [
  "KP1: Pra Nombor", "KP2: Konsep Nombor",
  "KP3.1: Nombor bulat hingga 10", "KP3.2: Nombor bulat hingga 20", "KP3.3: Nombor bulat hingga 100", "KP3.4: Nombor bulat hingga 1000",
  "KP4.1: Tambah dalam lingkungan 10", "KP4.2: Tambah dalam lingkungan 18", "KP4.3: Tambah dalam lingkungan 100", "KP4.4: Tambah dalam lingkungan 1000",
  "KP5.1: Tolak dalam lingkungan 10", "KP5.2: Tolak dalam lingkungan 18", "KP5.3: Tolak dalam lingkungan 100", "KP5.4: Tolak dalam lingkungan 1000",
  "KP6: Operasi darab", "KP7: Operasi Bahagi",
  "KP8.1: Wang hingga RM10", "KP8.2: Wang hingga RM100", "KP8.3: Wang hingga RM1000",
  "KP9: Masa dan waktu"
];

const MALAY_MONTH_NAMES = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
];

const MALAY_WEEKDAYS = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];

const formatMalayDate = (dateStr: string) => {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${d} ${MALAY_MONTH_NAMES[m - 1]} ${y}`;
  } catch (e) {
    return dateStr;
  }
};

const getTrendDataForStudent = (m: Student) => {
  const bmLength = m.checklistsBM ? m.checklistsBM.length : 32;
  const mtLength = m.checklistsMT ? m.checklistsMT.length : 20;

  if (m.subjects === "BM") {
    const p1 = m.checklistsBM ? m.checklistsBM.slice(0, 8).filter(Boolean).length / 8 : 0;
    const p2 = m.checklistsBM ? m.checklistsBM.slice(0, 16).filter(Boolean).length / 16 : 0;
    const p3 = m.checklistsBM ? m.checklistsBM.slice(0, 24).filter(Boolean).length / 24 : 0;
    const p4 = m.checklistsBM ? m.checklistsBM.slice(0, 32).filter(Boolean).length / 32 : 0;
    return [0, Math.round(p1 * 100), Math.round(p2 * 100), Math.round(p3 * 100), Math.round(p4 * 100)];
  } else if (m.subjects === "MT") {
    const p1 = m.checklistsMT ? m.checklistsMT.slice(0, 5).filter(Boolean).length / 5 : 0;
    const p2 = m.checklistsMT ? m.checklistsMT.slice(0, 10).filter(Boolean).length / 10 : 0;
    const p3 = m.checklistsMT ? m.checklistsMT.slice(0, 15).filter(Boolean).length / 15 : 0;
    const p4 = m.checklistsMT ? m.checklistsMT.slice(0, 20).filter(Boolean).length / 20 : 0;
    return [0, Math.round(p1 * 100), Math.round(p2 * 100), Math.round(p3 * 100), Math.round(p4 * 100)];
  } else {
    // Both BM and MT
    const bmP1 = m.checklistsBM ? m.checklistsBM.slice(0, 8).filter(Boolean).length / 8 : 0;
    const bmP2 = m.checklistsBM ? m.checklistsBM.slice(0, 16).filter(Boolean).length / 16 : 0;
    const bmP3 = m.checklistsBM ? m.checklistsBM.slice(0, 24).filter(Boolean).length / 24 : 0;
    const bmP4 = m.checklistsBM ? m.checklistsBM.slice(0, 32).filter(Boolean).length / 32 : 0;

    const mtP1 = m.checklistsMT ? m.checklistsMT.slice(0, 5).filter(Boolean).length / 5 : 0;
    const mtP2 = m.checklistsMT ? m.checklistsMT.slice(0, 10).filter(Boolean).length / 10 : 0;
    const mtP3 = m.checklistsMT ? m.checklistsMT.slice(0, 15).filter(Boolean).length / 15 : 0;
    const mtP4 = m.checklistsMT ? m.checklistsMT.slice(0, 20).filter(Boolean).length / 20 : 0;

    return [
      0,
      Math.round(((bmP1 + mtP1) / 2) * 100),
      Math.round(((bmP2 + mtP2) / 2) * 100),
      Math.round(((bmP3 + mtP3) / 2) * 100),
      Math.round(((bmP4 + mtP4) / 2) * 100)
    ];
  }
};

const Sparkline = ({ student }: { student: Student }) => {
  const values = getTrendDataForStudent(student);
  const width = 110;
  const height = 28;
  const padding = 4;

  const points = values.map((val, idx) => {
    const x = padding + (idx / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - (val / 100) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const color = student.subjects === "BM" ? "#6366f1" : student.subjects === "MT" ? "#14b8a6" : "#f59e0b";
  const firstPoint = `${padding},${height - padding}`;
  const lastPoint = `${width - padding},${height - padding}`;
  const fillPoints = `${firstPoint} ${points} ${lastPoint}`;

  return (
    <div className="flex flex-col items-center justify-center select-none py-1">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkline-grad-${student.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Baseline decoration */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* Shaded Area */}
        <polygon
          points={fillPoints}
          fill={`url(#sparkline-grad-${student.id})`}
        />

        {/* Sparkline curve */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Running Tracker Circle */}
        {values.length > 0 && (() => {
          const lastVal = values[values.length - 1];
          const x = width - padding;
          const y = height - padding - (lastVal / 100) * (height - padding * 2);
          return (
            <circle
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="animate-pulse"
            />
          );
        })()}
      </svg>
      {/* Visual Percentage Indicators */}
      <div className="flex items-center justify-between w-full px-1.5 mt-1 text-[8px] font-mono font-bold text-slate-500 tracking-tighter">
        <span>0%</span>
        <span className="text-slate-400 font-extrabold">{values[values.length - 1]}%</span>
      </div>
    </div>
  );
};

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "murid" | "sesi" | "sheets" | "laporan" | "kehadiran" | "bm" | "mt" | "intervensi" | "dokumen">("dashboard");
  
  // Real-time student database
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem("pulih360_students");
      return saved ? JSON.parse(saved) : generateCompleteStudents();
    } catch (e) {
      return generateCompleteStudents();
    }
  });
  const [interventions, setInterventions] = useState<InterventionProgram[]>(() => {
    try {
      const saved = localStorage.getItem("pulih360_interventions");
      return saved ? JSON.parse(saved) : initialInterventions;
    } catch (e) {
      return initialInterventions;
    }
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("pulih360_attendance");
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch (e) {
      return initialAttendance;
    }
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [subFilter, setSubFilter] = useState<string>("Semua");
  const [yearFilter, setYearFilter] = useState<string>("Semua");

  // Google Sheets integration state
  const [sheetId, setSheetId] = useState(() => {
    return localStorage.getItem("pulih360_sheet_id") || "17Wba7ZBPOj3Dj9PT6sjSB0MyC6YWzJvDErf3vKKffKk";
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [rawCSVInput, setRawCSVInput] = useState("");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"local" | "sheets" | "csv">(() => {
    return (localStorage.getItem("pulih360_connection_status") as any) || "local";
  });
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(() => {
    return localStorage.getItem("pulih360_auto_sync") === "true";
  });

  // Student CRUD / Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForSesi, setSelectedStudentForSesi] = useState<Student | null>(null);

  // New Student State
  const [newStudent, setNewStudent] = useState<Omit<Student, "id" | "updatedAt">>({
    name: "",
    myKid: "",
    year: 3,
    classGroup: "3 Pintar",
    gender: "Lelaki",
    joinedDate: new Date().toISOString().split("T")[0],
    subjects: "BM",
    status: "Aktif",
    skills: { k1_k8: 50, k9_k16: 30, k17_k24: 10, m1_m8: 40, m9_m16: 20, m17_m20: 0 },
    checklistsBM: new Array(32).fill(false),
    checklistsMT: new Array(20).fill(false),
    attendanceRate: 95,
    attendanceHistory: [],
    intervention: "Bacaan 15 Minit",
    notes: "",
    guardianName: "",
    guardianPhone: ""
  });

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  // States for 5 New Modules (PULIH360 Integration)
  const [attendanceDate, setAttendanceDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [selectedBmStudentId, setSelectedBmStudentId] = useState<string>("");
  const [selectedMtStudentId, setSelectedMtStudentId] = useState<string>("");
  const [selectedReportStudentId, setSelectedReportStudentId] = useState<string>("");
  const [selectedInterventionGroup, setSelectedInterventionGroup] = useState<string>("Semua");
  const [newInterventionName, setNewInterventionName] = useState("");
  const [newInterventionSubject, setNewInterventionSubject] = useState<"BM" | "MT">("BM");
  const [newInterventionFrequency, setNewInterventionFrequency] = useState("Khas Mingguan");
  const [calendarMonth, setCalendarMonth] = useState<number>(5); // June is 5 (0-indexed)
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  // PDF Report states
  const [reportFormatType, setReportFormatType] = useState<"parent" | "school">("parent");
  const [reportTeacherName, setReportTeacherName] = useState("Cikgu Mohd Fadhli Bin Hamzah");
  const [reportGuardianName, setReportGuardianName] = useState("");
  const [reportPrincipalName, setReportPrincipalName] = useState("Puan Hajah Norehan Binti Hamid (Guru Besar)");
  const [reportRemarks, setReportRemarks] = useState("");
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

  const triggerNotification = (type: "success" | "error" | "info", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const getDailyAttendanceRate = (dateStr: string) => {
    const dayHistory = students.map(s => s.attendanceHistory?.find(h => h.date === dateStr)).filter(Boolean);
    if (dayHistory.length === 0) return null; // No records for this date
    
    const present = dayHistory.filter(h => h.status === "Hadir").length;
    const absent = dayHistory.filter(h => h.status === "Tidak Hadir").length;
    const mc = dayHistory.filter(h => h.status === "MC").length;
    
    const relevantCount = present + absent;
    const rate = relevantCount > 0 ? Math.round((present / relevantCount) * 100) : 100;
    
    return { rate, present, absent, mc, total: dayHistory.length };
  };

  // Live Data recalculations based on current database
  const stats = useMemo(() => {
    const total = students.length;
    const bmOnly = students.filter(s => s.subjects === "BM").length;
    const mtOnly = students.filter(s => s.subjects === "MT").length;
    const both = students.filter(s => s.subjects === "BM+MT").length;
    
    // Status metrics
    const aktif = students.filter(s => s.status === "Aktif").length;
    const proses = students.filter(s => s.status === "Dalam Proses").length;
    const tamat = students.filter(s => s.status === "Tamat").length;

    // Average skill masteries
    // We only take averages of students enrolled in those subjects
    const bmStudents = students.filter(s => s.subjects === "BM" || s.subjects === "BM+MT");
    const mtStudents = students.filter(s => s.subjects === "MT" || s.subjects === "BM+MT");

    const avgK1 = bmStudents.length ? Math.round(bmStudents.reduce((acc, s) => acc + s.skills.k1_k8, 0) / bmStudents.length) : 0;
    const avgK2 = bmStudents.length ? Math.round(bmStudents.reduce((acc, s) => acc + s.skills.k9_k16, 0) / bmStudents.length) : 0;
    const avgK3 = bmStudents.length ? Math.round(bmStudents.reduce((acc, s) => acc + s.skills.k17_k24, 0) / bmStudents.length) : 0;

    const avgM1 = mtStudents.length ? Math.round(mtStudents.reduce((acc, s) => acc + s.skills.m1_m8, 0) / mtStudents.length) : 0;
    const avgM2 = mtStudents.length ? Math.round(mtStudents.reduce((acc, s) => acc + s.skills.m9_m16, 0) / mtStudents.length) : 0;
    const avgM3 = mtStudents.length ? Math.round(mtStudents.reduce((acc, s) => acc + s.skills.m17_m20, 0) / mtStudents.length) : 0;

    const avgAttendance = total ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / total) : 0;

    return {
      total,
      bmOnly,
      mtOnly,
      both,
      aktif,
      proses,
      tamat,
      avgK1,
      avgK2,
      avgK3,
      avgM1,
      avgM2,
      avgM3,
      avgAttendance
    };
  }, [students]);

  // Sync intervention numbers with real database counts
  useEffect(() => {
    const countsMap = students.reduce((acc, s) => {
      if (s.intervention) {
        acc[s.intervention] = (acc[s.intervention] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    setInterventions(prev =>
      prev.map(p => ({
        ...p,
        studentCount: countsMap[p.name] || 0
      }))
    );
  }, [students]);

  // Search and filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "Semua" || student.status === statusFilter;
      const matchSub = subFilter === "Semua" || student.subjects === subFilter;
      const matchYear = yearFilter === "Semua" || String(student.year) === yearFilter;

      return matchSearch && matchStatus && matchSub && matchYear;
    });
  }, [students, searchQuery, statusFilter, subFilter, yearFilter]);

  // Current Date display helper
  const dateStr = useMemo(() => {
    const d = new Date();
    const days = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
    const months = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Okt", "November", "Disember"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · Sesi 2026`;
  }, []);

  // Handle Fetching from Google Sheet (Live sharing)
  const handleFetchSheet = async () => {
    if (!sheetId.trim()) {
      setSyncError("Sila masukkan ID Google Sheet yang sah.");
      return;
    }
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(null);

    try {
      const liveData = await fetchGoogleSheetLive(sheetId);
      if (liveData && liveData.length > 0) {
        setStudents(liveData);
        setConnectionStatus("sheets");
        setSyncSuccess(`Berjaya menyambung & mengimport ${liveData.length} data murid dari Google Sheet!`);
        triggerNotification("success", "Penyelarasan Google Sheets Berjaya!");
      } else {
        // Handle empty sheet gracefully - keep existing students, but mark connection as sheets
        setConnectionStatus("sheets");
        setSyncSuccess(`Berjaya disambung dengan Google Sheet (ID: ${sheetId}). Lembaran kosong dikesan; kohort simulasi dikekalkan sebagai rujukan.`);
        triggerNotification("success", "Penyelarasan Google Sheets Berjaya (Lembaran Kosong)!");
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(
        `Gagal memuat turun spreadsheet. Sila pastikan:
        1. Google Sheet dikongsi sebagai "Sesiapa sahaja yang mempunyai pautan boleh melihat" (Anyone with the link can view).
        2. ID Spreadsheet adalah betul.
        3. Struktur lajur sepadan dengan format sistem PULIH360.`
      );
      triggerNotification("error", "Penyelarasan Google Sheets Gagal.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Synchronize state with localStorage
  useEffect(() => {
    localStorage.setItem("pulih360_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("pulih360_sheet_id", sheetId);
  }, [sheetId]);

  useEffect(() => {
    localStorage.setItem("pulih360_connection_status", connectionStatus);
  }, [connectionStatus]);

  useEffect(() => {
    localStorage.setItem("pulih360_attendance", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem("pulih360_interventions", JSON.stringify(interventions));
  }, [interventions]);

  useEffect(() => {
    localStorage.setItem("pulih360_auto_sync", String(isAutoSyncEnabled));
  }, [isAutoSyncEnabled]);

  // Handle auto-sync on load
  const [hasAutoSynced, setHasAutoSynced] = useState(false);
  useEffect(() => {
    if (isAutoSyncEnabled && !hasAutoSynced && sheetId.trim()) {
      setHasAutoSynced(true);
      setTimeout(() => {
        handleFetchSheet();
      }, 500);
    }
  }, [sheetId, isAutoSyncEnabled, hasAutoSynced]);

  // Auto-fill report settings based on student selection
  useEffect(() => {
    if (!selectedReportStudentId) return;
    const student = students.find(s => s.id === selectedReportStudentId);
    if (student) {
      setReportGuardianName(student.guardianName || `Ibu Bapa / Penjaga kepada ${student.name}`);
      
      const bmCount = student.checklistsBM ? student.checklistsBM.filter(Boolean).length : 0;
      const mtCount = student.checklistsMT ? student.checklistsMT.filter(Boolean).length : 0;
      
      let ulasan = "";
      if (reportFormatType === "parent") {
        if (student.status === "Tamat") {
          ulasan = `Tahniah! ${student.name} telah berjaya menguasai kesemua konstruk pemulihan utama dan dilepaskan ke kelas arus perdana. Murid ini menunjukkan usaha yang sangat luar biasa dan fokus yang cemerlang. Mohon ibu bapa terus memantau bacaan di rumah agar momentum kejayaan dikekalkan. Syabas!`;
        } else if (bmCount >= 24 || mtCount >= 16) {
          ulasan = `${student.name} mempamerkan peningkatan yang amat membanggakan dalam menguasai kemahiran asas. Beliau sangat rajin, aktif dalam aktiviti kelas, dan mempunyai sikap positif. Bimbingan berterusan di rumah akan mempercepatkan proses pelepasan beliau dari kelas pemulihan. Syabas atas komitmen cemerlang!`;
        } else if (student.attendanceRate >= 92) {
          ulasan = `${student.name} menunjukkan komitmen kehadiran yang sangat baik (${student.attendanceRate}%). Usaha beliau untuk belajar amat tinggi dan beliau mula memahami konsep asas dengan baik. Teruskan sokongan di rumah dengan latihan latih tubi harian untuk mengukuhkan penguasaan sub-kemahiran.`;
        } else {
          ulasan = `Perkembangan ${student.name} adalah memuaskan namun beliau masih memerlukan latihan pengukuhan yang lebih kerap di rumah bagi menguasai baki konstruk. Sokongan tambahan, perhatian penuh, serta dorongan daripada pihak ibu bapa dan keluarga di rumah amat kritikal bagi membina keyakinan diri murid.`;
        }
      } else {
        // School template (administrative focus)
        if (student.status === "Tamat") {
          ulasan = `Murid telah mencapai indeks penguasaan 100% dalam konstruk pemulihan. Telah melalui ujian pelepasan khas dan disahkan bersedia sepenuhnya untuk mengikuti kurikulum arus perdana. Disyorkan penutupan fail kes pemulihan.`;
        } else {
          ulasan = `Berada dalam program intervensi aktif ("${student.intervention || 'Intervensi Asas'}"). Menunjukkan purata kadar respons harian yang positif. Diperlukankesinambungan intervensi dalam fasa seterusnya agar dapat merapatkan jurang pembelajaran dengan murid arus perdana.`;
        }
      }
      setReportRemarks(ulasan);
    }
  }, [selectedReportStudentId, reportFormatType, students]);

  // Parse Raw Copy Paste CSV or file upload
  const handleImportCSVData = (csvText: string) => {
    try {
      const parsed = parseCSVToStudents(csvText);
      if (parsed.length > 0) {
        setStudents(parsed);
        setConnectionStatus("csv");
        setSyncSuccess(`Berjaya mengimport ${parsed.length} rekod murid daripada fail CSV/Teks!`);
        setRawCSVInput("");
        triggerNotification("success", "Data CSV berjaya diimport!");
      }
    } catch (err: any) {
      setSyncError(`Ralat pemprosesan CSV: ${err.message || err}`);
      triggerNotification("error", "Format CSV tidak disokong.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        handleImportCSVData(text);
      }
    };
    reader.readAsText(file);
  };

  // Add Murid handler
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) {
      alert("Nama murid diperlukan!");
      return;
    }

    const nextNumber = students.length + 1;
    const generatedId = `PK2026-${String(nextNumber).padStart(3, "0")}`;

    const created: Student = {
      ...newStudent,
      id: generatedId,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    setStudents([created, ...students]);
    setIsAddModalOpen(false);
    // Reset form
    setNewStudent({
      name: "",
      myKid: "",
      year: 3,
      classGroup: "3 Pintar",
      gender: "Lelaki",
      joinedDate: new Date().toISOString().split("T")[0],
      subjects: "BM",
      status: "Aktif",
      skills: { k1_k8: 50, k9_k16: 30, k17_k24: 10, m1_m8: 40, m9_m16: 20, m17_m20: 0 },
      checklistsBM: new Array(32).fill(false),
      checklistsMT: new Array(20).fill(false),
      attendanceRate: 95,
      attendanceHistory: [],
      intervention: "Bacaan 15 Minit",
      notes: "",
      guardianName: "",
      guardianPhone: ""
    });
    triggerNotification("success", `Murid ${created.name} (${generatedId}) berjaya didaftarkan!`);
  };

  // Delete Murid handler
  const handleDeleteStudent = (id: string, name: string) => {
    const confirmed = window.confirm(`Adakah anda pasti mahu memadam profil murid "${name}"? Tindakan ini tidak boleh diundurkan.`);
    if (!confirmed) return;

    setStudents(prev => prev.filter(s => s.id !== id));
    triggerNotification("info", `Profil ${name} telah dipadam.`);
  };

  // Save Student Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...editingStudent,
            updatedAt: new Date().toISOString().split("T")[0]
          };
        }
        return s;
      })
    );
    setEditingStudent(null);
    triggerNotification("success", "Maklumat murid dikemas kini!");
  };

  // Real-time Skills updater for interactive learning sessions
  const handleUpdateSkillsInSession = (field: keyof Student["skills"], val: number) => {
    if (!selectedStudentForSesi) return;

    const newSkills = {
      ...selectedStudentForSesi.skills,
      [field]: val
    };

    // Import or generate checklists dynamically based on checklist helpers
    const currentBMList = [...(selectedStudentForSesi.checklistsBM || new Array(32).fill(false))];
    const currentMTList = [...(selectedStudentForSesi.checklistsMT || new Array(20).fill(false))];

    // Align checklists to newly dragged continuous values
    let alignedBMList = currentBMList;
    let alignedMTList = currentMTList;

    if (field === "k1_k8" || field === "k9_k16" || field === "k17_k24") {
      const limit1 = Math.round((newSkills.k1_k8 / 100) * 8);
      const limit2 = Math.round((newSkills.k9_k16 / 100) * 8);
      const limit3 = Math.round((newSkills.k17_k24 / 100) * 8);
      const limit4 = newSkills.k17_k24 > 70 ? Math.round(((newSkills.k17_k24 - 15) / 100) * 8) : 0;

      alignedBMList = new Array(32).fill(false);
      for (let i = 0; i < limit1; i++) alignedBMList[i] = true;
      for (let i = 0; i < limit2; i++) alignedBMList[i + 8] = true;
      for (let i = 0; i < limit3; i++) alignedBMList[i + 16] = true;
      for (let i = 0; i < limit4; i++) alignedBMList[i + 24] = true;
    }

    if (field === "m1_m8" || field === "m9_m16" || field === "m17_m20") {
      const limit1 = Math.round((newSkills.m1_m8 / 100) * 6);
      const limit2 = Math.round((newSkills.m9_m16 / 100) * 8);
      const limit3 = Math.round((newSkills.m17_m20 / 100) * 6);

      alignedMTList = new Array(20).fill(false);
      for (let i = 0; i < limit1; i++) alignedMTList[i] = true;
      for (let i = 0; i < limit2; i++) alignedMTList[i + 6] = true;
      for (let i = 0; i < limit3; i++) alignedMTList[i + 14] = true;
    }

    const updated = {
      ...selectedStudentForSesi,
      skills: newSkills,
      checklistsBM: alignedBMList,
      checklistsMT: alignedMTList
    };

    setSelectedStudentForSesi(updated);

    // Save live changes to database
    setStudents(prev =>
      prev.map(s => (s.id === updated.id ? updated : s))
    );
  };

  const handleToggleBMChecklist = (index: number) => {
    if (!selectedStudentForSesi) return;
    const currentList = selectedStudentForSesi.checklistsBM ? [...selectedStudentForSesi.checklistsBM] : new Array(32).fill(false);
    currentList[index] = !currentList[index];

    // Recalculate k1_k8, k9_k16, k17_k24 based on checklist states
    const k1_k8_val = Math.round((currentList.slice(0, 8).filter(Boolean).length / 8) * 100);
    const k9_k16_val = Math.round((currentList.slice(8, 16).filter(Boolean).length / 8) * 100);
    const k17_k24_val = Math.round((currentList.slice(16, 24).filter(Boolean).length / 8) * 100);

    const updated = {
      ...selectedStudentForSesi,
      checklistsBM: currentList,
      skills: {
        ...selectedStudentForSesi.skills,
        k1_k8: k1_k8_val,
        k9_k16: k9_k16_val,
        k17_k24: k17_k24_val
      }
    };
    setSelectedStudentForSesi(updated);
    setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    triggerNotification("success", `Kemas kini kemahiran: ${BM_SKILL_LABELS[index]}`);
  };

  const handleToggleStudentBMChecklist = (studentId: string, index: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const currentList = s.checklistsBM ? [...s.checklistsBM] : new Array(32).fill(false);
      currentList[index] = !currentList[index];

      // Recalculate k1_k8, k9_k16, k17_k24 based on checklist states
      const k1_k8_val = Math.round((currentList.slice(0, 8).filter(Boolean).length / 8) * 100);
      const k9_k16_val = Math.round((currentList.slice(8, 16).filter(Boolean).length / 8) * 100);
      const k17_k24_val = Math.round((currentList.slice(16, 24).filter(Boolean).length / 8) * 100);

      const updated = {
        ...s,
        checklistsBM: currentList,
        skills: {
          ...s.skills,
          k1_k8: k1_k8_val,
          k9_k16: k9_k16_val,
          k17_k24: k17_k24_val
        }
      };
      
      if (selectedStudentForSesi && selectedStudentForSesi.id === studentId) {
        setSelectedStudentForSesi(updated);
      }
      return updated;
    }));
    triggerNotification("success", `Kompetensi BM dikemas kini: ${BM_SKILL_LABELS[index]}`);
  };

  const handleToggleMTChecklist = (index: number) => {
    if (!selectedStudentForSesi) return;
    const currentList = selectedStudentForSesi.checklistsMT ? [...selectedStudentForSesi.checklistsMT] : new Array(20).fill(false);
    currentList[index] = !currentList[index];

    // Recalculate m1_m8, m9_m16, m17_m20 based on checklist states over 20-element array
    const m1_m8_val = Math.round((currentList.slice(0, 6).filter(Boolean).length / 6) * 100);
    const m9_m16_val = Math.round((currentList.slice(6, 14).filter(Boolean).length / 8) * 100);
    const m17_m20_val = Math.round((currentList.slice(14, 20).filter(Boolean).length / 6) * 100);

    const updated = {
      ...selectedStudentForSesi,
      checklistsMT: currentList,
      skills: {
        ...selectedStudentForSesi.skills,
        m1_m8: m1_m8_val,
        m9_m16: m9_m16_val,
        m17_m20: m17_m20_val
      }
    };
    setSelectedStudentForSesi(updated);
    setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    triggerNotification("success", `Kemas kini kemahiran: ${MT_SKILL_LABELS[index]}`);
  };

  const handleToggleStudentMTChecklist = (studentId: string, index: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const currentList = s.checklistsMT ? [...s.checklistsMT] : new Array(20).fill(false);
      currentList[index] = !currentList[index];

      // Recalculate m1_m8, m9_m16, m17_m20 based on checklist states
      const m1_m8_val = Math.round((currentList.slice(0, 6).filter(Boolean).length / 6) * 100);
      const m9_m16_val = Math.round((currentList.slice(6, 14).filter(Boolean).length / 8) * 100);
      const m17_m20_val = Math.round((currentList.slice(14, 20).filter(Boolean).length / 6) * 100);

      const updated = {
        ...s,
        checklistsMT: currentList,
        skills: {
          ...s.skills,
          m1_m8: m1_m8_val,
          m9_m16: m9_m16_val,
          m17_m20: m17_m20_val
        }
      };
      
      if (selectedStudentForSesi && selectedStudentForSesi.id === studentId) {
        setSelectedStudentForSesi(updated);
      }
      return updated;
    }));
    triggerNotification("success", `Kompetensi MT dikemas kini: ${MT_SKILL_LABELS[index]}`);
  };

  const handleUpdateAttendanceInSession = (val: number) => {
    if (!selectedStudentForSesi) return;

    const updated = {
      ...selectedStudentForSesi,
      attendanceRate: Math.max(0, Math.min(100, val))
    };

    setSelectedStudentForSesi(updated);

    // Save live changes to database
    setStudents(prev =>
      prev.map(s => (s.id === updated.id ? updated : s))
    );
  };

  // Toggle Attendance History for a specific date (support "Hadir" | "Tidak Hadir" | "MC")
  const handleToggleAttendance = (studentId: string, status: "Hadir" | "Tidak Hadir" | "MC") => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      
      const history = s.attendanceHistory ? [...s.attendanceHistory] : [];
      const existingIdx = history.findIndex(item => item.date === attendanceDate);
      
      if (existingIdx > -1) {
        history[existingIdx].status = status;
      } else {
        history.push({ date: attendanceDate, status });
      }
      
      // Calculate new rate (treat MC as excused, excluding from denominator)
      const relevantHistory = history.filter(h => h.status !== "MC");
      const totalDays = relevantHistory.length;
      const presentDays = relevantHistory.filter(h => h.status === "Hadir").length;
      const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : s.attendanceRate;

      return {
        ...s,
        attendanceHistory: history,
        attendanceRate: rate
      };
    }));
    triggerNotification("success", `Kehadiran dikemas kini pada ${attendanceDate}`);
  };

  // Bulk set attendance for all students on active date
  const handleMarkAllAttendance = (status: "Hadir" | "Tidak Hadir") => {
    setStudents(prev => prev.map(s => {
      const history = s.attendanceHistory ? [...s.attendanceHistory] : [];
      const existingIdx = history.findIndex(item => item.date === attendanceDate);
      
      if (existingIdx > -1) {
        history[existingIdx].status = status;
      } else {
        history.push({ date: attendanceDate, status });
      }
      
      const relevantHistory = history.filter(h => h.status !== "MC");
      const totalDays = relevantHistory.length;
      const presentDays = relevantHistory.filter(h => h.status === "Hadir").length;
      const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : s.attendanceRate;

      return {
        ...s,
        attendanceHistory: history,
        attendanceRate: rate
      };
    }));
    triggerNotification("success", `Markah pukal: Semua murid ditandakan ${status === "Hadir" ? "Hadir" : "Tidak Hadir"} bagi tarikh ${attendanceDate}`);
  };

  // Add direct intervention group
  const handleAddInterventionGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterventionName.trim()) return;

    const bgColors = ["bg-blue-50 text-blue-700", "bg-indigo-50 text-indigo-700", "bg-teal-50 text-teal-700", "bg-pink-50 text-pink-700", "bg-amber-50 text-amber-700"];
    const textColors = ["text-blue-600", "text-indigo-600", "text-teal-600", "text-pink-600", "text-amber-600"];
    const randomIdx = Math.floor(Math.random() * bgColors.length);

    const newGroup: InterventionProgram = {
      id: `INT-${Date.now()}`,
      name: newInterventionName,
      subject: newInterventionSubject,
      frequency: newInterventionFrequency,
      studentCount: 0,
      bgColor: bgColors[randomIdx],
      textColor: textColors[randomIdx],
      iconName: "Rocket"
    };

    setInterventions([...interventions, newGroup]);
    setNewInterventionName("");
    triggerNotification("success", `Kumpulan intervensi "${newGroup.name}" telah didaftarkan!`);
  };

  // Reset to original simulation datasets
  const handleResetToDefault = () => {
    const reply = window.confirm("Adakah anda mahu menetapkan semula pangkalan data kepada konfigurasi simulasi Laluan 48 Murid asal?");
    if (!reply) return;
    setStudents(generateCompleteStudents());
    setConnectionStatus("local");
    setSyncSuccess(null);
    setSyncError(null);
    triggerNotification("info", "Pangkalan data ditetapkan semula.");
  };

  // Calculate year breakdown for pie chart
  const yearChartData = useMemo(() => {
    const years = [2, 3, 4, 5, 5];
    const dataMap: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0 };
    students.forEach(s => {
      if (dataMap[s.year] !== undefined) {
        dataMap[s.year]++;
      } else {
        dataMap[5]++; // Put year 6 into 5 for simple dashboard scale
      }
    });
    return [
      { name: "Tahun 2", value: dataMap[2] },
      { name: "Tahun 3", value: dataMap[3] },
      { name: "Tahun 4", value: dataMap[4] },
      { name: "Tahun 5 & 6", value: dataMap[5] }
    ];
  }, [students]);

  // Pie chart COLORS
  const COLORS = ["#3B8BFF", "#6C63FF", "#0f766e", "#f59e0b", "#be185d"];

  // Custom Intervensi trigger links
  const handleMenuTriggerPrompt = (title: string, tag: string) => {
    if (tag === "BM") {
      setSubFilter("BM");
      setActiveTab("murid");
    } else if (tag === "MT") {
      setSubFilter("MT");
      setActiveTab("murid");
    } else {
      setActiveTab("murid");
    }
    triggerNotification("info", `Memaparkan senarai modul: ${title}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 transform transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-3 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-xl px-5 py-4 max-w-sm">
          {notification.type === "success" && <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />}
          {notification.type === "error" && <AlertCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />}
          {notification.type === "info" && <Info className="text-indigo-500 w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{notification.msg}</p>
        </div>
      )}

      {/* Main layout wrapper */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 animate-pulse">PULIH360</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-bold tracking-wider uppercase">
              Sistem Pemulihan Khas
            </div>
          </div>

          {/* User Profile Info */}
          <div className="p-4 mx-3 my-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shadow-inner">
              MK
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate text-slate-800">Mohd Khairulrizal</h4>
              <p className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider">Guru Pemulihan</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {/* Category: Utama */}
            <div className="px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">UTAMA</div>
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${activeTab === "dashboard" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Dashboard Utama</span>
              <span className="ml-auto bg-indigo-600 text-[8px] px-1 py-0.5 rounded-full text-white font-black shadow-sm">
                LIVE
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("murid"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "murid"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === "murid" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Pengurusan Murid</span>
              <span className="ml-auto bg-slate-200 text-indigo-805 text-[9px] px-1.5 py-0.2 rounded font-black">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("kehadiran"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "kehadiran"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <CalendarCheck className={`w-3.5 h-3.5 ${activeTab === "kehadiran" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Latihan Kehadiran</span>
              <span className="ml-auto bg-teal-50 text-teal-700 text-[8px] px-1 py-0.5 border border-teal-100 rounded">
                92%
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("sesi");
                if (students.length > 0 && !selectedStudentForSesi) {
                  setSelectedStudentForSesi(students[0]);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "sesi"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === "sesi" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Klinik Pembelajaran</span>
            </button>

            {/* Category: Akademik */}
            <div className="pt-2.5 px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">AKADEMIK</div>
            <button
              onClick={() => { setActiveTab("bm"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "bm"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === "bm" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Bahasa Melayu (K1-K32)</span>
            </button>

            <button
              onClick={() => { setActiveTab("mt"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "mt"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Calculator className={`w-3.5 h-3.5 ${activeTab === "mt" ? "text-teal-600" : "text-slate-400"}`} />
              <span>Matematik (M1-M20)</span>
            </button>

            <button
              onClick={() => { setActiveTab("intervensi"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "intervensi"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Rocket className={`w-3.5 h-3.5 ${activeTab === "intervensi" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Program Intervensi</span>
              <span className="ml-auto bg-amber-500 text-[8px] px-1 py-0.5 rounded-full text-white font-bold">
                {interventions.length}
              </span>
            </button>

            {/* Category: Laporan */}
            <div className="pt-2.5 px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">LAPORAN</div>
            <button
              onClick={() => { setActiveTab("laporan"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "laporan"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileBarChart2 className={`w-3.5 h-3.5 ${activeTab === "laporan" ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Laporan & Sijil</span>
            </button>

            {/* Category: Dokumen */}
            <div className="pt-2.5 px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">DOKUMEN</div>
            <button
              onClick={() => { setActiveTab("dokumen"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "dokumen"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${activeTab === "dokumen" ? "text-amber-500" : "text-slate-400"}`} />
              <span>Dokumen & Panduan</span>
            </button>
            
            <button
              onClick={() => { setActiveTab("sheets"); setSelectedStudentForSesi(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "sheets"
                  ? "bg-slate-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === "sheets" ? "text-emerald-600" : "text-slate-400"}`} />
              <span className="truncate">Integrasi Google Sheets</span>
              {connectionStatus === "sheets" && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          </nav>

          {/* Sync status button */}
          <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
            <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
              connectionStatus === "sheets" 
                ? "bg-emerald-50/50 border-emerald-100" 
                : connectionStatus === "csv" 
                ? "bg-blue-50/50 border-blue-100" 
                : "bg-slate-50 border-slate-100"
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === "sheets" 
                    ? "bg-emerald-500 shadow-emerald-500/20" 
                    : connectionStatus === "csv" 
                    ? "bg-blue-500 shadow-blue-500/20" 
                    : "bg-slate-400"
                }`}></div>
                <span className="text-xs font-bold text-slate-700">
                  {connectionStatus === "sheets" 
                    ? "Segerak Google Sheets" 
                    : connectionStatus === "csv" 
                    ? "Diimport Manual (CSV)" 
                    : "Pangkalan Data Tempatan"}
                </span>
                {connectionStatus !== "local" && (
                  <button 
                    onClick={handleResetToDefault} 
                    title="Reset to Demo"
                    className="ml-auto text-slate-400 hover:text-slate-600 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-medium">
                {connectionStatus === "sheets" 
                  ? "Mengambil data real-time dari jadual Google Sheets." 
                  : connectionStatus === "csv" 
                  ? "Data tersimpan secara memori. Boleh dikemaskini." 
                  : "Mod simulasi. Hubungkan Google Sheet untuk mula."}
              </p>
            </div>
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="flex-1 bg-[#F8FAFC] p-8 overflow-y-auto">
          {/* Header Topbar */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5 text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-wider">
                <span>PULIH360 Suite</span>
                <span>•</span>
                <span className="text-indigo-600">{activeTab}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sistem Pemulihan PULIH360</h1>
              <p className="text-slate-500 text-xs mt-1 font-semibold">{dateStr}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStudents(generateCompleteStudents()); triggerNotification("info", "Pangkalan data ditetapkan semula."); }}
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Simulasi / Segar Semula</span>
              </button>

              <button
                onClick={() => {
                  setNewStudent({
                    name: "",
                    myKid: "",
                    year: 3,
                    classGroup: "3 Pintar",
                    gender: "Lelaki",
                    joinedDate: new Date().toISOString().split("T")[0],
                    subjects: "BM",
                    status: "Aktif",
                    skills: { k1_k8: 50, k9_k16: 30, k17_k24: 10, m1_m8: 40, m9_m16: 20, m17_m20: 0 },
                    checklistsBM: new Array(32).fill(false),
                    checklistsMT: new Array(20).fill(false),
                    attendanceRate: 95,
                    attendanceHistory: [],
                    intervention: "Bacaan 15 Minit",
                    notes: "",
                    guardianName: "",
                    guardianPhone: ""
                  });
                  setIsAddModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white transition px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Daftar Murid Baru</span>
              </button>
            </div>
          </header>

          {/* ======================================= */}
          {/* TAB 1: DASHBOARD (UTAMA) */}
          {/* ======================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Connection Warning Banner */}
              {connectionStatus === "local" && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">Hubungkan Google Sheet ID: {sheetId}</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Sekarang anda di dalam <strong>mod simulasi (Laluan 48 Murid)</strong>. Untuk terus memantau performa mengikut data rujukan sekolah, hubungkan pangkalan data dengan Google Sheets anda.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("sheets")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl h-9 transition inline-flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Hubung Sekarang</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* KPI Scorecard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Students */}
                <motion.div 
                  onClick={() => setActiveTab("murid")}
                  whileHover={{ scale: 1.025, y: -2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] group-hover:scale-110 transition duration-300">
                    <Users className="w-32 h-32 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Jumlah Murid</h3>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-slate-800 flex items-center font-bold">48 Murid</span> keseluruhan aktif
                  </p>
                </motion.div>

                {/* Bahasa Melayu Only */}
                <motion.div 
                  onClick={() => handleMenuTriggerPrompt("Bahasa Melayu", "BM")}
                  whileHover={{ scale: 1.025, y: -2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] group-hover:scale-110 transition duration-300">
                    <BookOpen className="w-32 h-32 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Bahasa Melayu</h3>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.bmOnly}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                    <span className="text-purple-600 font-bold">{Math.round((stats.bmOnly/stats.total)*100)}%</span> daripada keseluruhan murid
                  </p>
                </motion.div>

                {/* Matematik Only */}
                <motion.div 
                  onClick={() => handleMenuTriggerPrompt("Matematik", "MT")}
                  whileHover={{ scale: 1.025, y: -2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] group-hover:scale-110 transition duration-300">
                    <Calculator className="w-32 h-32 text-teal-600" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Matematik</h3>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.mtOnly}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                    <span className="text-teal-600 font-bold">{Math.round((stats.mtOnly/stats.total)*100)}%</span> murid penguasaan angka
                  </p>
                </motion.div>

                {/* BM + MT Both */}
                <motion.div 
                  onClick={() => handleMenuTriggerPrompt("Dwi-Akademik BM+MT", "BM+MT")}
                  whileHover={{ scale: 1.025, y: -2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] group-hover:scale-110 transition duration-300">
                    <Sparkles className="w-32 h-32 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">BM + Matematik</h3>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.both}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                    <span className="text-amber-600 font-bold">{stats.both} Murid</span> mengikuti kedua-dua intervensi
                  </p>
                </motion.div>
              </div>

              {/* Real-time Visualization Graphics - 1st Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recharts Bar Chart: Monthly Attendance */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Graf Kadar Kehadiran Bulanan</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Januari - Jun 2026 (Analitik Aliran Kehadiran)</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
                        <span>Bahasa Melayu</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                        <span>Matematik</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                          itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
                        />
                        <Bar dataKey="bm" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Kehadiran BM" />
                        <Bar dataKey="mt" fill="#10b981" radius={[4, 4, 0, 0]} name="Kehadiran MT" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recharts Pie Chart: Cohort Breakdowns */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                  <h3 className="text-base font-bold text-slate-800 mb-2">Taburan Cohort Tahun / Sesi</h3>
                  <p className="text-xs text-slate-400 mb-6">Diasingkan berdasarkan Tahun Pengajian Berdaftar</p>
                  
                  <div className="h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={yearChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {yearChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total Indicator */}
                    <div className="absolute text-center">
                      <span className="block text-2xl font-extrabold text-slate-800 leading-none">{stats.total}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1 block">Murid</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-semibold">
                    {yearChartData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="text-slate-600 truncate">{item.name}</span>
                        <span className="ml-auto text-slate-400 text-xs font-bold">{item.value} rekod</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bars: Penguasaan Kemahiran Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bahasa Melayu Skill Milestones */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-sm text-slate-800">Purata Penguasaan Bahasa Melayu</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed font-semibold">
                      Statistik purata penguasaan kemahiran literasi (Bahasa Melayu) bagi murid berdaftar.
                    </p>

                    <div className="space-y-4">
                      {/* Skill Group 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">K1–K8 (Asas Bacaan & Vokal)</span>
                          <span className="text-slate-800 font-extrabold">{stats.avgK1}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgK1}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Skill Group 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">K9–K16 (Suku Kata Terbuka/Tertutup)</span>
                          <span className="text-slate-800 font-extrabold">{stats.avgK2}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgK2}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Skill Group 3 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">K17–K24 (Membaca Ayat Mudah)</span>
                          <span className="text-slate-800 font-extrabold">{stats.avgK3}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgK3}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between font-bold">
                    <span>*Kadar dikira berdasarkan {stats.bmOnly + stats.both} murid BM</span>
                    <span className="text-indigo-600 cursor-pointer hover:underline" onClick={() => setActiveTab("murid")}>Urus Kemahiran BM</span>
                  </div>
                </div>

                {/* Matematik Skill Milestones */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-sm text-slate-800">Purata Penguasaan Matematik</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed font-semibold">
                      Statistik purata penguasaan kemahiran numerasi (Matematik) bagi murid berdaftar.
                    </p>

                    <div className="space-y-4">
                      {/* Numeracy Group 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">M1–M8 (Pengenalan Nombor Asas)</span>
                          <span className="text-slate-800 font-extrabold">{stats.avgM1}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgM1}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Numeracy Group 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">M9–M16 (Operasi Tambah & Tolak)</span>
                          <span className="text-slate-800 font-extrabold">{stats.avgM2}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgM2}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Numeracy Group 3 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-600">M17–M20 (Konsep Masa, Jam & Wang)</span>
                          <span className="text-slate-800 font-extrabold">{stats.avgM3}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgM3}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between font-bold shadow-none">
                    <span>*Kadar dikira berdasarkan {stats.mtOnly + stats.both} murid MT</span>
                    <span className="text-emerald-600 cursor-pointer hover:underline" onClick={() => setActiveTab("murid")}>Urus Kemahiran MT</span>
                  </div>
                </div>

                {/* Cohort Status Progress card */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-sm text-slate-800">Status Keberkesanan Sesi</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed font-semibold">
                      Status terkini perkembangan murid pemulihan bagi sesi rujukan 2026.
                    </p>

                    <div className="space-y-4 text-xs font-semibold">
                      {/* Aktif */}
                      <div className="flex items-center justify-between p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          <span className="text-slate-700">Aktif Ikut Sesi</span>
                        </div>
                        <span className="text-blue-600 font-bold text-sm">{stats.aktif} Murid</span>
                      </div>

                      {/* Dalam Proses */}
                      <div className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="text-slate-700">Bimbingan Intensif</span>
                        </div>
                        <span className="text-amber-600 font-bold text-sm">{stats.proses} Murid</span>
                      </div>

                      {/* Tamat */}
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-slate-700">Graduasi / Pelepasan</span>
                        </div>
                        <span className="text-emerald-600 font-bold text-sm">{stats.tamat} Murid</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between font-bold">
                    <span>*Daftar murid automatik mengikut zon</span>
                    <span className="text-amber-600 cursor-pointer hover:underline" onClick={() => setActiveTab("murid")}>Semak Semua</span>
                  </div>
                </div>
              </div>

              {/* Bottom 2 Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Student Updates (5) */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 lg:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Senarai Murid Kemas Kini Terkini</h3>
                      <p className="text-xs text-slate-400 font-semibold">Rekod perkembangan harian bilik darjah pemulihan</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("murid")}
                      className="text-xs font-bold text-indigo-650 hover:text-indigo-500 hover:underline cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold">
                          <th className="py-2.5 px-3">NAMA</th>
                          <th className="py-2.5 px-2 text-center">TAHUN</th>
                          <th className="py-2.5 px-3 text-center">MATA PELAJARAN</th>
                          <th className="py-2.5 px-3 text-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 5).map((m) => (
                          <tr 
                            key={m.id}
                            onClick={() => {
                              setSelectedStudentForSesi(m);
                              setActiveTab("sesi");
                              triggerNotification("info", `Memulakan Sesi Bimbingan: ${m.name}`);
                            }}
                            className="border-b border-slate-100 hover:bg-slate-50/70 transition cursor-pointer"
                          >
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              <div className="font-bold text-slate-800">{m.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{m.id} • Dikemas kini pada {m.updatedAt}</div>
                            </td>
                            <td className="py-3 px-2 text-center font-bold text-slate-500">
                              Thn {m.year}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                m.subjects === "BM" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                m.subjects === "MT" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                "bg-purple-50 text-purple-600 border border-purple-100"
                              }`}>
                                {m.subjects}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === "Aktif" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                m.status === "Dalam Proses" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  m.status === "Aktif" ? "bg-blue-500" :
                                  m.status === "Dalam Proses" ? "bg-amber-500 animate-pulse" :
                                  "bg-emerald-500"
                                }`}></span>
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Active Intervention Program List */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-800">Program Intervensi Aktif</h3>
                        <p className="text-xs text-slate-400 font-semibold">Analisis penglibatan mengikut program khas</p>
                      </div>
                      <div className="text-xs font-bold text-amber-600 inline-flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Sesi Aktif</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {interventions.map((p) => (
                        <div 
                          key={p.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            p.subject === "BM" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {p.iconName === "Zap" && <Rocket className="w-5 h-5 text-indigo-655" />}
                            {p.iconName === "BookOpen" && <BookOpen className="w-5 h-5 text-purple-655" />}
                            {p.iconName === "Calculator" && <Calculator className="w-5 h-5 text-emerald-655" />}
                            {p.iconName === "Star" && <Sparkles className="w-5 h-5 text-amber-655" />}
                            {p.iconName === "Clock" && <CalendarCheck className="w-5 h-5 text-pink-555" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-700 truncate">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              {p.subject} • {p.frequency}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-black text-slate-800">{p.studentCount}</span>
                            <span className="text-[10px] text-slate-400 block font-bold">Murid</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 w-full text-center">
                    <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer font-bold" onClick={() => setActiveTab("murid")}>
                      + Urus Program & Kumpulan Intervensi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: STUDENT MANAGEMENT (PENGURUSAN MURID) */}
          {/* ======================================= */}
          {activeTab === "murid" && (
            <div className="space-y-6">
              {/* Header block with search & filter panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Senarai Penuh Murid Pemulihan</h3>
                    <p className="text-xs text-slate-400">Gunakan kotak carian dan panel penapis di bawah untuk menyaring data murid pemulihan.</p>
                  </div>
                  <div className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-900/30">
                    Dijumpai: {filteredStudents.length} / {students.length} Orang Murid
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search Bar input */}
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari murid mengikut nama, ID, atau catatan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-600 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-100 transition"
                    />
                  </div>

                  {/* Filter Subjek */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Subjek</span>
                    <select
                      value={subFilter}
                      onChange={(e) => setSubFilter(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-600 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-200"
                    >
                      <option value="Semua">Semua Subjek</option>
                      <option value="BM">Bahasa Melayu (BM)</option>
                      <option value="MT">Matematik (MT)</option>
                      <option value="BM+MT">Dwi-Subjek (BM+MT)</option>
                    </select>
                  </div>

                  {/* Filter Tahun */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tahun</span>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-600 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-200"
                    >
                      <option value="Semua">Semua Tahun</option>
                      <option value="2">Tahun 2</option>
                      <option value="3">Tahun 3</option>
                      <option value="4">Tahun 4</option>
                      <option value="5">Tahun 5 & 6</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Status:</span>
                  {["Semua", "Aktif", "Dalam Proses", "Tamat"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        statusFilter === status
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/30"
                          : "bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  
                  {/* Clear filter and seed fallback button */}
                  {(searchQuery || statusFilter !== "Semua" || subFilter !== "Semua" || yearFilter !== "Semua") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("Semua");
                        setSubFilter("Semua");
                        setYearFilter("Semua");
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 transition font-bold leading-none ml-auto"
                    >
                      Set Semula Semua Tapisan
                    </button>
                  )}
                </div>
              </div>

              {/* Grid table view */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Rekod Murid ({filteredStudents.length} rekod dipaparkan)</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-semibold">Tindakan:</span>
                    <button
                      onClick={handleResetToDefault}
                      className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Set Semula
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/10">
                        <th className="py-3 px-4">MURID ID / NAMA</th>
                        <th className="py-3 px-2 text-center">TAHUN</th>
                        <th className="py-3 px-3 text-center">MATA PELAJARAN</th>
                        <th className="py-3 px-4 text-center">PENGUASAAN LITERASI (%)</th>
                        <th className="py-3 px-4 text-center">PENGUASAAN NUMERASI (%)</th>
                        <th className="py-3 px-3 text-center text-indigo-400 font-extrabold uppercase">TREND PENGUASAAN</th>
                        <th className="py-3 px-3 text-center">KEHADIRAN</th>
                        <th className="py-3 px-3 text-center">STATUS</th>
                        <th className="py-3 px-4 text-right">TINDAKAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-400">
                            Tiada rekod murid yang sepadan dengan kriteria tapisan anda.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((m) => (
                          <tr 
                            key={m.id}
                            className="border-b border-slate-800 hover:bg-slate-900/40 transition"
                          >
                            {/* Student ID & Name */}
                            <td className="py-3 px-4 min-w-[280px]">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-100">{m.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  m.gender === "Lelaki" ? "bg-blue-950/50 text-blue-400 border border-blue-900/40" : "bg-pink-950/50 text-pink-400 border border-pink-900/40"
                                }`}>
                                  {m.gender || "Lelaki"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className="text-violet-400 font-mono tracking-tight">{m.id}</span>
                                  <span>•</span>
                                  <span className="text-slate-300">MyKid: {m.myKid || "Tiada"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span>Kelas: <strong className="text-slate-200">{m.classGroup || `${m.year} Pintar`}</strong></span>
                                  <span>•</span>
                                  <span>Penjaga: <strong className="text-slate-300" title={m.guardianPhone}>{m.guardianName || "Tiada"} ({m.guardianPhone || "Tiada"})</strong></span>
                                </div>
                              </div>
                            </td>
                            
                            {/* Year */}
                            <td className="py-3.5 px-2 text-center font-bold text-slate-300">
                              Thn {m.year}
                            </td>

                            {/* Subjects */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                                m.subjects === "BM" || m.subjects === "BM+MT" ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/50" : "bg-teal-950/40 text-teal-400 border border-teal-900/50"
                              }`}>
                                {m.subjects}
                              </span>
                            </td>

                            {/* BM skills progress */}
                            <td className="py-3.5 px-4 text-center min-w-[140px]">
                              {m.subjects === "MT" ? (
                                <span className="text-slate-600 text-[10px]">-</span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-indigo-400">
                                    <span>K1-K24 vokal</span>
                                    <span>{Math.round((m.skills.k1_k8 + m.skills.k9_k16 + m.skills.k17_k24) / 3)}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                    <div 
                                      className="h-full bg-indigo-500 rounded-full"
                                      style={{ width: `${Math.round((m.skills.k1_k8 + m.skills.k9_k16 + m.skills.k17_k24) / 3)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Math skills progress */}
                            <td className="py-3.5 px-4 text-center min-w-[140px]">
                              {m.subjects === "BM" ? (
                                <span className="text-slate-600 text-[10px]">-</span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-teal-400">
                                    <span>M1-M20 angka</span>
                                    <span>{Math.round((m.skills.m1_m8 + m.skills.m9_m16 + m.skills.m17_m20) / 3)}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                    <div 
                                      className="h-full bg-teal-500 rounded-full"
                                      style={{ width: `${Math.round((m.skills.m1_m8 + m.skills.m9_m16 + m.skills.m17_m20) / 3)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Sparkline Trend Column */}
                            <td className="py-3 px-3 text-center">
                              <Sparkline student={m} />
                            </td>

                            {/* Attendance */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`font-bold ${m.attendanceRate >= 90 ? "text-emerald-400" : m.attendanceRate >= 80 ? "text-amber-400" : "text-rose-400"}`}>
                                {m.attendanceRate}%
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === "Aktif" ? "bg-blue-950/40 text-blue-400 border border-blue-900/50" :
                                m.status === "Dalam Proses" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50 animate-pulse" :
                                "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                              }`}>
                                {m.status}
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="py-3.5 px-4 text-right space-x-1.5 min-w-[180px]">
                              <button
                                onClick={() => {
                                  setSelectedStudentForSesi(m);
                                  setActiveTab("sesi");
                                  triggerNotification("info", `Memulakan Sesi Bimbingan: ${m.name}`);
                                }}
                                className="inline-flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition rounded-lg p-1.5 text-xs font-bold shrink-0 cursor-pointer text-indigo-400"
                                title="Start Learning Klinik Session"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setEditingStudent(m)}
                                className="inline-flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition rounded-lg p-1.5 text-xs font-bold shrink-0 cursor-pointer text-amber-400"
                                title="Edit Student Profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(m.id, m.name)}
                                className="inline-flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition rounded-lg p-1.5 text-xs font-bold shrink-0 cursor-pointer text-rose-400"
                                title="Delete Student Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3: LIVE LEARNING KLINIK (SESI) */}
          {/* ======================================= */}
          {activeTab === "sesi" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left sidebar: student selector column */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 lg:col-span-4 flex flex-col h-[750px]">
                <h3 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span>Zon Pemilihan Sesi</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
                  Pilih rekod murid di bawah untuk mengemas kini penguasaan kemahiran literasi & numerasi secara masa-nyata.
                </p>

                {/* Filter and selector */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tapis nama murid..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                  {students
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStudentForSesi(s)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                          selectedStudentForSesi?.id === s.id
                            ? "bg-indigo-600/10 border-indigo-500/60 text-white"
                            : "bg-slate-900 border-slate-800/60 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold truncate">{s.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            ID: {s.id} • Thn {s.year} • {s.subjects}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 ${selectedStudentForSesi?.id === s.id ? "text-indigo-400" : ""}`} />
                      </button>
                    ))}
                </div>
              </div>

              {/* Right Content Panel: Live Sliders and Interaction */}
              <div className="lg:col-span-8 space-y-6">
                {!selectedStudentForSesi ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Sliders className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                    <h3 className="text-lg font-bold text-slate-300">Tiada Murid Dipilih</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Sila tentukan murid dari borang senarai kiri untuk mulakan pengemaskinian interaktif real-time.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* Student Info Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 font-bold text-[10px] px-2.5 py-1 rounded-full border border-indigo-900/30 uppercase tracking-widest mb-2">
                          Murid Terpilih
                        </div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedStudentForSesi.name}</h2>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-semibold">
                          <span>ID: {selectedStudentForSesi.id}</span>
                          <span>•</span>
                          <span>Darjah / Tahun {selectedStudentForSesi.year}</span>
                          <span>•</span>
                          <span className="text-indigo-400 uppercase font-black">{selectedStudentForSesi.subjects}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">Status:</span>
                        <select
                          value={selectedStudentForSesi.status}
                          onChange={(e) => {
                            const updated = { ...selectedStudentForSesi, status: e.target.value as any };
                            setSelectedStudentForSesi(updated);
                            setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
                            triggerNotification("success", `Status Diubah Kepada: ${e.target.value}`);
                          }}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-600 text-slate-100"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Dalam Proses">Dalam Proses</option>
                          <option value="Tamat">Tamat</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Interaction Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Section 1: Literasi Bahasa Melayu */}
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-indigo-400 uppercase border-b border-slate-800 pb-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Performa Literasi (BM)</span>
                        </h4>

                        {selectedStudentForSesi.subjects === "MT" ? (
                          <div className="text-center py-10">
                            <p className="text-xs text-slate-500 font-medium italic">
                              Murid ini berdaftar rujukan subjek Matematik sahaja.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* K1-K8 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">K1–K8 (Abjad, Bunyi & Suku Kata Terbuka V)</span>
                                <span className="text-indigo-400 font-extrabold">{selectedStudentForSesi.skills.k1_k8}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={selectedStudentForSesi.skills.k1_k8}
                                onChange={(e) => handleUpdateSkillsInSession("k1_k8", Number(e.target.value))}
                                className="w-full accent-indigo-500 cursor-pointer"
                              />
                            </div>

                            {/* K9-K16 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">K9–K16 (Suku Kata Tertutup KV + KVK)</span>
                                <span className="text-indigo-400 font-extrabold">{selectedStudentForSesi.skills.k9_k16}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={selectedStudentForSesi.skills.k9_k16}
                                onChange={(e) => handleUpdateSkillsInSession("k9_k16", Number(e.target.value))}
                                className="w-full accent-indigo-500 cursor-pointer"
                              />
                            </div>

                            {/* K17-K24 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">K17–K24 (Pembacaan Ayat & Karangan Mudah)</span>
                                <span className="text-indigo-400 font-extrabold">{selectedStudentForSesi.skills.k17_k24}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={selectedStudentForSesi.skills.k17_k24}
                                onChange={(e) => handleUpdateSkillsInSession("k17_k24", Number(e.target.value))}
                                className="w-full accent-indigo-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 2: Numerasi Matematik */}
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-teal-400 uppercase border-b border-slate-800 pb-2">
                          <Calculator className="w-4 h-4" />
                          <span>Performa Numerasi (MT)</span>
                        </h4>

                        {selectedStudentForSesi.subjects === "BM" ? (
                          <div className="text-center py-10">
                            <p className="text-xs text-slate-500 font-medium italic">
                              Murid ini berdaftar rujukan subjek Bahasa Melayu sahaja.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* M1-M8 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">M1–M8 (Pengecaman Angka & Nilai Digit)</span>
                                <span className="text-teal-400 font-extrabold">{selectedStudentForSesi.skills.m1_m8}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={selectedStudentForSesi.skills.m1_m8}
                                onChange={(e) => handleUpdateSkillsInSession("m1_m8", Number(e.target.value))}
                                className="w-full accent-teal-500 cursor-pointer"
                              />
                            </div>

                            {/* M9-M16 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">M9–M16 (Operasi Tambah, Tolak & Sifir Asas)</span>
                                <span className="text-teal-400 font-extrabold">{selectedStudentForSesi.skills.m9_m16}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={selectedStudentForSesi.skills.m9_m16}
                                onChange={(e) => handleUpdateSkillsInSession("m9_m16", Number(e.target.value))}
                                className="w-full accent-teal-500 cursor-pointer"
                              />
                            </div>

                            {/* M17-M20 */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">M17–M20 (Konsep Jam, Wang & Masa Matematik)</span>
                                <span className="text-teal-400 font-extrabold">{selectedStudentForSesi.skills.m17_m20}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={selectedStudentForSesi.skills.m17_m20}
                                onChange={(e) => handleUpdateSkillsInSession("m17_m20", Number(e.target.value))}
                                className="w-full accent-teal-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendance and Intervention group selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Attendance slider */}
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3.5">
                        <h4 className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-slate-300 uppercase border-b border-slate-800 pb-2">
                          <CalendarCheck className="w-4 h-4 text-purple-400" />
                          <span>Kadar Kehadiran Murid</span>
                        </h4>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-100">
                            <span>Kadar Kehadiran Semasa</span>
                            <span className="text-indigo-400 text-sm">{selectedStudentForSesi.attendanceRate}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            step="1"
                            value={selectedStudentForSesi.attendanceRate}
                            onChange={(e) => handleUpdateAttendanceInSession(Number(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer"
                          />
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            *Ambil perhatian: Sebarang penurunan kehadiran di bawah 85% akan melancarkan amaran automatik bagi guru pemulihan.
                          </p>
                        </div>
                      </div>

                      {/* Intervention list */}
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3.5">
                        <h4 className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-slate-300 uppercase border-b border-slate-800 pb-2">
                          <Rocket className="w-4 h-4 text-pink-400" />
                          <span>Program Intervensi Rujukan</span>
                        </h4>

                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">PROGRAM BERDAFTAR</span>
                          <select
                            value={selectedStudentForSesi.intervention}
                            onChange={(e) => {
                              const updated = { ...selectedStudentForSesi, intervention: e.target.value };
                              setSelectedStudentForSesi(updated);
                              setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
                              triggerNotification("success", `Program Ditukar Kepada: ${e.target.value}`);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-600 text-slate-100"
                          >
                            <option value="Latihan Biasa">Latihan Biasa</option>
                            <option value="Pecutan Akhir">Pecutan Akhir (BM)</option>
                            <option value="Literasi X">Literasi X (BM)</option>
                            <option value="Kira-Kira Bestari">Kira-Kira Bestari (MT)</option>
                            <option value="Bijak Sifir">Bijak Sifir (MT)</option>
                            <option value="Bacaan 15 Minit">Bacaan 15 Minit (BM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Teacher Notes box */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Catatan & Pemerhatian Rekod Guru</span>
                      <textarea
                        rows={2}
                        value={selectedStudentForSesi.notes}
                        onChange={(e) => {
                          const updated = { ...selectedStudentForSesi, notes: e.target.value };
                          setSelectedStudentForSesi(updated);
                          setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
                        }}
                        placeholder="Masukkan catatan baru mengenai penguasaan terkini murid..."
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl p-4 text-xs font-semibold text-slate-100"
                      />
                    </div>

                    {/* Detailed Checklist Accordion */}
                    <div className="border-t border-slate-800 pt-5 space-y-4">
                      <div>
                        <h4 className="text-xs font-extrabold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Senarai Semak 32 Kemahiran Pemulihan Khas (PULIH360)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                          Tandakan mana-mana sub-kemahiran bagi murid ini. Peratusan prestasi subjek di atas akan diselaraskan secara automatik demi rekod real-time yang jitu.
                        </p>
                      </div>

                      {/* We'll render checklists dynamically depending on the selected subject */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bahasa Melayu Checklist Card */}
                        {(selectedStudentForSesi.subjects === "BM" || selectedStudentForSesi.subjects === "BM+MT") && (
                          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                            <h5 className="text-[11px] font-black tracking-widest text-indigo-400 uppercase flex items-center justify-between border-b border-indigo-950 pb-2">
                              <span>LITERASI BAHASA MELAYU</span>
                              <span className="text-xs font-extrabold text-slate-300">
                                {selectedStudentForSesi.checklistsBM ? selectedStudentForSesi.checklistsBM.filter(Boolean).length : 0} / 32
                              </span>
                            </h5>
                            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                              {BM_SKILL_LABELS.map((label, idx) => (
                                <label 
                                  key={idx} 
                                  className="flex items-center gap-2.5 p-2 bg-slate-950/40 hover:bg-indigo-950/10 rounded-lg cursor-pointer border border-transparent hover:border-indigo-900/40 transition select-none"
                                >
                                  <input 
                                    type="checkbox"
                                    checked={selectedStudentForSesi.checklistsBM ? selectedStudentForSesi.checklistsBM[idx] : false}
                                    onChange={() => handleToggleBMChecklist(idx)}
                                    className="accent-indigo-500 rounded border-slate-700 bg-slate-950 w-3.5 h-3.5"
                                  />
                                  <span className={`text-[10px] font-semibold ${
                                    selectedStudentForSesi.checklistsBM?.[idx] ? "text-slate-100 font-bold" : "text-slate-400"
                                  }`}>
                                    {label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matematik Checklist Card */}
                        {(selectedStudentForSesi.subjects === "MT" || selectedStudentForSesi.subjects === "BM+MT") && (
                          <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-3">
                            <h5 className="text-[11px] font-black tracking-widest text-teal-400 uppercase flex items-center justify-between border-b border-teal-950 pb-2">
                              <span>NUMERASI MATEMATIK</span>
                              <span className="text-xs font-extrabold text-slate-300">
                                {selectedStudentForSesi.checklistsMT ? selectedStudentForSesi.checklistsMT.filter(Boolean).length : 0} / {MT_SKILL_LABELS.length}
                              </span>
                            </h5>
                            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                              {MT_SKILL_LABELS.map((label, idx) => (
                                <label 
                                  key={idx} 
                                  className="flex items-center gap-2.5 p-2 bg-slate-950/40 hover:bg-teal-950/10 rounded-lg cursor-pointer border border-transparent hover:border-teal-900/40 transition select-none"
                                >
                                  <input 
                                    type="checkbox"
                                    checked={selectedStudentForSesi.checklistsMT ? selectedStudentForSesi.checklistsMT[idx] : false}
                                    onChange={() => handleToggleMTChecklist(idx)}
                                    className="accent-teal-500 rounded border-slate-700 bg-slate-950 w-3.5 h-3.5"
                                  />
                                  <span className={`text-[10px] font-semibold ${
                                    selectedStudentForSesi.checklistsMT?.[idx] ? "text-slate-100 font-bold" : "text-slate-400"
                                  }`}>
                                    {label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 4: GOOGLE SHEETS CONNECTOR (INTEGRATION) */}
          {/* ======================================= */}
          {activeTab === "sheets" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <h2 className="text-xl font-extrabold text-white">Sambungan Google Sheets PULIH360</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Sambungkan pangkalan data murid secara langsung dari kolum Google Sheet anda.</p>
                  </div>
                </div>

                {/* Status card */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  connectionStatus === "sheets" 
                    ? "bg-emerald-950/20 border-emerald-800/80" 
                    : connectionStatus === "csv"
                    ? "bg-blue-950/20 border-blue-800/80"
                    : "bg-slate-900 border-slate-800"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${
                      connectionStatus === "sheets" 
                        ? "bg-emerald-500 animate-pulse" 
                        : connectionStatus === "csv"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}></div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Status Sambungan semasa:{" "}
                        <span className="uppercase text-amber-400">
                          {connectionStatus === "sheets" ? "Google Sheets Live" : connectionStatus === "csv" ? "Memori (CSV)" : "Zon Tempatan / Demo"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {connectionStatus === "sheets" 
                          ? `Berjaya disegerakkan dengan ID: ${sheetId}` 
                          : connectionStatus === "csv"
                          ? "Data dimuat dari fail CSV tempatan. Tiada hubunga awalan."
                          : "Menggunakan kit dataset demo (Cohort 48 Murid). ID rujukan ditetapkan kepada Google Sheets anda."}
                      </p>
                    </div>
                  </div>

                  {connectionStatus !== "local" && (
                    <button
                      onClick={handleResetToDefault}
                      className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-800 transition cursor-pointer"
                    >
                      Putuskan Fail
                    </button>
                  )}
                </div>

                {/* Step Instructions */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4 text-xs leading-relaxed">
                  <h4 className="font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span>Panduan Integrasi Google Sheet PULIH360</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300 font-medium">
                    <li>
                      Pastikan Google Sheets anda mempunyai format struktur lajur berikut mengikut turutan:
                      <div className="mt-1.5 px-3 py-2 bg-slate-950 rounded-lg text-[10px] text-indigo-400 overflow-x-auto whitespace-nowrap scrollbar-thin border border-slate-850">
                        A: ID · B: Nama · C: Tahun (2-6) · D: Subjek (BM/MT/BM+MT) · E: Status (Aktif/Tamat) · F: K1-K8 · G: K9-K16 · H: K17-K24 · I: M1-M8 · J: M9-M16 · K: M17-M20 · L: Kehadiran(%) · M: Intervensi · N: Catatan
                      </div>
                    </li>
                    <li>
                      Di fail Google Sheets anda, klik butang <strong>"Share" (Kongsi)</strong> di bahagian kanan atas.
                    </li>
                    <li>
                      Tukar bahagian General Access (Akses Umum) kepada <strong className="text-emerald-400">"Sesiapa sahaja yang mempunyai pautan boleh melihat" (Anyone with the link can view)</strong>. Ini adalah wajib supaya sistem boleh mengekstrak data.
                    </li>
                    <li>
                      Salin <strong>ID Google Sheet</strong> dari alamat URL atau terus tampalkan URL ke dalam kotak input di bawah.
                    </li>
                  </ol>
                </div>

                {/* Form to Sync */}
                <div className="space-y-3.5 pt-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    ID Google Sheet atau Alamat Pautan URL
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Masukkan ID Spreadsheet Google..."
                      value={sheetId}
                      onChange={(e) => {
                        // Extract spreadsheet ID if user pastes full URL
                        const val = e.target.value.trim();
                        if (val.includes("/d/")) {
                          const parts = val.split("/d/");
                          if (parts[1]) {
                            const subparts = parts[1].split("/");
                            setSheetId(subparts[0]);
                          }
                        } else {
                          setSheetId(val);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleFetchSheet}
                        disabled={isSyncing}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Menyegerak...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>Pindahkan Data</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isAutoSyncEnabled;
                          setIsAutoSyncEnabled(nextState);
                          localStorage.setItem("pulih360_auto_sync", String(nextState));
                          localStorage.setItem("pulih360_sheet_id", sheetId);
                          triggerNotification(
                            "success",
                            nextState
                              ? "Segerak Automatik diaktifkan & ID Google Sheet disimpan ke memori tempatan!"
                              : "Segerak Automatik dinyahaktifkan!"
                          );
                        }}
                        className={`font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer border ${
                          isAutoSyncEnabled
                            ? "bg-indigo-950 border-indigo-700/80 text-indigo-200 hover:bg-indigo-900/60 shadow-indigo-900/10"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Database className={`w-4 h-4 ${isAutoSyncEnabled ? "text-indigo-400" : "text-slate-500"}`} />
                        <span>
                          {isAutoSyncEnabled ? "Segerak Automatik: AKTIF" : "Aktifkan Segerak Automatik"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Response Feedback alerts */}
                {syncError && (
                  <div className="bg-rose-950/20 border border-rose-800/60 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <pre className="text-xs text-rose-300 font-semibold leading-relaxed whitespace-pre-wrap font-sans">
                      {syncError}
                    </pre>
                  </div>
                )}

                {syncSuccess && (
                  <div className="bg-emerald-950/20 border border-emerald-800/60 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-300 font-semibold leading-normal">
                      {syncSuccess}
                    </p>
                  </div>
                )}
              </div>

              {/* Real File Upload & Manual CSV Input option (Fully conforming to Drag-and-drop / select requirement) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Pilihan 2: Import Fail Manual (CSV / Excel)</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Ingin menggunakan data rujukan tanpa berkongsi pautan Google Sheet? Anda boleh memuat naik fail csv eksport dari jadul Google Sheets anda di sini.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* File Upload drag area */}
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-900/10 hover:border-slate-700 transition">
                    <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-slate-300">Pilih Fail Anda</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 text-center">Format fail yang disokong: .csv, .txt</span>
                    
                    <input
                      type="file"
                      id="csv-file-picker"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => document.getElementById("csv-file-picker")?.click()}
                      className="mt-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Pilih dari Komputer
                    </button>
                  </div>

                  {/* Manual Paste area */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Tampal data CSV / Teks di sini</span>
                    <textarea
                      rows={4}
                      value={rawCSVInput}
                      onChange={(e) => setRawCSVInput(e.target.value)}
                      placeholder="Contoh: M01,Ahmad Hariz,4,BM,Aktif,85,70,50,0,0,0,92,Pecutan Akhir,Suka membaca..."
                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl p-3 text-xs font-medium text-slate-200"
                    />
                    <button
                      onClick={() => handleImportCSVData(rawCSVInput)}
                      disabled={!rawCSVInput.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer"
                    >
                      Proses Teks CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 5: ANALYTICS REPORTS (LAPORAN) */}
          {/* ======================================= */}
          {activeTab === "laporan" && (
            <div className="space-y-6">
              {/* Report summary overview block */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5 mb-5 animate-pulse">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">Analitik Eksekutif PULIH360</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Analisis hasil dan kemajuan cohort sekolah bagi sesi Akademik 2026.</p>
                  </div>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cetak Laporan Lengkap</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block text-purple-400">Kohort Literasi BM</span>
                    <span className="text-2xl font-black text-slate-100">{stats.bmOnly + stats.both} <span className="text-xs font-normal text-slate-400">Pelajar</span></span>
                    <div className="text-xs text-slate-400 mt-2 font-medium">
                      Purata Penguncian Asas: <strong className="text-white">{Math.round((stats.avgK1 + stats.avgK2 + stats.avgK3) / 3)}%</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block text-teal-400">Kohort Numerasi MT</span>
                    <span className="text-2xl font-black text-slate-100">{stats.mtOnly + stats.both} <span className="text-xs font-normal text-slate-400">Pelajar</span></span>
                    <div className="text-xs text-slate-400 mt-2 font-medium">
                      Purata Operasi Asas: <strong className="text-white">{Math.round((stats.avgM1 + stats.avgM2 + stats.avgM3) / 3)}%</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block text-indigo-400">Graduasi & Pelepasan</span>
                    <span className="text-2xl font-black text-emerald-400">+{stats.tamat} <span className="text-xs font-normal text-slate-400">Selesai</span></span>
                    <div className="text-xs text-slate-400 mt-2 font-medium">
                      Kadar Pelepasan Kohort: <strong className="text-white">{Math.round((stats.tamat / stats.total) * 100)}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* SECTION: REPORT GENERATION & PDF EXPORT MODULE (PULIH360) */}
              {/* ======================================================= */}
              <div id="pdf-report-generator-section" className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md transition hover:border-slate-700/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                      <Printer className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-100 uppercase tracking-wide">Penjana & Eksport Laporan Profil Murid (PDF)</h3>
                      <p className="text-xs text-slate-400 font-semibold">Jana pelaporan berkelayakan rasmi sedia cetak lengkap dengan pemetaan konstruk, ulasan guru, & persetujuan ibu bapa.</p>
                    </div>
                  </div>
                  <span className="bg-indigo-950 border border-indigo-850 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shrink-0">
                    Sistem Bersepadu A4
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  {/* Left Form (Colspan 7 in xl, else full) */}
                  <div className="xl:col-span-7 bg-slate-900/30 p-5 rounded-xl border border-slate-850 space-y-4">
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Konfigurasi Maklumat Laporan</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Select Student */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          Pilih Murid Rujukan
                        </label>
                        <select
                          value={selectedReportStudentId || (students[0]?.id || "")}
                          onChange={(e) => {
                            setSelectedReportStudentId(e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200 cursor-pointer"
                        >
                          <option value="">-- Pilih Murid --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.classGroup})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Format Selector */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          Jenis Format Laporan
                        </label>
                        <select
                          value={reportFormatType}
                          onChange={(e) => {
                            setReportFormatType(e.target.value as "parent" | "school");
                          }}
                          className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200 cursor-pointer"
                        >
                          <option value="parent">Format Ibu Bapa & Penjaga (Rasmi)</option>
                          <option value="school">Format Pentadbir Sekolah / PPD</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Teacher's Name */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          Nama Guru Pemulihan Khas
                        </label>
                        <input
                          type="text"
                          value={reportTeacherName}
                          onChange={(e) => setReportTeacherName(e.target.value)}
                          placeholder="Masukkan nama penuh guru..."
                          className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200"
                        />
                      </div>

                      {/* Guardian or Admin Name depending on type */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          {reportFormatType === "parent" ? "Nama Ibu Bapa / Penjaga" : "Nama Pengesah (Guru Besar)"}
                        </label>
                        <input
                          type="text"
                          value={reportFormatType === "parent" ? reportGuardianName : reportPrincipalName}
                          onChange={(e) => {
                            if (reportFormatType === "parent") {
                              setReportGuardianName(e.target.value);
                            } else {
                              setReportPrincipalName(e.target.value);
                            }
                          }}
                          placeholder="Masukkan nama..."
                          className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Teacher's custom notes textarea */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                        Saranan & Ulasan Khas Kemajuan Guru
                      </label>
                      <textarea
                        rows={3}
                        value={reportRemarks}
                        onChange={(e) => setReportRemarks(e.target.value)}
                        placeholder="Ulasan kemajuan atau strategi intervensi lanjutan ditaip di sini..."
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl p-3 text-xs font-medium text-slate-200 leading-relaxed"
                      />
                    </div>

                    {/* Generate trigger action button */}
                    <button
                      disabled={!selectedReportStudentId && students.length === 0}
                      onClick={() => {
                        // Ensure a student is selected
                        if (!selectedReportStudentId && students.length > 0) {
                          setSelectedReportStudentId(students[0].id);
                        }
                        setIsReportPreviewOpen(true);
                        triggerNotification("success", "Laporan PDF sedia untuk dipratinjau & dicetak!");
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/15"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Sedia Pratinjau & Cetak Laporan (PDF)</span>
                    </button>
                  </div>

                  {/* Right interactive document layout mockup preview (Colspan 5) */}
                  <div className="xl:col-span-5 bg-slate-900/50 p-5 rounded-xl border border-slate-850 flex flex-col justify-between">
                    {(() => {
                      const student = students.find(s => s.id === selectedReportStudentId) || students[0];
                      if (!student) {
                        return (
                          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
                            <Printer className="w-10 h-10 text-slate-600 animate-pulse" />
                            <p className="text-xs font-bold text-slate-200">Tiada Murid Tersedia</p>
                            <p className="text-[10px] leading-relaxed">Sila daftar atau import dataset murid terlebih dahulu.</p>
                          </div>
                        );
                      }

                      const achievedBm = student.checklistsBM ? student.checklistsBM.filter(Boolean).length : 0;
                      const bmPercent = Math.round((achievedBm / 32) * 100);
                      const achievedMt = student.checklistsMT ? student.checklistsMT.filter(Boolean).length : 0;
                      const mtPercent = Math.round((achievedMt / 20) * 100);

                      return (
                        <div className="space-y-4 text-left flex-1 flex flex-col justify-between font-sans">
                          <div>
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                              <span className="text-[10px] font-black tracking-widest text-[#6366F1] uppercase">Draf Penjanaan PDF</span>
                              <span className="bg-emerald-950 border border-emerald-850 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Sedia</span>
                            </div>

                            <div className="border border-slate-850 bg-white p-4 rounded-xl shadow-lg space-y-2.5">
                              {/* Crest mockup */}
                              <div className="text-center space-y-0.5 border-b border-double border-slate-300 pb-2">
                                <h5 className="text-[9px] font-black text-slate-800 uppercase tracking-wide">SEKOLAH KEBANGSAAN JALAN TAMAN</h5>
                                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">REKOD PROFIL INDIVIDU PEMULIHAN KHAS</p>
                              </div>

                              <div className="space-y-1 text-[8px] text-slate-700">
                                <div className="flex justify-between font-medium">
                                  <span>ID / DARJAH:</span>
                                  <strong className="text-slate-900">{student.id} / Darjah {student.year}</strong>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>NAMA MURID:</span>
                                  <strong className="text-slate-900 truncate max-w-[120px] uppercase">{student.name}</strong>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>GURU PENILAI:</span>
                                  <strong className="text-slate-900 truncate max-w-[120px]" title={reportTeacherName}>{reportTeacherName}</strong>
                                </div>
                              </div>

                              {/* Target scales progress mock */}
                              <div className="space-y-1.5 border-t border-slate-100 pt-2 text-[8px]">
                                {(student.subjects === "BM" || student.subjects === "BM+MT") && (
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-slate-500 font-bold">
                                      <span>LITERASI BM:</span>
                                      <span className="text-indigo-600 font-black">{achievedBm}/32 ({bmPercent}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-indigo-600 h-full" style={{ width: `${bmPercent}%` }}></div>
                                    </div>
                                  </div>
                                )}

                                {(student.subjects === "MT" || student.subjects === "BM+MT") && (
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-slate-500 font-bold">
                                      <span>NUMERASI MT:</span>
                                      <span className="text-teal-600 font-black">{achievedMt}/20 ({mtPercent}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-teal-600 h-full" style={{ width: `${mtPercent}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="border-t border-slate-105 pt-2">
                                <span className="text-[7px] font-black block text-slate-400 uppercase tracking-wider">Ulasan Terkini Guru:</span>
                                <p className="text-[7px] text-slate-500 font-semibold italic leading-normal line-clamp-2 mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100">
                                  "{reportRemarks || 'Sila pilih murid rujukan di sebelah untuk membina rumusan automatik secara dinamik.'}"
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] text-indigo-400 font-bold text-center leading-relaxed mt-2 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
                            PULIH360 auto-detects progress to pre-generate remarks based on {student.gender === "Lelaki" ? "his" : "her"} masteries & attendance.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Grid: Unjuran Chart & Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Area Chart: Progression Trends */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Kadar Unjuran Pelepasan & Kehadiran Sesi</h3>
                    <p className="text-xs text-slate-400">Unjuran kadar kejayaan intervensi dari Januari hingga Jun 2026</p>
                  </div>

                  <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendance}>
                        <defs>
                          <linearGradient id="colorBm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorMt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} />
                        <Area type="monotone" dataKey="bm" stroke="#4f46e5" fillOpacity={1} fill="url(#colorBm)" name="Suku Pelepasan BM" />
                        <Area type="monotone" dataKey="mt" stroke="#14b8a6" fillOpacity={1} fill="url(#colorMt)" name="Suku Pelepasan MT" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart: Holistic Skill Profile */}
                {(() => {
                  // Find selected student or default to the first
                  const activeReportStudent = students.find(s => s.id === selectedReportStudentId) || students[0];

                  if (!activeReportStudent) {
                    return (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center justify-center text-slate-400 h-96 text-xs">
                        Tiada data pelajar ditemui.
                      </div>
                    );
                  }

                  // Compute active student's construct subgroup progress
                  const sBM1 = activeReportStudent.checklistsBM ? Math.round((activeReportStudent.checklistsBM.slice(0, 8).filter(Boolean).length / 8) * 100) : 0;
                  const sBM2 = activeReportStudent.checklistsBM ? Math.round((activeReportStudent.checklistsBM.slice(8, 16).filter(Boolean).length / 8) * 100) : 0;
                  const sBM3 = activeReportStudent.checklistsBM ? Math.round((activeReportStudent.checklistsBM.slice(16, 24).filter(Boolean).length / 8) * 100) : 0;
                  const sBM4 = activeReportStudent.checklistsBM ? Math.round((activeReportStudent.checklistsBM.slice(24, 32).filter(Boolean).length / 8) * 100) : 0;

                  const sMT1 = activeReportStudent.checklistsMT ? Math.round((activeReportStudent.checklistsMT.slice(0, 6).filter(Boolean).length / 6) * 100) : 0;
                  const sMT2 = activeReportStudent.checklistsMT ? Math.round((activeReportStudent.checklistsMT.slice(6, 14).filter(Boolean).length / 8) * 100) : 0;
                  const sMT3 = activeReportStudent.checklistsMT ? Math.round((activeReportStudent.checklistsMT.slice(14, 20).filter(Boolean).length / 6) * 100) : 0;

                  // Compute cohort averages
                  let totalBM1 = 0, totalBM2 = 0, totalBM3 = 0, totalBM4 = 0;
                  let totalMT1 = 0, totalMT2 = 0, totalMT3 = 0;
                  let bmCount = 0;
                  let mtCount = 0;

                  students.forEach(student => {
                    const isBM = student.subjects === "BM" || student.subjects === "BM+MT";
                    const isMT = student.subjects === "MT" || student.subjects === "BM+MT";

                    if (isBM) {
                      bmCount++;
                      totalBM1 += student.checklistsBM ? Math.round((student.checklistsBM.slice(0, 8).filter(Boolean).length / 8) * 100) : 0;
                      totalBM2 += student.checklistsBM ? Math.round((student.checklistsBM.slice(8, 16).filter(Boolean).length / 8) * 100) : 0;
                      totalBM3 += student.checklistsBM ? Math.round((student.checklistsBM.slice(16, 24).filter(Boolean).length / 8) * 100) : 0;
                      totalBM4 += student.checklistsBM ? Math.round((student.checklistsBM.slice(24, 32).filter(Boolean).length / 8) * 100) : 0;
                    }

                    if (isMT) {
                      mtCount++;
                      totalMT1 += student.checklistsMT ? Math.round((student.checklistsMT.slice(0, 6).filter(Boolean).length / 6) * 100) : 0;
                      totalMT2 += student.checklistsMT ? Math.round((student.checklistsMT.slice(6, 14).filter(Boolean).length / 8) * 100) : 0;
                      totalMT3 += student.checklistsMT ? Math.round((student.checklistsMT.slice(14, 20).filter(Boolean).length / 6) * 100) : 0;
                    }
                  });

                  const avgBM1 = bmCount ? Math.round(totalBM1 / bmCount) : 0;
                  const avgBM2 = bmCount ? Math.round(totalBM2 / bmCount) : 0;
                  const avgBM3 = bmCount ? Math.round(totalBM3 / bmCount) : 0;
                  const avgBM4 = bmCount ? Math.round(totalBM4 / bmCount) : 0;

                  const avgMT1 = mtCount ? Math.round(totalMT1 / mtCount) : 0;
                  const avgMT2 = mtCount ? Math.round(totalMT2 / mtCount) : 0;
                  const avgMT3 = mtCount ? Math.round(totalMT3 / mtCount) : 0;

                  // Define Radar Data
                  const radarData = [
                    { name: "BM1: Pra-membaca", "Murid": sBM1, "Purata Kohort": avgBM1 },
                    { name: "BM2: Kumpulan Suku", "Murid": sBM2, "Purata Kohort": avgBM2 },
                    { name: "BM3: Perkataan & Ayat", "Murid": sBM3, "Purata Kohort": avgBM3 },
                    { name: "BM4: Kefahaman", "Murid": sBM4, "Purata Kohort": avgBM4 },
                    { name: "MT1: Nombor Bulat", "Murid": sMT1, "Purata Kohort": avgMT1 },
                    { name: "MT2: Tambah & Tolak", "Murid": sMT2, "Purata Kohort": avgMT2 },
                    { name: "MT3: Aplikasi Pintar", "Murid": sMT3, "Purata Kohort": avgMT3 }
                  ];

                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-100">Profil Kemahiran Holistik</h3>
                          <p className="text-xs text-slate-400">Sila pilih murid rujukan untuk menganalisis perbandingan profil secara holistik</p>
                        </div>
                        <select
                          value={selectedReportStudentId || activeReportStudent.id}
                          onChange={(e) => setSelectedReportStudentId(e.target.value)}
                          className="bg-slate-900 text-slate-100 text-xs font-bold border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition cursor-pointer max-w-full sm:max-w-[200px]"
                        >
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.classGroup})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="h-80 w-full flex items-center justify-center pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#1e293b" />
                            <PolarAngleAxis 
                              dataKey="name" 
                              tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: "bold" }} 
                            />
                            <PolarRadiusAxis 
                              angle={30} 
                              domain={[0, 100]} 
                              tick={{ fill: "#64748b", fontSize: 8 }}
                              axisLine={false}
                            />
                            <Radar 
                              name={`Murid: ${activeReportStudent.name}`} 
                              dataKey="Murid" 
                              stroke="#6366f1" 
                              fill="#6366f1" 
                              fillOpacity={0.4} 
                            />
                            <Radar 
                              name="Purata Kohort" 
                              dataKey="Purata Kohort" 
                              stroke="#14b8a6" 
                              fill="#14b8a6" 
                              fillOpacity={0.15} 
                              strokeDasharray="4 4"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "#0f172a", 
                                border: "1px solid #334155", 
                                borderRadius: "12px",
                                fontSize: "11px",
                                color: "#f8fafc"
                              }} 
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconSize={10}
                              wrapperStyle={{ fontSize: "10px", fontWeight: "bold", color: "#94a3b8" }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 6: LATIHAN KEHADIRAN (DAILY MANUAL REGISTER) */}
          {/* ======================================= */}
          {activeTab === "kehadiran" && (
            <div className="space-y-6">
              {/* Header Title Banner */}
              <div className="bg-slate-950 border border-slate-805 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <CalendarCheck className="w-40 h-40 text-indigo-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                      <CalendarCheck className="w-6 h-6 text-indigo-500" />
                      <span>Modul Pengurusan & Analisis Kehadiran PULIH360</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-semibold max-w-2xl leading-relaxed">
                      Sistem automasi kehadiran pintar bersepadu. Akses kalendar interaktif untuk memeriksa keaktifan murid pemulihan, pantau murid berisiko cicir, dan jejaki ringkasan bulanan secara masa-nyata.
                    </p>
                  </div>
                  {/* Selected Active Date Display & Picker */}
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 p-3 rounded-2xl shrink-0 shadow-lg">
                    <div className="text-left font-sans">
                      <span className="text-[9px] uppercase font-black text-slate-500 block tracking-wider">Tarikh Pemilihan</span>
                      <span className="text-xs font-extrabold text-indigo-400">{attendanceDate ? formatMalayDate(attendanceDate) : "Sila Pilih"}</span>
                    </div>
                    <input 
                      type="date" 
                      value={attendanceDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setAttendanceDate(val);
                          const [y, m] = val.split("-").map(Number);
                          setCalendarMonth(m - 1);
                          setCalendarYear(y);
                        }
                      }}
                      className="bg-white text-slate-800 border-none outline-none font-bold text-xs p-1.5 focus:ring-2 focus:ring-indigo-600 rounded-lg cursor-pointer shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Main Workspace Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT WORKSPACE: Calendar & Student Register (Colspan 8) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Calendar Widget Card */}
                  <div className="bg-slate-950 border border-slate-805 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">
                          Kalendar Kehadiran Pintar
                        </h3>
                      </div>
                      
                      {/* Month Switcher Controls */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            if (calendarMonth === 0) {
                              setCalendarMonth(11);
                              setCalendarYear(prev => prev - 1);
                            } else {
                              setCalendarMonth(prev => prev - 1);
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 p-1.5 rounded-lg border border-slate-800 text-[10px] uppercase font-black transition cursor-pointer"
                        >
                          Sebelumnya
                        </button>
                        <span className="text-xs font-black text-white px-2 tracking-wider">
                          {MALAY_MONTH_NAMES[calendarMonth]} {calendarYear}
                        </span>
                        <button
                          onClick={() => {
                            if (calendarMonth === 11) {
                              setCalendarMonth(0);
                              setCalendarYear(prev => prev + 1);
                            } else {
                              setCalendarMonth(prev => prev + 1);
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 p-1.5 rounded-lg border border-slate-800 text-[10px] uppercase font-black transition cursor-pointer"
                        >
                          Seterusnya
                        </button>
                      </div>
                    </div>

                    {/* Calendar Grid Container */}
                    <div className="grid grid-cols-7 gap-2">
                      {/* Weekday Labels */}
                      {MALAY_WEEKDAYS.map(day => (
                        <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-wider py-1.5 bg-slate-900/40 rounded-lg">
                          {day}
                        </div>
                      ))}

                      {/* Day cells dynamically rendering rate and custom color maps */}
                      {(() => {
                        const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                        const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
                        const cells = [];
                        for (let i = 0; i < firstDayIndex; i++) {
                          cells.push(null);
                        }
                        for (let d = 1; d <= totalDays; d++) {
                          cells.push(d);
                        }

                        return cells.map((dayNum, idx) => {
                          if (dayNum === null) {
                            return <div key={`empty-${idx}`} className="h-12 bg-slate-900/10 rounded-xl opacity-20"></div>;
                          }

                          const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                          const isDaySelected = attendanceDate === dateString;
                          const dailyStats = getDailyAttendanceRate(dateString);

                          let colorClass = "bg-slate-900/50 text-slate-500 border border-transparent";
                          let tooltipText = "Tiada rekod kehadiran";

                          if (dailyStats !== null) {
                            tooltipText = `${dailyStats.present} Hadir, ${dailyStats.absent} Ponteng, ${dailyStats.mc} Cuti Sakit`;
                            if (dailyStats.rate === 100) {
                              colorClass = "bg-emerald-600 hover:bg-emerald-550 text-white font-black border border-emerald-400";
                            } else if (dailyStats.rate >= 85) {
                              colorClass = "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold hover:bg-emerald-500/25";
                            } else if (dailyStats.rate >= 70) {
                              colorClass = "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/25";
                            } else {
                              colorClass = "bg-rose-600 hover:bg-rose-550 text-white font-black border border-rose-400";
                            }
                          }

                          const isActualToday = new Date().toISOString().split("T")[0] === dateString;

                          return (
                            <button
                              key={`day-${dayNum}`}
                              onClick={() => setAttendanceDate(dateString)}
                              className={`h-12 rounded-xl flex flex-col justify-between p-1.5 transition relative group cell-id-${dayNum} ${colorClass} ${
                                isDaySelected ? "ring-2 ring-indigo-500 scale-[1.03] shadow-md z-10" : "hover:scale-[1.01]"
                              }`}
                            >
                              <span className="text-[11px] font-black leading-none">{dayNum}</span>
                              
                              {isActualToday && (
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                              )}

                              {dailyStats !== null ? (
                                <span className="text-[7.5px] font-bold block ml-auto leading-none tracking-tighter uppercase opacity-90">
                                  {dailyStats.rate}%
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-medium block ml-auto leading-none opacity-40">-</span>
                              )}

                              {/* Hover tooltip */}
                              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-950 text-[9.5px] font-semibold text-slate-100 rounded-lg p-2.5 shadow-2xl opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50 border border-slate-800 flex flex-col gap-0.5">
                                <span className="font-bold underline text-indigo-450">{formatMalayDate(dateString)}</span>
                                <span>{tooltipText}</span>
                                {dailyStats !== null && <span>Kadar Kehadiran: {dailyStats.rate}%</span>}
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Legend block */}
                    <div className="flex flex-wrap items-center justify-between text-[9px] text-slate-500 font-extrabold gap-3 pt-2 bg-slate-900/20 p-3 rounded-xl border border-slate-900/60">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="uppercase tracking-wider">Petunjuk:</span>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-600 block border border-emerald-400"></span>
                          <span>100% Penuh</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500/15 border border-emerald-500/30 block"></span>
                          <span>Tinggi (≥85%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-amber-500/15 border border-amber-500/30 block"></span>
                          <span>Sederhana (70-84%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-rose-600 border border-rose-400 block"></span>
                          <span>Berisiko (&lt;70%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-850 block"></span>
                          <span>Kosong/Tiada Sesi</span>
                        </div>
                      </div>
                      <span>* Klik pada tarikh untuk membuka & tonton data kehadiran hari tersebut.</span>
                    </div>
                  </div>

                  {/* Student Attendance Marker Card */}
                  <div className="bg-slate-950 border border-slate-805 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                          <span>Borang Penanda Kehadiran Murid</span>
                          <span className="bg-indigo-50 text-indigo-700 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {formatMalayDate(attendanceDate)}
                          </span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                          Tandakan kehadiran pelajar rujukan di bawah. Status MC tidak mengurangkan kadar pelepasan pelajar tersebut (excused).
                        </p>
                      </div>

                      {/* Fast-Marking Action Buttons Panel */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkAllAttendance("Hadir")}
                          className="bg-emerald-600/10 hover:bg-emerald-650 hover:text-white text-emerald-400 font-black text-[10px] tracking-wider uppercase px-3 py-2 rounded-xl transition border border-emerald-500/20 shadow-sm cursor-pointer"
                        >
                          ✓ Semua Hadir
                        </button>
                        <button
                          onClick={() => handleMarkAllAttendance("Tidak Hadir")}
                          className="bg-rose-600/10 hover:bg-rose-650 hover:text-white text-rose-400 font-black text-[10px] tracking-wider uppercase px-3 py-2 rounded-xl transition border border-rose-500/20 shadow-sm cursor-pointer"
                        >
                          ✗ Semua Tidak Hadir
                        </button>
                      </div>
                    </div>

                    {/* Table-based roster entry widget */}
                    <div className="overflow-x-auto border border-slate-900 rounded-xl max-h-[450px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900/60 border-b border-slate-900 text-[9px] uppercase font-black text-slate-400 tracking-wider">
                            <th className="p-4">Murid / No Rekod</th>
                            <th className="p-4">Daftar Aliran</th>
                            <th className="p-4 text-center">Kehadiran Semasa</th>
                            <th className="p-4 text-center w-[300px]">Tanda Status bagi {attendanceDate}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-xs text-slate-350 font-semibold">
                          {students.map((s) => {
                            const historyItem = s.attendanceHistory?.find(h => h.date === attendanceDate);
                            const isPresent = historyItem?.status === "Hadir";
                            const isAbsent = historyItem?.status === "Tidak Hadir";
                            const isMC = historyItem?.status === "MC";

                            return (
                              <tr key={s.id} className="hover:bg-slate-900/20 transition">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-black text-slate-200">{s.name}</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                      ID: {s.id} · Tahun {s.year} ({s.classGroup})
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                                    s.subjects === "BM" ? "bg-indigo-950/60 text-indigo-400 border border-indigo-900/40" :
                                    s.subjects === "MT" ? "bg-teal-950/60 text-teal-400 border border-teal-900/40" :
                                    "bg-amber-950/60 text-amber-400 border border-amber-900/40"
                                  }`}>
                                    {s.subjects}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`text-[11px] font-black ${
                                    s.attendanceRate >= 90 ? "text-emerald-400" :
                                    s.attendanceRate >= 75 ? "text-amber-400" :
                                    "text-rose-500"
                                  }`}>
                                    {s.attendanceRate}% Hadir
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Present button */}
                                    <button
                                      onClick={() => handleToggleAttendance(s.id, "Hadir")}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition uppercase cursor-pointer flex items-center gap-1 border ${
                                        isPresent 
                                          ? "bg-emerald-600 text-white border-emerald-400 shadow-md" 
                                          : "bg-slate-900 text-slate-450 border-slate-800 hover:bg-slate-800"
                                      }`}
                                    >
                                      <span>✓ HADIR</span>
                                    </button>
                                    
                                    {/* Absent button */}
                                    <button
                                      onClick={() => handleToggleAttendance(s.id, "Tidak Hadir")}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition uppercase cursor-pointer flex items-center gap-1 border ${
                                        isAbsent 
                                          ? "bg-rose-600 text-white border-rose-400 shadow-md" 
                                          : "bg-slate-900 text-slate-450 border-slate-800 hover:bg-slate-800"
                                      }`}
                                    >
                                      <span>✗ PONTENG</span>
                                    </button>

                                    {/* MC/Sakit button */}
                                    <button
                                      onClick={() => handleToggleAttendance(s.id, "MC")}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition uppercase cursor-pointer flex items-center gap-1 border ${
                                        isMC 
                                          ? "bg-amber-600 text-white border-amber-400 shadow-md" 
                                          : "bg-slate-900 text-slate-450 border-slate-800 hover:bg-slate-800"
                                      }`}
                                    >
                                      <span>⛨ MC (SAKIT)</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT WORKSPACE: Daily Summary Panel, Monthly analysis & At-Risk list (Colspan 4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Daily Summary Metrics Block (Panel Kanan) */}
                  {(() => {
                    const dayHistories = students.map(s => s.attendanceHistory?.find(h => h.date === attendanceDate)).filter(Boolean);
                    const presentCount = dayHistories.filter(h => h.status === "Hadir").length;
                    const absentCount = dayHistories.filter(h => h.status === "Tidak Hadir").length;
                    const mcCount = dayHistories.filter(h => h.status === "MC").length;
                    
                    const totalTracked = presentCount + absentCount;
                    const dailyRate = totalTracked > 0 ? Math.round((presentCount / totalTracked) * 100) : 100;

                    return (
                      <div className="bg-slate-950 border border-slate-805 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                            <Sliders className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">
                              Ringkasan Hari Dipilih
                            </h3>
                          </div>
                          
                          <div className="text-center py-4 bg-slate-900/40 rounded-2xl border border-slate-900/80">
                            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Kadar Kehadiran Sesi</span>
                            <span className="text-4xl font-extrabold text-white tracking-tight">{dailyRate}%</span>
                            <span className="text-[10px] text-indigo-400 font-bold block mt-1.5 uppercase">
                              Tarikh: {formatMalayDate(attendanceDate)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-emerald-450 block tracking-wider">Hadir</span>
                              <span className="text-base font-black text-white">{presentCount}</span>
                            </div>
                            
                            <div className="bg-rose-950/20 border border-rose-900/30 p-2 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-rose-455 block tracking-wider">Ponteng</span>
                              <span className="text-base font-black text-white">{absentCount}</span>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-900/30 p-2 rounded-xl">
                              <span className="text-[8px] uppercase font-black text-amber-450 block tracking-wider">MC SAKIT</span>
                              <span className="text-base font-black text-white">{mcCount}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            triggerNotification("success", `Rekod kehadiran bagi ${formatMalayDate(attendanceDate)} berjaya disahkan dan disimpan di sistem pemulihan!`);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-505 text-white font-extrabold text-xs py-3 rounded-xl transition duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Rekod Kehadiran</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Murid Berisiko Panel (<75%) */}
                  <div className="bg-slate-950 border border-slate-805 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">
                        Murid Berisiko Tinggi (&lt;75%)
                      </h3>
                    </div>

                    <p className="text-[9.5px] text-slate-450 leading-relaxed font-semibold">
                      Senarai murid dengan kadar kehadiran keseluruhan di bawah 75%. Klik nama murid bagi melihat profil interaktif & diagnostik mereka dengan pantas.
                    </p>

                    {(() => {
                      const atRisk = students
                        .filter(s => s.attendanceRate < 75)
                        .sort((a, b) => a.attendanceRate - b.attendanceRate);

                      if (atRisk.length === 0) {
                        return (
                          <div className="py-6 text-center text-slate-500 font-bold bg-slate-900/20 rounded-xl border border-slate-900 border-dashed text-xs">
                            Cemerlang! Tiada murid dikesan berisiko ponteng di bawah 75%.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                          {atRisk.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedStudentForSesi(s);
                                setActiveTab("sesi");
                                triggerNotification("info", `Memulakan Diagnostik Pemulihan: ${s.name}`);
                              }}
                              className="w-full text-left bg-slate-900 hover:bg-slate-850 border border-slate-850 p-2.5 rounded-xl transition flex items-center justify-between cursor-pointer group"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400">{s.name}</h4>
                                <p className="text-[8.5px] text-slate-500 font-semibold mt-0.5">
                                  ID: {s.id} · Kelas {s.classGroup}
                                </p>
                              </div>
                              <span className="bg-rose-950/60 text-rose-450 font-black text-[9.5px] px-2 py-1 rounded-lg border border-rose-900/40 ml-2 shrink-0">
                                {s.attendanceRate}% Hadir
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Monthly Summary Horizontal Bars (Bar Ringkasan Bulanan) */}
                  <div className="bg-slate-950 border border-slate-805 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5 justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                          Analisis Kehadiran Bulanan
                        </h3>
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-indigo-400 bg-indigo-950/45 border border-indigo-900/40 px-1.5 py-0.5 rounded shrink-0">
                        {MALAY_MONTH_NAMES[calendarMonth]}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-slate-450 leading-relaxed font-semibold">
                      Carta bar horizontal menunjukkan ulasan peratusan kehadiran aktif pelajar sepanjang bulan semasa bagi perbandingan prestasi harian.
                    </p>

                    {/* Horizontal Bar Chart Container */}
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1.5">
                      {(() => {
                        const monthPrefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`;
                        return students.map(s => {
                          const logs = s.attendanceHistory?.filter(h => h.date.startsWith(monthPrefix)) || [];
                          const relevant = logs.filter(h => h.status !== "MC");
                          const totalDays = relevant.length;
                          const presentDays = relevant.filter(h => h.status === "Hadir").length;
                          const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : s.attendanceRate;

                          return (
                            <div key={`month-chart-${s.id}`} className="space-y-1">
                              <div className="flex items-center justify-between text-[9.5px] font-bold">
                                <span className="text-slate-200 truncate max-w-[170px]">{s.name}</span>
                                <span className={`${rate >= 90 ? "text-emerald-400" : rate >= 75 ? "text-amber-400" : "text-rose-400"}`}>
                                  {rate}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850/60">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    rate >= 90 ? "bg-emerald-500" : rate >= 75 ? "bg-amber-500" : "bg-rose-500"
                                  }`}
                                  style={{ width: `${rate}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 7: BAHASA MELAYU (K1-K32 GRIDS) */}
          {/* ======================================= */}
          {activeTab === "bm" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <BookOpen className="text-indigo-600 w-5 h-5" />
                  <span>Sistem Diagnostik 32 Konstruk Literasi BM (PULIH360)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                  Pilih murid rujukan dari panel sebelah kiri bagi mengurus, memantau, dan mentaksir penguasaan 32 konstruk Kemahiran Pemulihan Khas (KP1 hingga KP32) secara jitu.
                </p>
              </div>

              {(() => {
                const bmStudents = students.filter(s => s.subjects === "BM" || s.subjects === "BM+MT");
                const currentActiveId = selectedBmStudentId || bmStudents[0]?.id;
                const activeBmStudent = bmStudents.find(s => s.id === currentActiveId) || bmStudents[0];

                if (!activeBmStudent) {
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-bold">
                      Tiada murid pemulihan Bahasa Melayu ditemui. Sila tambah murid baru.
                    </div>
                  );
                }

                const completedCount = activeBmStudent.checklistsBM ? activeBmStudent.checklistsBM.filter(Boolean).length : 0;
                const progressPercent = Math.round((completedCount / 32) * 100);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar: Student list select */}
                    <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                      <h3 className="text-[10px] font-black text-slate-450 tracking-wider uppercase border-b border-slate-900 pb-2">Senarai Murid BM ({bmStudents.length})</h3>
                      <div className="space-y-1.5">
                        {bmStudents.map(student => (
                          <div
                            key={student.id}
                            onClick={() => setSelectedBmStudentId(student.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${
                              student.id === activeBmStudent.id
                                ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                                : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="font-bold text-xs truncate">{student.name}</span>
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                              <span>Tahun {student.year} ({student.classGroup})</span>
                              <span className="text-indigo-600 font-extrabold">{student.checklistsBM?.filter(Boolean).length || 0} / 32 KP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Grid: 32 Construction Cards */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* Active profile review header card */}
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Calon Literasi Pintar</span>
                            <h3 className="text-lg font-black text-slate-800 mt-2">{activeBmStudent.name}</h3>
                            <p className="text-xs text-slate-450 font-bold">No. MyKid: {activeBmStudent.myKid} · Tahun {activeBmStudent.year} {activeBmStudent.classGroup}</p>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-2xl font-black text-indigo-700">{progressPercent}%</span>
                            <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">{completedCount} daripada 32 Konstruk Terpilih</span>
                          </div>
                        </div>

                        {/* Progress Bar indicator */}
                        <div className="mt-4 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Explicit 3x10 blocks of K1 to K32 list item cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {BM_SKILL_LABELS.map((label, idx) => {
                          const isMastered = activeBmStudent.checklistsBM ? activeBmStudent.checklistsBM[idx] : false;

                          return (
                            <div 
                              key={idx}
                              onClick={() => handleToggleStudentBMChecklist(activeBmStudent.id, idx)}
                              className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-2.5 select-none transition duration-200 ${
                                isMastered 
                                  ? "bg-emerald-50/10 border-emerald-300 shadow-sm" 
                                  : "bg-white border-slate-100 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isMastered ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-550"
                                }`}>
                                  KP {idx + 1}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isMastered}
                                  onChange={() => {}} // Handle inside click event
                                  className="accent-emerald-600 rounded bg-slate-900 border-slate-800"
                                />
                              </div>

                              <span className={`text-[10px] font-extrabold leading-tight ${isMastered ? "text-slate-800" : "text-slate-500"}`}>
                                {label}
                              </span>

                              <span className={`text-[8px] font-black tracking-wider uppercase ${isMastered ? "text-emerald-600" : "text-rose-500"}`}>
                                {isMastered ? "● Menguasai" : "○ Belum Menguasai"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 8: MATEMATIK (M1-M20 GRIDS) */}
          {/* ======================================= */}
          {activeTab === "mt" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Calculator className="text-teal-600 w-5 h-5" />
                  <span>Sistem Diagnostik {MT_SKILL_LABELS.length} Konstruk Numerasi Matematik (PULIH360)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                  Pilih murid rujukan dari panel sebelah kiri bagi mengurus, mentaksir, dan merekod kemajuan {MT_SKILL_LABELS.length} sub-kemahiran bagi numerasi asas pemulihan khas secara langsung.
                </p>
              </div>

              {(() => {
                const mtStudents = students.filter(s => s.subjects === "MT" || s.subjects === "BM+MT");
                const currentActiveId = selectedMtStudentId || mtStudents[0]?.id;
                const activeMtStudent = mtStudents.find(s => s.id === currentActiveId) || mtStudents[0];

                if (!activeMtStudent) {
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-bold">
                      Tiada murid pemulihan Matematik ditemui. Sila tambah murid rujukan baru.
                    </div>
                  );
                }

                const completedCount = activeMtStudent.checklistsMT ? activeMtStudent.checklistsMT.filter(Boolean).length : 0;
                const progressPercent = Math.round((completedCount / MT_SKILL_LABELS.length) * 100);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar: Student list select */}
                    <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                      <h3 className="text-[10px] font-black text-slate-450 tracking-wider uppercase border-b border-slate-900 pb-2">Senarai Murid MT ({mtStudents.length})</h3>
                      <div className="space-y-1.5">
                        {mtStudents.map(student => (
                          <div
                            key={student.id}
                            onClick={() => setSelectedMtStudentId(student.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${
                              student.id === activeMtStudent.id
                                ? "bg-teal-50 border-teal-200 text-teal-900"
                                : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="font-bold text-xs truncate">{student.name}</span>
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                              <span>Tahun {student.year} ({student.classGroup})</span>
                              <span className="text-teal-600 font-extrabold">{student.checklistsMT?.filter(Boolean).length || 0} / {MT_SKILL_LABELS.length} KP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Grid: {MT_SKILL_LABELS.length} Construction Cards */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* Active profile review header card */}
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Calon Numerasi Pintar</span>
                            <h3 className="text-lg font-black text-slate-800 mt-2">{activeMtStudent.name}</h3>
                            <p className="text-xs text-slate-450 font-bold">No. MyKid: {activeMtStudent.myKid} · Tahun {activeMtStudent.year} {activeMtStudent.classGroup}</p>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-2xl font-black text-teal-700">{progressPercent}%</span>
                            <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">{completedCount} daripada {MT_SKILL_LABELS.length} Konstruk Terpilih</span>
                          </div>
                        </div>

                        {/* Progress Bar indicator */}
                        <div className="mt-4 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="bg-teal-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Bar Chart Visualization comparing M1-M20 / KP1-KP9 */}
                      {(() => {
                        const chartData = MT_SKILL_LABELS.map((label, idx) => {
                          const isMastered = activeMtStudent.checklistsMT ? activeMtStudent.checklistsMT[idx] : false;
                          const shortLabel = label.split(":")[0]?.trim() || `KP ${idx + 1}`;
                          const fullName = label.split(":")[1]?.trim() || label;
                          return {
                            name: shortLabel,
                            fullName: fullName,
                            value: isMastered ? 100 : 0,
                            statusLabel: isMastered ? "Menguasai" : "Belum Menguasai"
                          };
                        });

                        return (
                          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                              <div>
                                <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                                  <span>Carta Penguasaan Konstruk Numerasi Matematik</span>
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                                  Analisis visual perbandingan status penguasaan 20 konstruk bagi murid rujukan ({activeMtStudent.name}).
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded bg-teal-600 block border border-teal-400"></span>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Menguasai (100%)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded bg-rose-600 block border border-rose-400"></span>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Belum Menguasai (0%)</span>
                                </div>
                              </div>
                            </div>

                            <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
                                    axisLine={{ stroke: '#334155' }}
                                    tickLine={{ stroke: '#334155' }}
                                  />
                                  <YAxis 
                                    domain={[0, 100]} 
                                    ticks={[0, 100]}
                                    tickFormatter={(val) => val === 100 ? "LULUS" : "BELUM"}
                                    tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}
                                    axisLine={{ stroke: '#334155' }}
                                    tickLine={{ stroke: '#334155' }}
                                  />
                                  <Tooltip
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl space-y-1.5 text-left z-50">
                                            <p className="text-[10px] font-black text-teal-400 tracking-wider uppercase">{data.name}</p>
                                            <p className="text-xs font-bold text-slate-100 max-w-xs">{data.fullName}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                              <span className={`w-2 h-2 rounded-full ${data.value === 100 ? "bg-teal-400 animate-pulse" : "bg-rose-500"}`}></span>
                                              <span className={`text-[10px] font-black uppercase ${data.value === 100 ? "text-teal-400" : "text-rose-450"}`}>
                                                {data.statusLabel}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar 
                                    dataKey="value" 
                                    radius={[4, 4, 0, 0]}
                                  >
                                    {chartData.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.value === 100 ? "#0d9488" : "#e11d48"} 
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Explicit M1 to M32 list item cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {MT_SKILL_LABELS.map((label, idx) => {
                          const isMastered = activeMtStudent.checklistsMT ? activeMtStudent.checklistsMT[idx] : false;

                          return (
                            <div 
                              key={idx}
                              onClick={() => handleToggleStudentMTChecklist(activeMtStudent.id, idx)}
                              className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-2.5 select-none transition duration-200 ${
                                isMastered 
                                  ? "bg-teal-50/10 border-teal-300 shadow-sm" 
                                  : "bg-white border-slate-100 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isMastered ? "bg-teal-600 text-white" : "bg-slate-150 text-slate-650"
                                }`}>
                                  {label.split(":")[0]?.trim() || `KP ${idx + 1}`}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isMastered}
                                  onChange={() => {}} // Handled inside click event
                                  className="accent-teal-600 rounded bg-slate-900 border-slate-800"
                                />
                              </div>

                              <span className={`text-[10px] font-extrabold leading-tight ${isMastered ? "text-slate-850" : "text-slate-600"}`}>
                                {label.split(":")[1]?.trim() || label}
                              </span>

                              <span className={`text-[8px] font-black tracking-wider uppercase ${isMastered ? "text-teal-600" : "text-rose-500"}`}>
                                {isMastered ? "● Menguasai" : "○ Belum Menguasai"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 9: PROGRAM INTERVENSI */}
          {/* ======================================= */}
          {activeTab === "intervensi" && (
            <div className="space-y-6">
              {/* Introduction header */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                      <Rocket className="text-indigo-600 w-5 h-5" />
                      <span>Sistem Pengurusan Program Intervensi Pemulihan</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                      Urus pendaftaran program pecutan pembelajaran, rancang kekerapan kelas latihan pemulihan khas, dan asingkan murid mengikut zon penguasaan kemahiran literasi & numerasi.
                    </p>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-indigo-650 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                    {interventions.length} Program Aktif Sedia Ada
                  </span>
                </div>
              </div>

              {/* Dynamic Form and Program lists side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to add custom program */}
                <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider border-b border-slate-900 pb-2">Daftar Kumpulan Baru</h3>
                  
                  <form onSubmit={handleAddInterventionGroup} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nama Program / Kumpulan</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Bacaan Pantas Bestari"
                        value={newInterventionName}
                        onChange={(e) => setNewInterventionName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Subjek Sasaran</label>
                      <select 
                        value={newInterventionSubject}
                        onChange={(e) => setNewInterventionSubject(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                      >
                        <option value="BM">Bahasa Melayu (BM)</option>
                        <option value="MT">Matematik (MT)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kekerapan & Amalan</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: 15 Minit Sebelum Sesi Mula"
                        value={newInterventionFrequency}
                        onChange={(e) => setNewInterventionFrequency(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-sm mt-2"
                    >
                      + Daftar Program Intervensi
                    </button>
                  </form>
                </div>

                {/* List of current intervention groups */}
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">Pilih Kumpulan untuk Semak Murid</h3>
                    <select
                      value={selectedInterventionGroup}
                      onChange={(e) => setSelectedInterventionGroup(e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1 text-slate-700"
                    >
                      <option value="Semua">Tunjukkan Semua</option>
                      {interventions.map(i => (
                        <option key={i.id} value={i.name}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grid layout of active cards with custom details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {interventions.map(program => {
                      const participants = students.filter(s => s.intervention === program.name);

                      return (
                        <div key={program.id} className="p-4 rounded-xl border border-slate-905 bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${program.bgColor}`}>
                              {program.subject}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold">{program.frequency}</span>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-black text-slate-800 leading-tight">{program.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Terdapat {participants.length} murid menyertai kumpulan pecutan ini.</p>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-900">
                            {participants.length === 0 ? (
                              <span className="text-[9px] text-slate-400 italic">Tiada murid ditempatkan sementara ini.</span>
                            ) : (
                              participants.slice(0, 3).map(p => (
                                <span key={p.id} className="text-[8px] font-bold bg-white border border-slate-200 text-slate-650 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                  {p.name}
                                </span>
                              ))
                            )}
                            {participants.length > 3 && (
                              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1 rounded">+{participants.length - 3} lagi</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 10: DOKUMEN & PANDUAN */}
          {/* ======================================= */}
          {activeTab === "dokumen" && (
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Folder className="text-amber-500 w-5 h-5" />
                  <span>Gerbang Dokumen & Automasi Integriti Google</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                  Dapatkan templat rujukan Google Sheets rasmi, pelajari kod Google Apps Script untuk menjana ID rujukan secara automatik, dan integrasikan Google Forms ke dalam sistem rujukan sekolah bagi mengurangkan beban tugasan guru.
                </p>
              </div>

              {/* Three detailed column cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Apps Script card */}
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-1.5 text-indigo-650">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                      <span>1. Google Apps Script Roster Sync Trigger</span>
                    </h3>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  
  // Auto-generate ID (PK2026-00x) if column 2 is modified and row > 1
  if (sheet.getName() === "Murid" && range.getColumn() === 2 && range.getRow() > 1 && !sheet.getRange(range.getRow(), 1).getValue()) {
    var lastRow = sheet.getLastRow();
    var idCell = sheet.getRange(range.getRow(), 1);
    var nextId = "PK2026-" + String(lastRow - 1).padStart(3, '0');
    idCell.setValue(nextId);
  }
}`);
                        triggerNotification("success", "Skrip disalin ke dalam papan keratan komputer anda.");
                      }}
                      className="bg-slate-900 hover:bg-slate-205 border border-slate-800 text-slate-200 text-[10px] uppercase font-black px-3 py-1.5 rounded transition cursor-pointer"
                    >
                      Salin Skrip
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Letakkan kod pencetus ini di dalam editor Google Apps Script lembaran anda demi menjana nombor siri pelajar pemulihan khas <code className="bg-slate-900 text-indigo-400 font-bold px-1 py-0.5 rounded">PK2026-###</code> secara dinamik setiap kali butiran nama murid baru ditaip di dalam mana-mana pelayar.
                  </p>

                  <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto border border-slate-850">
{`function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  
  // Auto-generate ID format PK2026-001
  if (sheet.getName() === "Murid" && range.getColumn() === 2 && range.getRow() > 1 && !sheet.getRange(range.getRow(), 1).getValue()) {
    var lastRow = sheet.getLastRow();
    var idCell = sheet.getRange(range.getRow(), 1);
    var nextId = "PK2026-" + String(lastRow - 1).padStart(3, '0');
    idCell.setValue(nextId);
  }
}`}
                  </pre>
                </div>

                {/* Forms and Looker Integration Card */}
                <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest text-teal-650 border-b border-slate-900 pb-3">
                    2. Reka Bentuk Ekosistem PULIH360
                  </h3>

                  <div className="space-y-4.5">
                    {/* Google Forms linkage */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        <span>Google Forms Integration</span>
                      </h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                        Sediakan borang Google Forms pendaftaran yang terus dipautkan dengan Kolum rujukan Google Sheet pangkalan data di dalam tab Integrasi demi pendaftaran automatik yang paling pantas di dalam bilik darjah.
                      </p>
                    </div>

                    {/* Google Sheets Column order */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Struktur Kolum Murid Sheets</span>
                      </h4>
                      <p className="text-[10px] text-slate-455 font-mono leading-normal bg-slate-900 p-2 rounded border border-slate-850 text-slate-400">
                        A: No (ID) <br />
                        B: Nama Murid <br />
                        C: No MyKid <br />
                        D: Tahun / Darjah <br />
                        E: Nama Kelas <br />
                        F: Jantina <br />
                        G: Subjek Pemulihan <br />
                        H: Tarikh Masuk <br />
                        I: Status Sesi
                      </p>
                    </div>

                    {/* Looker Studio linking */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded">STUDIO</span>
                        <span>Looker Studio Linkage</span>
                      </h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                        Gunakan data Google Sheet dipasang untuk menjana laporan visual dashboard sekolah berprestij yang boleh didokumenkan kepada PPD, Guru Besar, serta Ibu bapa dengan pemutakhiran data secara automatik.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copyright Branding footer */}
          <footer className="mt-12 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-400 font-semibold">
            <div>
              <span className="text-slate-100 font-bold">PULIH360 Platform</span> · Sistem Pintar Analisis Pemulihan Khas v3.6
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Guru Rujukan Semasa: <strong className="text-indigo-400 cursor-pointer">Cikgu Mohd Khairulrizal Bin Mohd Razi</strong></span>
            </div>
          </footer>
        </main>
      </div>

      {/* ======================================= */}
      {/* MODAL 1: ADD STUDENT (DAFTAR MURID) */}
      {/* ======================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Daftar Murid Baru PULIH365</span>
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nama Penuh Murid (Sila gunakan huruf besar)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MUHAMMAD IRFAN BIN NAZRI"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* MyKid */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">No. MyID / MyKid</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 170512-08-4123"
                    value={newStudent.myKid}
                    onChange={(e) => setNewStudent({ ...newStudent, myKid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Gender Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Jantina</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Year Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tahun / Darjah</label>
                  <select
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({ ...newStudent, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value={2}>Tahun 2</option>
                    <option value={3}>Tahun 3</option>
                    <option value={4}>Tahun 4</option>
                    <option value={5}>Tahun 5 & 6</option>
                  </select>
                </div>

                {/* Class Group Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nama Kelas</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3 Pintar / 4 Bestari"
                    value={newStudent.classGroup}
                    onChange={(e) => setNewStudent({ ...newStudent, classGroup: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Joined Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tarikh Masuk Sesi</label>
                  <input
                    type="date"
                    required
                    value={newStudent.joinedDate}
                    onChange={(e) => setNewStudent({ ...newStudent, joinedDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Subject Option */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Zon Kemahiran (Subjek)</label>
                  <select
                    value={newStudent.subjects}
                    onChange={(e) => setNewStudent({ ...newStudent, subjects: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value="BM">Bahasa Melayu (BM)</option>
                    <option value="MT">Matematik (MT)</option>
                    <option value="BM+MT">BM + Matematik (Kedua-duanya)</option>
                  </select>
                </div>

                {/* Guardian Name */}
                <div className="space-y-1.5 col-span-2">
                  <div className="border-t border-slate-800/80 my-2 pt-3"></div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nama Ibu Bapa / Penjaga</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ABU BAKAR BIN OSMAN"
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Guardian Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">No. Telefon Penjaga</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: +6012-345 6789"
                    value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Intervention Program */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Program Intervensi Laluan</label>
                  <select
                    value={newStudent.intervention}
                    onChange={(e) => setNewStudent({ ...newStudent, intervention: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value="Pecutan Akhir">Pecutan Akhir</option>
                    <option value="Literasi X">Literasi X</option>
                    <option value="Kira-Kira Bestari">Kira-Kira Bestari</option>
                    <option value="Bijak Sifir">Bijak Sifir</option>
                    <option value="Bacaan 15 Minit">Bacaan 15 Minit</option>
                  </select>
                </div>
              </div>

              {/* Attendance and notes */}
              <div className="space-y-1.5 mt-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Catatan Guru Awalan</label>
                <textarea
                  rows={2}
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                  placeholder="Kategori lemah suku kata kv, bersungguh-sungguh belajar..."
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl p-3.5 text-xs font-semibold text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Daftar Profil Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL 2: EDIT STUDENT PROFILE */}
      {/* ======================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2 border-b border-slate-800 pb-3">
              <Edit2 className="w-4 h-4 text-amber-500" />
              <span>Kemaskini Maklumat Profil: {editingStudent.name}</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nama Penuh Murid</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* MyKid */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">No. MyID / MyKid</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.myKid || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, myKid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Gender Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Jantina</label>
                  <select
                    value={editingStudent.gender || "Lelaki"}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Year Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tahun Pengajian</label>
                  <select
                    value={editingStudent.year}
                    onChange={(e) => setEditingStudent({ ...editingStudent, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value={2}>Tahun 2</option>
                    <option value={3}>Tahun 3</option>
                    <option value={4}>Tahun 4</option>
                    <option value={5}>Tahun 5 & 6</option>
                  </select>
                </div>

                {/* Class Group Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nama Kelas</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.classGroup || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classGroup: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Joined Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tarikh Masuk Sesi</label>
                  <input
                    type="date"
                    required
                    value={editingStudent.joinedDate || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, joinedDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Subject Option */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Darjah Kemahiran (Subjek)</label>
                  <select
                    value={editingStudent.subjects}
                    onChange={(e) => setEditingStudent({ ...editingStudent, subjects: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value="BM">Bahasa Melayu (BM)</option>
                    <option value="MT">Matematik (MT)</option>
                    <option value="BM+MT">BM + Matematik (BM+MT)</option>
                  </select>
                </div>

                {/* Guardian Name */}
                <div className="space-y-1.5 col-span-2">
                  <div className="border-t border-slate-800/80 my-2 pt-3"></div>
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nama Ibu Bapa / Penjaga</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.guardianName || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Guardian Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">No. Telefon Penjaga</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.guardianPhone || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>

                {/* Intervention Program */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Program Intervensi</label>
                  <select
                    value={editingStudent.intervention}
                    onChange={(e) => setEditingStudent({ ...editingStudent, intervention: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  >
                    <option value="Pecutan Akhir">Pecutan Akhir</option>
                    <option value="Literasi X">Literasi X</option>
                    <option value="Kira-Kira Bestari">Kira-Kira Bestari</option>
                    <option value="Bijak Sifir">Bijak Sifir</option>
                    <option value="Bacaan 15 Minit">Bacaan 15 Minit</option>
                  </select>
                </div>

                {/* Attendance Rate */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Kadar Kehadiran Berdaftar (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingStudent.attendanceRate}
                    onChange={(e) => setEditingStudent({ ...editingStudent, attendanceRate: Math.min(100, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-100"
                  />
                </div>
              </div>

              {/* Attendance and notes */}
              <div className="space-y-1.5 mt-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Catatan Guru & Pemerhatian Sesi</label>
                <textarea
                  rows={2}
                  value={editingStudent.notes}
                  onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-600 rounded-xl p-3 text-xs font-semibold text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Simpan Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PRINT-ONLY OFFICIAL A4 LAPORAN MULTI-CONSTRUCT (PULIH360) */}
      {/* ========================================================= */}
      {(() => {
        const student = students.find(s => s.id === selectedReportStudentId) || students[0];
        if (!student) return null;

        const achievedBm = student.checklistsBM ? student.checklistsBM.filter(Boolean).length : 0;
        const bmPercent = Math.round((achievedBm / 32) * 100);
        const achievedMt = student.checklistsMT ? student.checklistsMT.filter(Boolean).length : 0;
        const mtPercent = Math.round((achievedMt / 20) * 100);

        // Subgroups BM
        const sBM1 = student.checklistsBM ? student.checklistsBM.slice(0, 8).filter(Boolean).length : 0;
        const sBM2 = student.checklistsBM ? student.checklistsBM.slice(8, 16).filter(Boolean).length : 0;
        const sBM3 = student.checklistsBM ? student.checklistsBM.slice(16, 24).filter(Boolean).length : 0;
        const sBM4 = student.checklistsBM ? student.checklistsBM.slice(24, 32).filter(Boolean).length : 0;

        // Subgroups MT
        const sMT1 = student.checklistsMT ? student.checklistsMT.slice(0, 6).filter(Boolean).length : 0;
        const sMT2 = student.checklistsMT ? student.checklistsMT.slice(6, 14).filter(Boolean).length : 0;
        const sMT3 = student.checklistsMT ? student.checklistsMT.slice(14, 20).filter(Boolean).length : 0;

        // Attendance rating
        let attendanceRating = "LEMAH";
        let attendanceColor = "text-rose-605";
        if (student.attendanceRate >= 95) {
          attendanceRating = "SANGAT CEMERLANG";
          attendanceColor = "text-emerald-605";
        } else if (student.attendanceRate >= 85) {
          attendanceRating = "SATISFAKTORI / BAIK";
          attendanceColor = "text-green-605";
        } else if (student.attendanceRate >= 75) {
          attendanceRating = "SEDERHANA";
          attendanceColor = "text-amber-505";
        }

        return (
          <div className="hidden print:block bg-white text-black p-10 font-sans min-h-[297mm] w-[210mm] mx-auto text-xs leading-relaxed">
            {/* Crest & Official Mini-Banner Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex items-center gap-4 text-left">
                {/* Visual Placeholder for School Emblem */}
                <div className="w-14 h-14 border-2 border-slate-900 bg-slate-50 flex items-center justify-center p-1 rounded-md">
                  <span className="text-[9px] font-black leading-tight text-center text-slate-800">SK JALAN TAMAN</span>
                </div>
                <div className="text-left">
                  <h1 className="text-xs font-black tracking-wide text-slate-900">JABATAN PENDIDIKAN NEGERI / SEKOLAH KEBANGSAAN JALAN TAMAN</h1>
                  <p className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">UNIT PEMULIHAN KHAS (PULIH360) • SESI AKADEMIK 2026/2027</p>
                  <p className="text-[8px] text-slate-500 italic mt-0.5">"Pendidikan Saksama, Potensi Maksima"</p>
                </div>
              </div>
              <div className="text-right border-l pl-4 border-slate-300">
                <span className="bg-slate-100 border border-slate-300 text-slate-800 font-black px-2 py-0.5 text-[8px] rounded block uppercase tracking-wider mb-1">DOKUMEN RASMI</span>
                <span className="text-[8px] font-bold text-slate-500 block">ID: {student.id}</span>
                <span className="text-[8px] font-bold text-slate-400 block">SULIT / TERHAD</span>
              </div>
            </div>

            {/* Document Title Header */}
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider underline decoration-2 underline-offset-4">
                {reportFormatType === "parent" ? "LAPORAN KEMAJUAN DAN PENGUASAAN INDIVIDU MURID PEMULIHAN" : "LAPORAN PROFIL KOMPETENSI PORTFOLIO PEMULIHAN KHAS"}
              </h2>
              <p className="text-[9px] font-extrabold text-slate-600">
                {reportFormatType === "parent" 
                  ? "Disediakan khusus untuk rujukan Ibu Bapa, Penjaga dan bimbingan di rumah" 
                  : "Dokumen Penilaian Prestasi Utama untuk tindakan Pentadbir Sekolah & Pejabat Pendidikan Daerah (PPD)"}
              </p>
            </div>

            {/* Section 1: Demographics Grid */}
            <div className="border border-slate-400 rounded-lg p-4 mb-5 bg-slate-50/50">
              <h3 className="text-[9px] font-black text-slate-900 uppercase border-b border-slate-400 pb-1 mb-3 tracking-widest">
                <span>01. MAKLUMAT PERIBADI MURID & PENJAGA</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-[9px] leading-relaxed">
                <div className="flex justify-between border-b border-slate-200 pb-1 flex-row">
                  <span className="font-bold text-slate-500">Nama Penuh Murid:</span>
                  <span className="font-black text-slate-900 uppercase text-right ml-2 grow truncate">{student.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500">No. MyID / MyKid:</span>
                  <span className="font-bold text-slate-900">{student.myKid || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500">Tahun / Darjah Kelas:</span>
                  <span className="font-bold text-slate-900">Darjah {student.year} ({student.classGroup})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500">Jantina Murid:</span>
                  <span className="font-bold text-slate-900">{student.gender}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500">Tarikh Kemasukan:</span>
                  <span className="font-bold text-slate-900">{student.joinedDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-500">Mata Pelajaran Khas:</span>
                  <span className="font-black text-slate-900">{student.subjects === "BM+MT" ? "BM & Matematik (Dwipandu)" : student.subjects}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 flex-row">
                  <span className="font-semibold text-slate-500">
                    {reportFormatType === "parent" ? "Nama Penjaga (Ibu Bapa):" : "Program Rujukan Intervensi:"}
                  </span>
                  <span className="font-bold text-slate-900 text-right ml-2 grow truncate">
                    {reportFormatType === "parent" ? reportGuardianName : (student.intervention || "Prosedur Intervensi")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-500">
                    {reportFormatType === "parent" ? "No. Telefon Penjaga:" : "Status Kes Semasa:"}
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {reportFormatType === "parent" ? (student.guardianPhone || "N/A") : (student.status === "Tamat" ? "SELESAI (Graduasi)" : "DALAM BIMBINGAN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Progress Metrics with visual bars */}
            <div className="border border-slate-400 rounded-lg p-4 mb-5">
              <h3 className="text-[9px] font-black text-slate-900 uppercase border-b border-slate-400 pb-1 mb-3 tracking-widest">
                <span>02. ANALISIS PENGUASAAN SUB-PENGUASAAN & KONSTRUK</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-6 my-2">
                {(student.subjects === "BM" || student.subjects === "BM+MT") && (
                  <div className="space-y-2.5 border-r border-slate-200 pr-4">
                    <div className="flex justify-between items-baseline text-[9px]">
                      <span className="font-black text-slate-800">LITERASI BAHASA MELAYU</span>
                      <span className="font-black text-indigo-700">{achievedBm} / 32 Konstruk ({bmPercent}%)</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full border border-slate-300 overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${bmPercent}%` }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px]">
                        <span className="block text-slate-505 font-bold">K1-K8 (Pra-membaca):</span>
                        <strong className="text-slate-800 font-black">{sBM1} / 8 Dikuasai</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px]">
                        <span className="block text-slate-505 font-bold">K9-K16 (Suku Kata):</span>
                        <strong className="text-slate-800 font-black">{sBM2} / 8 Dikuasai</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px]">
                        <span className="block text-slate-505 font-bold">K17-K24 (Perkataan):</span>
                        <strong className="text-slate-800 font-black">{sBM3} / 8 Dikuasai</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px]">
                        <span className="block text-slate-505 font-bold">K25-K32 (Kefahaman):</span>
                        <strong className="text-slate-800 font-black">{sBM4} / 8 Dikuasai</strong>
                      </div>
                    </div>
                  </div>
                )}

                {(student.subjects === "MT" || student.subjects === "BM+MT") && (
                  <div className="space-y-2.5 pl-2">
                    <div className="flex justify-between items-baseline text-[9px]">
                      <span className="font-black text-slate-800">NUMERASI MATEMATIK</span>
                      <span className="font-black text-teal-700">{achievedMt} / 20 Konstruk ({mtPercent}%)</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full border border-slate-300 overflow-hidden">
                      <div className="bg-teal-600 h-full" style={{ width: `${mtPercent}%` }}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px] text-center">
                        <span className="block text-slate-505 font-bold">M1-M8 (Pra/Nombor)</span>
                        <strong className="text-slate-800 font-black">{sMT1} / 6 Dikuasai</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px] text-center">
                        <span className="block text-slate-505 font-bold">M9-M16 (Membilang)</span>
                        <strong className="text-slate-800 font-black">{sMT2} / 8 Dikuasai</strong>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[8px] text-center">
                        <span className="block text-slate-505 font-bold">M17-M20 (Aplikasi)</span>
                        <strong className="text-slate-800 font-black">{sMT3} / 6 Dikuasai</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Attendance Analytics with status text */}
            <div className="border border-slate-400 rounded-lg p-4 mb-5">
              <h3 className="text-[9px] font-black text-slate-900 uppercase border-b border-slate-400 pb-1 mb-2.5 tracking-widest">
                <span>03. REKOD KEUJUDAN & KADAR KEHADIRAN AKTIF</span>
              </h3>
              <div className="flex items-center justify-between text-[9px] bg-slate-50 p-3 rounded-lg border border-slate-200 leading-normal">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 font-semibold block">Kadar Kehadiran Purata:</span>
                    <strong className="text-base font-black text-slate-900">{student.attendanceRate}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Klasifikasi Kehadiran:</span>
                    <strong className={`font-black tracking-wide text-[9px] uppercase ${attendanceColor}`}>{attendanceRating}</strong>
                  </div>
                </div>
                <div className="max-w-md text-[8px] text-slate-500 italic leading-relaxed pl-4 border-l border-slate-200">
                  {student.attendanceRate >= 90
                    ? "* Hubungan kehadiran cemerlang ini memaksimumkan peluang kejayaan intervensi serta kelancaran pemahaman konsep harian."
                    : "* Perlu dorongan peningkatan kehadiran ke sekolah secara tekal bagi mengurangkan keciciran subtopik."}
                </div>
              </div>
            </div>

            {/* Section 4: Teacher Special Recommendation (Ulasan) */}
            <div className="border border-slate-400 rounded-lg p-4 mb-6">
              <h3 className="text-[9px] font-black text-slate-900 uppercase border-b border-slate-400 pb-1 mb-2 tracking-widest">
                <span>04. ULASAN KHAS & SYOR TINDAKAN SUSULAN GURU PEMULIHAN</span>
              </h3>
              <p className="text-[9px] text-slate-805 leading-relaxed text-left bg-slate-50/75 p-3 rounded-md border border-dashed border-slate-300 min-h-[60px] font-medium whitespace-pre-wrap italic">
                "{reportRemarks || 'Murid menunjukkan kemajuan yang sangat memberangsangkan. Kerjasama bimbingan yang konsisten dari pihak ibu bapa amat dialu-alukan.'}"
              </p>
            </div>

            {/* Section 5: Signature Sign-offs */}
            <div className="pt-6 border-t border-dashed border-slate-400 mt-8">
              <p className="text-center text-[8px] text-slate-400 font-semibold tracking-tight uppercase mb-6">
                Laporan ini dijana lengkap secara digital melalui Sistem Pengurusan Bersepadu PULIH360.
              </p>
              
              <div className="grid grid-cols-3 gap-6 text-center text-[9px] leading-normal">
                {/* Teacher's signature */}
                <div className="space-y-10">
                  <div className="h-8 border-b border-slate-400 w-3/4 mx-auto"></div>
                  <div>
                    <strong className="block text-slate-900 uppercase underline decoration-slate-400 font-black">{reportTeacherName}</strong>
                    <span className="text-slate-505 font-semibold block text-[8px] uppercase">Guru Pemulihan Khas</span>
                    <span className="text-slate-400 text-[7px] block">Unit Khas Pemulihan, SKJT</span>
                  </div>
                </div>

                {/* Parent's signature */}
                <div className="space-y-10">
                  <div className="h-8 border-b border-slate-400 w-3/4 mx-auto"></div>
                  <div>
                    <strong className="block text-slate-900 uppercase underline decoration-slate-400 font-black">
                      {reportFormatType === "parent" ? reportGuardianName : "PENTADBIR GURU BESAR"}
                    </strong>
                    <span className="text-slate-505 font-semibold block text-[8px] uppercase">
                      {reportFormatType === "parent" ? "Tandatangan Ibu Bapa / Penjaga" : "Tandatangan Guru Besar / GPK Khas"}
                    </span>
                    <span className="text-slate-400 text-[7px] block">Tarikh: ___________________</span>
                  </div>
                </div>

                {/* Principal's signature */}
                <div className="space-y-10">
                  <div className="h-8 border-b border-slate-400 w-3/4 mx-auto"></div>
                  <div>
                    <strong className="block text-slate-900 uppercase underline decoration-slate-400 font-black">
                      {reportFormatType === "parent" ? reportPrincipalName : "MOHOR / CAP JABATAN"}
                    </strong>
                    <span className="text-slate-505 font-semibold block text-[8px] uppercase">
                      {reportFormatType === "parent" ? "Disahkan Oleh: Guru Besar" : "Pengesahan Rasmi Pentadbiran"}
                    </span>
                    <span className="text-slate-400 text-[7px] block">Tarikh: ___________________</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 2. ON-SCREEN DETAILED MODAL PREVIEW FOR TEACHER / PARENT  */}
      {/* ========================================================= */}
      {isReportPreviewOpen && (() => {
        const student = students.find(s => s.id === selectedReportStudentId) || students[0];
        if (!student) return null;

        const achievedBm = student.checklistsBM ? student.checklistsBM.filter(Boolean).length : 0;
        const bmPercent = Math.round((achievedBm / 32) * 100);
        const achievedMt = student.checklistsMT ? student.checklistsMT.filter(Boolean).length : 0;
        const mtPercent = Math.round((achievedMt / 20) * 100);

        // Subgroups BM
        const sBM1 = student.checklistsBM ? student.checklistsBM.slice(0, 8).filter(Boolean).length : 0;
        const sBM2 = student.checklistsBM ? student.checklistsBM.slice(8, 16).filter(Boolean).length : 0;
        const sBM3 = student.checklistsBM ? student.checklistsBM.slice(16, 24).filter(Boolean).length : 0;
        const sBM4 = student.checklistsBM ? student.checklistsBM.slice(24, 32).filter(Boolean).length : 0;

        // Subgroups MT
        const sMT1 = student.checklistsMT ? student.checklistsMT.slice(0, 6).filter(Boolean).length : 0;
        const sMT2 = student.checklistsMT ? student.checklistsMT.slice(6, 14).filter(Boolean).length : 0;
        const sMT3 = student.checklistsMT ? student.checklistsMT.slice(14, 20).filter(Boolean).length : 0;

        // Attendance rating
        let attendanceRating = "LEMAH";
        let attendanceColor = "text-rose-600";
        if (student.attendanceRate >= 95) {
          attendanceRating = "SANGAT CEMERLANG";
          attendanceColor = "text-emerald-600";
        } else if (student.attendanceRate >= 85) {
          attendanceRating = "SATISFAKTORI / BAIK";
          attendanceColor = "text-green-600";
        } else if (student.attendanceRate >= 75) {
          attendanceRating = "SEDERHANA";
          attendanceColor = "text-amber-500";
        }

        return (
          <div className="fixed inset-0 z-50 flex flex-col justify-between items-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in print:hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] overflow-hidden text-slate-100">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <Printer className="text-rose-500 w-5 h-5 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Pratinjau Laporan Rasmi - A4 Portrait (PDF)</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Tampilan simulasi draf fizikal laporan rasmi di bawah sebelum menekan butang cetak.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReportPreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable A4 Page mockup visualizer */}
              <div className="flex-1 overflow-y-auto bg-slate-950/80 p-6 flex justify-center custom-scrollbar">
                {/* Simulated US Letter / A4 paper page */}
                <div className="bg-white text-slate-800 shadow-2xl p-10 font-sans w-full max-w-[210mm] min-h-[297mm] my-2 rounded-md border border-slate-300 relative text-xs">
                  {/* Watermark badge on mockup screen */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04] text-rose-800 select-none text-center border-4 border-rose-800 p-8 rounded-xl font-bold font-sans tracking-widest uppercase rotate-12 scale-150">
                    SISTEM PENGURUSAN PULIH360<br/>DRAF DIGITAL PRATINJAU
                  </div>

                  {/* Crest & Official Mini-Banner Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-5 select-none">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-12 h-12 border border-slate-900 bg-slate-50 flex items-center justify-center p-1 rounded font-bold text-[8px] text-slate-800 text-center leading-tight">
                        SKJT
                      </div>
                      <div className="text-left">
                        <h4 className="text-[10px] font-black text-slate-950">SEKOLAH KEBANGSAAN JALAN TAMAN</h4>
                        <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider">UNIT PEMULIHAN KHAS • LAPORAN DATA SESI 2026/2027</p>
                        <p className="text-[7px] text-slate-400 italic">"Sumbangan Terbaik, Potensi Meluas"</p>
                      </div>
                    </div>
                    <div className="text-right border-l pl-3 border-slate-300">
                      <span className="bg-rose-50 border border-rose-100 text-rose-700 font-black px-1.5 py-0.5 text-[7px] rounded block uppercase tracking-wider mb-1">DRAF PREVIEW</span>
                      <span className="text-[7px] font-bold text-slate-400 block">ID Sesi: {student.id}</span>
                    </div>
                  </div>

                  {/* Document Title Header */}
                  <div className="text-center space-y-0.5 mb-5 select-none">
                    <h3 className="text-xs font-black text-slate-955 uppercase tracking-widest underline decoration-2 underline-offset-4">
                      {reportFormatType === "parent" ? "LAPORAN KEMAJUAN DAN PENGUASAAN INDIVIDU MURID" : "LAPORAN PROFIL KOMPETENSI PORTFOLIO PEMULIHAN KHAS"}
                    </h3>
                    <p className="text-[8px] font-bold text-slate-500 uppercase">
                      {reportFormatType === "parent" 
                        ? "Disediakan khusus untuk rujukan Ibu Bapa dan bimbingan pengukuhan" 
                        : "Dokumen Penilaian Prestasi Utama untuk Pentadbiran Sekolah"}
                    </p>
                  </div>

                  {/* Section 1: Demographics Grid */}
                  <div className="border border-slate-300 rounded-lg p-3.5 mb-4 bg-slate-50 select-none">
                    <h4 className="text-[8px] font-black text-slate-955 uppercase border-b border-slate-300 pb-0.5 mb-2.5 tracking-wider text-left">
                      01. MAKLUMAT PERIBADI MURID & PENJAGA
                    </h4>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-5 text-[8.5px]">
                      <div className="flex justify-between border-b border-slate-150 pb-1 flex-row">
                        <span className="font-bold text-slate-500">Nama Penuh Murid:</span>
                        <span className="font-extrabold text-slate-950 uppercase text-right ml-2 grow truncate">{student.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span className="font-bold text-slate-550">No. MyID / MyKid:</span>
                        <span className="font-bold text-slate-900">{student.myKid || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span className="font-bold text-slate-550">Tahun / Kelas:</span>
                        <span className="font-bold text-slate-900">Darjah {student.year} ({student.classGroup})</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span className="font-bold text-slate-550">Jantina Murid:</span>
                        <span className="font-bold text-slate-900">{student.gender}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span className="font-bold text-slate-550">Tarikh Kemasukan:</span>
                        <span className="font-bold text-slate-900">{student.joinedDate}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span className="font-bold text-slate-550">Kumpulan Fokus:</span>
                        <span className="font-black text-slate-950 uppercase">{student.subjects === "BM+MT" ? "BM & Matematik (Dwipandu)" : student.subjects}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1 flex-row">
                        <span className="font-bold text-slate-550">
                          {reportFormatType === "parent" ? "Nama Penjaga (Ibu Bapa):" : "Program Rujukan Intervensi:"}
                        </span>
                        <span className="font-bold text-slate-900 text-right ml-2 grow truncate" title={reportFormatType === "parent" ? reportGuardianName : student.intervention}>
                          {reportFormatType === "parent" ? reportGuardianName : (student.intervention || "Prosedur Intervensi")}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span className="font-bold text-slate-550">
                          {reportFormatType === "parent" ? "No. Telefon Penjaga:" : "Status Kes Semasa:"}
                        </span>
                        <span className="font-bold text-slate-900">
                          {reportFormatType === "parent" ? (student.guardianPhone || "N/A") : (student.status === "Tamat" ? "SELESAI (Graduasi)" : "DALAM BIMBINGAN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Progress Metrics with visual bars */}
                  <div className="border border-slate-300 rounded-lg p-3.5 mb-4 select-none">
                    <h4 className="text-[8px] font-black text-slate-955 uppercase border-b border-slate-300 pb-0.5 mb-2.5 tracking-wider text-left">
                      02. PERATUSAN PENGUASAAN SUB-PENGUASAAN & KONSTRUK
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {(student.subjects === "BM" || student.subjects === "BM+MT") && (
                        <div className="space-y-2 border-r border-slate-200 pr-3 text-left">
                          <div className="flex justify-between items-baseline text-[8px] font-bold">
                            <span className="text-slate-800 uppercase">Literasi Bahasa Melayu</span>
                            <span className="text-indigo-650 font-extrabold">{achievedBm}/32 ({bmPercent}%)</span>
                          </div>
                          {/* Visual bar */}
                          <div className="w-full bg-slate-105 h-2 rounded-full border border-slate-200 overflow-hidden">
                            <div className="bg-indigo-650 h-full" style={{ width: `${bmPercent}%` }}></div>
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-0.5 text-[7px] leading-tight">
                            <div className="bg-slate-50 p-1 rounded border border-slate-100">
                              <span className="block text-slate-450 font-bold">K1-K8 (Pra-membaca)</span>
                              <strong className="text-slate-705 font-extrabold">{sBM1} / 8 Dikuasai</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-100">
                              <span className="block text-slate-455 font-bold">K9-K16 (Suku Kata)</span>
                              <strong className="text-slate-705 font-extrabold">{sBM2} / 8 Dikuasai</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-105">
                              <span className="block text-slate-455 font-bold">K17-K24 (Perkataan)</span>
                              <strong className="text-slate-705 font-extrabold">{sBM3} / 8 Dikuasai</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-105">
                              <span className="block text-slate-455 font-bold">K25-K32 (Kefahaman)</span>
                              <strong className="text-slate-705 font-extrabold">{sBM4} / 8 Dikuasai</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {(student.subjects === "MT" || student.subjects === "BM+MT") && (
                        <div className="space-y-2 pl-1 select-none text-left">
                          <div className="flex justify-between items-baseline text-[8px] font-bold">
                            <span className="text-slate-800 uppercase">Numerasi Matematik</span>
                            <span className="text-teal-650 font-extrabold">{achievedMt}/20 ({mtPercent}%)</span>
                          </div>
                          {/* Visual bar */}
                          <div className="w-full bg-slate-105 h-2 rounded-full border border-slate-200 overflow-hidden">
                            <div className="bg-teal-650 h-full" style={{ width: `${mtPercent}%` }}></div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 pt-0.5 text-[7px] leading-tight">
                            <div className="bg-slate-50 p-1 rounded border border-slate-105 text-center">
                              <span className="block text-slate-455 font-bold">M1-M8 (Pra/Nombor)</span>
                              <strong className="text-slate-705 font-extrabold">{sMT1} / 6 Dikuasai</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-105 text-center">
                              <span className="block text-slate-455 font-bold">M9-M16 (Operasi)</span>
                              <strong className="text-slate-705 font-extrabold">{sMT2} / 8 Dikuasai</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-105 text-center">
                              <span className="block text-slate-455 font-bold">M17-M20 (Aplikasi)</span>
                              <strong className="text-slate-705 font-extrabold">{sMT3} / 6 Dikuasai</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Attendance Analytics with status text */}
                  <div className="border border-slate-300 rounded-lg p-3.5 mb-4 select-none">
                    <h4 className="text-[8px] font-black text-slate-955 uppercase border-b border-slate-300 pb-0.5 mb-2 tracking-wider text-left">
                      03. REKOD KEUJUDAN & KADAR KEHADIRAN AKTIF
                    </h4>
                    <div className="flex items-center justify-between text-[8px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-4 text-left">
                        <div>
                          <span className="text-slate-500 font-bold block">Kehadiran Purata:</span>
                          <strong className="text-xs font-black text-slate-900">{student.attendanceRate}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">Ulasan Kehadiran:</span>
                          <strong className={`font-black text-[7.5px] uppercase ${attendanceColor}`}>{attendanceRating}</strong>
                        </div>
                      </div>
                      <div className="max-w-xs text-[7.5px] text-slate-500 leading-normal italic pl-4 border-l border-slate-200 text-left">
                        {student.attendanceRate >= 90
                          ? "* Hubungan kehadiran cemerlang ini memaksimumkan kelancaran pemulihan."
                          : "* Perlu pendedahan bimbingan yang lebih konsisten ke sekolah harian."}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Teacher Special Recommendation (Ulasan) */}
                  <div className="border border-slate-300 rounded-lg p-3.5 mb-5 text-left">
                    <h4 className="text-[8px] font-black text-slate-955 uppercase border-b border-slate-300 pb-0.5 mb-1.5 tracking-wider">
                      04. ULASAN KHAS & SYOR TINDAKAN SUSULAN GURU PEMULIHAN
                    </h4>
                    <p className="text-[8.5px] text-slate-800 leading-relaxed bg-[#fbfbfb] p-2.5 rounded-md border border-dashed border-slate-300 min-h-[50px] font-medium font-sans whitespace-pre-wrap italic">
                      "{reportRemarks || 'Belum dimasukkan. Sila isi saranan di borang sebelah.'}"
                    </p>
                  </div>

                  {/* Section 5: Signature Sign-offs */}
                  <div className="pt-4 border-t border-dashed border-slate-300 select-none">
                    <p className="text-center text-[7px] text-slate-400 font-semibold uppercase tracking-wider mb-5">
                      Laporan ini sedia dicetak ke fail PDF fizikal rasmi bagi kegunaan sekolah/waris.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-5 text-center text-[8px] leading-relaxed">
                      {/* Teacher's signature */}
                      <div className="space-y-6">
                        <div className="h-4 border-b border-dashed border-slate-300 w-3/4 mx-auto"></div>
                        <div>
                          <strong className="block text-slate-905 uppercase underline font-extrabold">{reportTeacherName}</strong>
                          <span className="text-slate-500 block text-[7px] uppercase">Guru Pemulihan Khas</span>
                        </div>
                      </div>

                      {/* Parent's signature */}
                      <div className="space-y-6">
                        <div className="h-4 border-b border-dashed border-slate-300 w-3/4 mx-auto"></div>
                        <div>
                          <strong className="block text-slate-905 uppercase underline font-extrabold">
                            {reportFormatType === "parent" ? reportGuardianName : "PENTADBIR GURU BESAR"}
                          </strong>
                          <span className="text-slate-550 block text-[7px] uppercase">
                            {reportFormatType === "parent" ? "Tandatangan Ibu Bapa" : "Tandatangan Guru Besar"}
                          </span>
                        </div>
                      </div>

                      {/* Principal's signature */}
                      <div className="space-y-6">
                        <div className="h-4 border-b border-dashed border-slate-300 w-3/4 mx-auto"></div>
                        <div>
                          <strong className="block text-slate-905 uppercase underline font-extrabold">
                            {reportFormatType === "parent" ? reportPrincipalName : "MOHOR RASMI COP SKJT"}
                          </strong>
                          <span className="text-slate-550 block text-[7px] uppercase">
                            {reportFormatType === "parent" ? "Disahkan Oleh: Guru Besar" : "Pengesahan Fail Pentadbiran"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Action Controls Footer */}
              <div className="px-6 py-4 border-t border-slate-805 bg-slate-950/50 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsReportPreviewOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Batal / Kembali
                </button>
                <button
                  onClick={() => {
                    // Trigger Print API
                    window.print();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-6 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Proses Dan Cetak Fail (PDF)</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
