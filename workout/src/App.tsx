/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Flame, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Clock, 
  HelpCircle,
  FileCheck2,
  Settings,
  X
} from "lucide-react";
import { WorkoutEntry } from "./types";
import { calculateStreak } from "./helpers";
import RestTimer from "./components/RestTimer";
import WorkoutForm from "./components/WorkoutForm";
import WorkoutHistory from "./components/WorkoutHistory";
import StatsDashboard from "./components/StatsDashboard";

export default function App() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() => {
    const saved = localStorage.getItem("fit_track_workouts");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Sync workouts with localStorage
  useEffect(() => {
    localStorage.setItem("fit_track_workouts", JSON.stringify(workouts));
  }, [workouts]);

  // Handle adding or updating a workout
  const handleAddWorkout = (workoutData: Omit<WorkoutEntry, "id">) => {
    if (editingWorkout) {
      // Update existing
      const updated = workouts.map((w) =>
        w.id === editingWorkout.id ? { ...workoutData, id: editingWorkout.id } : w
      );
      setWorkouts(updated);
      setEditingWorkout(null);
    } else {
      // Create new
      const newWorkout: WorkoutEntry = {
        ...workoutData,
        id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      setWorkouts([newWorkout, ...workouts]);
    }
  };

  // Handle deleting a workout
  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
    if (editingWorkout?.id === id) {
      setEditingWorkout(null);
    }
  };

  // Trigger editing mode
  const handleEditWorkout = (entry: WorkoutEntry) => {
    setEditingWorkout(entry);
    // Smooth scroll back to form container
    const formElement = document.getElementById("workout-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Toggle single set completion state from history card
  const handleToggleSetComplete = (workoutId: string, setId: string) => {
    const updated = workouts.map((w) => {
      if (w.id === workoutId) {
        return {
          ...w,
          sets: w.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s))
        };
      }
      return w;
    });
    setWorkouts(updated);
  };

  // Seed highly styled sample data for testing the application
  const handleSeedSampleData = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

    const sampleWorkouts: WorkoutEntry[] = [
      {
        id: "sample-1",
        date: todayStr,
        exerciseName: "Squat",
        category: "Kaki",
        sets: [
          { id: "s1-1", reps: 10, weight: 80, completed: true },
          { id: "s1-2", reps: 10, weight: 85, completed: true },
          { id: "s1-3", reps: 8, weight: 90, completed: true }
        ],
        notes: "Sangat bertenaga hari ini, form squat stabil."
      },
      {
        id: "sample-2",
        date: todayStr,
        exerciseName: "Plank",
        category: "Inti",
        sets: [
          { id: "s2-1", reps: 1, weight: 0, completed: true },
          { id: "s2-2", reps: 1, weight: 0, completed: true }
        ],
        notes: "Masing-masing set ditahan selama 60 detik."
      },
      {
        id: "sample-3",
        date: yesterdayStr,
        exerciseName: "Bench Press",
        category: "Dada",
        sets: [
          { id: "s3-1", reps: 12, weight: 50, completed: true },
          { id: "s3-2", reps: 10, weight: 60, completed: true },
          { id: "s3-3", reps: 8, weight: 70, completed: true },
          { id: "s3-4", reps: 6, weight: 75, completed: false }
        ],
        notes: "Set terakhir gagal pada repetisi ke-6. Lelah."
      },
      {
        id: "sample-4",
        date: yesterdayStr,
        exerciseName: "Bicep Curl",
        category: "Lengan",
        sets: [
          { id: "s4-1", reps: 12, weight: 12.5, completed: true },
          { id: "s4-2", reps: 10, weight: 15, completed: true },
          { id: "s4-3", reps: 10, weight: 15, completed: true }
        ],
        notes: "Pump bicep sangat terasa!"
      },
      {
        id: "sample-5",
        date: twoDaysAgoStr,
        exerciseName: "Pull Up",
        category: "Punggung",
        sets: [
          { id: "s5-1", reps: 10, weight: 0, completed: true },
          { id: "s5-2", reps: 8, weight: 0, completed: true },
          { id: "s5-3", reps: 8, weight: 0, completed: true }
        ],
        notes: "Menggunakan berat badan sendiri. Fokus pada kontraksi lat."
      },
      {
        id: "sample-6",
        date: twoDaysAgoStr,
        exerciseName: "Overhead Press",
        category: "Bahu",
        sets: [
          { id: "s6-1", reps: 10, weight: 30, completed: true },
          { id: "s6-2", reps: 8, weight: 35, completed: true },
          { id: "s6-3", reps: 8, weight: 35, completed: true }
        ],
        notes: "Bahu terasa bugar. Siap untuk latihan berikutnya."
      }
    ];

    setWorkouts(sampleWorkouts);
  };

  // Export local storage workouts data to a downloadable JSON file
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(workouts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `fit_track_backup_${new Date().toISOString().split("T")[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error("Gagal mengekspor data:", err);
    }
  };

  // Import JSON workouts file and load into state
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportSuccess(null);
    setImportError(null);
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsedData)) {
            // Validate basic structure
            const isValid = parsedData.every(item => 
              item && 
              typeof item.exerciseName === 'string' && 
              typeof item.category === 'string' && 
              Array.isArray(item.sets)
            );
            if (isValid) {
              setWorkouts(parsedData);
              setImportSuccess(`Data berhasil diimpor! Terisi ${parsedData.length} entri latihan.`);
            } else {
              setImportError("Format file JSON tidak sesuai dengan struktur latihan.");
            }
          } else {
            setImportError("Data JSON harus berupa array latihan.");
          }
        } catch (err) {
          setImportError("Gagal mengurai file JSON. Pastikan format file benar.");
        }
      };
    }
  };

  // Clear all workout logs from state and localStorage
  const handleClearAllData = () => {
    if (window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data latihan Anda? Tindakan ini tidak dapat dibatalkan.")) {
      setWorkouts([]);
      setEditingWorkout(null);
      localStorage.removeItem("fit_track_workouts");
    }
  };

  const currentStreak = calculateStreak(workouts);

  return (
    <div className="min-h-screen bg-[#090d22] text-[#f8fafc] font-sans antialiased pb-12 transition-colors duration-300">
      
      {/* Top Header Section with visual brand banner */}
      <header className="bg-[#0c122e]/85 border-b border-indigo-500/20 sticky top-0 z-10 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20">
              F
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider text-white font-display uppercase">
                FITNESS <span className="text-indigo-400">PRO</span>
              </h1>
              <p className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">
                Daily Progress Tracker
              </p>
            </div>
          </div>

          {/* Quick Header Widget & Utilities */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Streak indicator badge */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 rounded-full font-bold text-xs shadow-sm">
                <Flame className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                <span>{currentStreak} Hari Streak!</span>
              </div>
            )}

            {/* Config & Manage Data Button */}
            <button
              id="open-backup-modal-btn"
              onClick={() => setShowBackupModal(true)}
              className="p-2.5 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 hover:text-indigo-100 rounded-xl transition-all border border-indigo-500/30"
              title="Kelola Data"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Welcome / Tips Hero Board */}
        {workouts.length === 0 && (
          <div id="welcome-onboarding-panel" className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-indigo-500/25 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 blur-sm">
              <Dumbbell className="w-72 h-72 rotate-12 text-white" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="px-3 py-1 bg-white/10 text-indigo-300 font-bold text-[10px] uppercase tracking-wider rounded-full border border-white/10">
                Memulai Perjalanan Anda
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight mt-3 mb-2">
                Bentuk Tubuh Impian dengan Konsistensi Harian!
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Fitness Tracker membantu Anda mencatat latihan secara lokal tanpa ribet pendaftaran. 
                Data Anda sepenuhnya aman di perangkat ini. Klik tombol di bawah untuk mengisi data simulasi agar bisa langsung melihat visualisasi statistiknya!
              </p>
              
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  id="seed-sample-btn"
                  onClick={handleSeedSampleData}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all text-xs flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Muat Data Latihan Contoh</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Master Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Form & Rest Timer (Cols: 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Rest Timer */}
            <RestTimer />

            {/* Input Form Dashboard */}
            <WorkoutForm 
              onAddWorkout={handleAddWorkout} 
              editEntry={editingWorkout}
              onCancelEdit={() => setEditingWorkout(null)}
            />
          </div>

          {/* RIGHT COLUMN: Statistics Dashboard & History List (Cols: 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Statistics Dashboard */}
            <StatsDashboard workouts={workouts} />

            {/* Workout History */}
            <WorkoutHistory 
              workouts={workouts} 
              onDeleteWorkout={handleDeleteWorkout}
              onEditWorkout={handleEditWorkout}
              onToggleSetComplete={handleToggleSetComplete}
            />
          </div>
        </div>
      </main>

      {/* Backup and Data Management Modal */}
      {showBackupModal && (
        <div id="backup-modal-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0e1432] rounded-3xl border border-indigo-500/30 max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-slide-up text-white">
            
            <button
              id="close-backup-modal-btn"
              onClick={() => {
                setShowBackupModal(false);
                setImportSuccess(null);
                setImportError(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-indigo-950 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-indigo-500/20 pb-3">
              <Settings className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-white font-display">Pengaturan & Kelola Data</h3>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Semua data latihan disimpan secara lokal di browser Anda. Gunakan opsi di bawah ini untuk mencadangkan atau mengembalikan data Anda.
            </p>

            {/* Success Import Notification */}
            {importSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold">
                {importSuccess}
              </div>
            )}

            {/* Error Import Notification */}
            {importError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold">
                {importError}
              </div>
            )}

            <div className="space-y-4">
              
              {/* Backup / Export */}
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Cadangkan Data (Ekspor)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Unduh data latihan dalam bentuk berkas JSON.</p>
                </div>
                <button
                  id="backup-export-action-btn"
                  onClick={handleExportData}
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor</span>
                </button>
              </div>

              {/* Restore / Import */}
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">Pulihkan Data (Impor)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Muat kembali cadangan latihan dari berkas JSON.</p>
                  </div>
                  <label
                    htmlFor="import-data-file"
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-900/80 hover:bg-indigo-850 text-white text-xs font-bold rounded-xl cursor-pointer transition-all border border-indigo-500/30 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Impor</span>
                  </label>
                  <input
                    id="import-data-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Reset All */}
              <div className="p-3.5 bg-rose-950/35 rounded-2xl border border-rose-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Hapus Semua Data</h4>
                  <p className="text-[10px] text-rose-400 mt-0.5">Hapus seluruh catatan latihan dari perangkat ini.</p>
                </div>
                <button
                  id="backup-clear-action-btn"
                  onClick={handleClearAllData}
                  className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

              {/* Load Sample Options within Modal */}
              <div className="pt-2 border-t border-indigo-500/10 flex justify-end gap-2">
                <button
                  id="modal-seed-btn"
                  onClick={() => {
                    handleSeedSampleData();
                    setImportSuccess("Data contoh berhasil dimuat!");
                  }}
                  className="px-4 py-2 hover:bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-bold rounded-xl text-xs transition-all"
                >
                  Muat Data Contoh
                </button>
                <button
                  id="modal-close-action-btn"
                  onClick={() => {
                    setShowBackupModal(false);
                    setImportSuccess(null);
                    setImportError(null);
                  }}
                  className="px-4 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all border border-indigo-500/10"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
