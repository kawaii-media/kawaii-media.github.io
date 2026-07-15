/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "./index.css";
import { calculateStreak } from "./helpers.js";
import { getSvgIcon } from "./icons.js";
import { WorkoutForm } from "./components/WorkoutForm.js";
import { RestTimer } from "./components/RestTimer.js";
import { StatsDashboard } from "./components/StatsDashboard.js";
import { WorkoutHistory } from "./components/WorkoutHistory.js";

class FitnessApp {
  workouts = [];
  editingWorkout = null;

  constructor() {
    this.loadWorkouts();
    this.initLayout();
    this.initComponents();
    this.bindGlobalEvents();
    this.updateStateView();
  }

  loadWorkouts() {
    try {
      const saved = localStorage.getItem("fit_track_workouts");
      this.workouts = saved ? JSON.parse(saved) : [];
    } catch {
      this.workouts = [];
    }
  }

  saveWorkouts() {
    localStorage.setItem("fit_track_workouts", JSON.stringify(this.workouts));
    this.updateStateView();
  }

  initLayout() {
    const root = document.getElementById("root");
    if (!root) return;

    root.className = "min-h-screen bg-[#090d22] text-[#f8fafc] font-sans antialiased pb-12 transition-colors duration-300";
    root.innerHTML = `
      <!-- Top Header -->
      <header class="bg-[#0c122e]/85 border-b border-indigo-500/20 sticky top-0 z-10 shadow-lg backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          <!-- Logo & Slogan -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20 select-none">
              F
            </div>
            <div>
              <h1 class="font-black text-lg tracking-wider text-white font-display uppercase">
                FITNESS <span class="text-indigo-400">PRO</span>
              </h1>
              <p class="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">
                Daily Progress Tracker
              </p>
            </div>
          </div>

          <!-- Quick Utilities -->
          <div class="flex items-center gap-2 sm:gap-4">
            <!-- Streak Badge -->
            <div id="streak-header-badge" class="hidden"></div>

            <!-- Manage Settings -->
            <button
              id="open-backup-modal-btn"
              class="p-2.5 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 hover:text-indigo-100 rounded-xl transition-all border border-indigo-500/30 cursor-pointer"
              title="Kelola Data"
            >
              ${getSvgIcon("settings", "w-4 h-4")}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Contents -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <!-- Onboarding welcome banner -->
        <div id="onboarding-welcome-panel" class="hidden"></div>

        <!-- Master Dual-Column Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT COLUMN (Cols: 4) - Timer & Form -->
          <div class="lg:col-span-4 space-y-6">
            <div id="rest-timer-wrapper"></div>
            <div id="workout-form-wrapper"></div>
          </div>

          <!-- RIGHT COLUMN (Cols: 8) - Statistics & History list -->
          <div class="lg:col-span-8 space-y-8">
            <div id="stats-dashboard-wrapper"></div>
            <div id="workout-history-wrapper"></div>
          </div>

        </div>
      </main>

      <!-- Data Management Backup Modal -->
      <div id="backup-modal-overlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm hidden items-center justify-center p-4 z-50 animate-fade-in">
        <div class="bg-[#0e1432] rounded-3xl border border-indigo-500/30 max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-slide-up text-white">
          
          <!-- Close Modal Icon -->
          <button
            id="close-backup-modal-btn"
            class="absolute top-4 right-4 p-1.5 hover:bg-indigo-950 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            ${getSvgIcon("close", "w-5 h-5")}
          </button>

          <div class="flex items-center gap-2 mb-4 border-b border-indigo-500/20 pb-3">
            ${getSvgIcon("settings", "w-5 h-5 text-indigo-400")}
            <h3 class="font-extrabold text-white font-display">Pengaturan & Kelola Data</h3>
          </div>

          <p class="text-xs text-slate-400 mb-5 leading-relaxed">
            Semua data latihan disimpan secara lokal di browser Anda. Gunakan opsi di bawah ini untuk mencadangkan atau mengembalikan data Anda.
          </p>

          <!-- Notifications feedback -->
          <div id="import-success-feedback" class="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold hidden"></div>
          <div id="import-error-feedback" class="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold hidden"></div>

          <div class="space-y-4">
            
            <!-- Export / Backup -->
            <div class="p-3.5 bg-slate-900/60 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-white">Cadangkan Data (Ekspor)</h4>
                <p class="text-[10px] text-slate-400 mt-0.5">Unduh data latihan dalam bentuk berkas JSON.</p>
              </div>
              <button
                id="backup-export-action-btn"
                class="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                ${getSvgIcon("download", "w-3.5 h-3.5")}
                <span>Ekspor</span>
              </button>
            </div>

            <!-- Import / Restore -->
            <div class="p-3.5 bg-slate-900/60 rounded-2xl border border-indigo-500/20">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h4 class="text-xs font-bold text-white">Kembalikan Data (Impor)</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5">Unggah berkas JSON untuk memulihkan data latihan.</p>
                </div>
                <button
                  id="backup-import-trigger-btn"
                  class="flex items-center gap-1 px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ${getSvgIcon("upload", "w-3.5 h-3.5")}
                  <span>Pilih Berkas</span>
                </button>
                <input
                  id="hidden-import-file-input"
                  type="file"
                  accept=".json"
                  class="hidden"
                />
              </div>
            </div>

            <!-- Reset / Danger Zone -->
            <div class="pt-2 border-t border-indigo-500/10 flex justify-between items-center">
              <button
                id="danger-clear-all-btn"
                class="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Hapus Semua Data
              </button>
              
              <button
                id="modal-close-action-btn"
                class="px-4 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all border border-indigo-500/10 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  initComponents() {
    this.restTimer = new RestTimer("rest-timer-wrapper");

    this.workoutForm = new WorkoutForm({
      containerId: "workout-form-wrapper",
      onAddWorkout: (workout) => this.handleAddWorkout(workout),
      onCancelEdit: () => this.handleCancelEdit(),
    });

    this.statsDashboard = new StatsDashboard("stats-dashboard-wrapper");

    this.workoutHistory = new WorkoutHistory({
      containerId: "workout-history-wrapper",
      onDeleteWorkout: (id) => this.handleDeleteWorkout(id),
      onEditWorkout: (workout) => this.handleEditWorkout(workout),
      onToggleSetComplete: (workoutId, setId) => this.handleToggleSetComplete(workoutId, setId),
    });
  }

  bindGlobalEvents() {
    const overlay = document.getElementById("backup-modal-overlay");
    const openBtn = document.getElementById("open-backup-modal-btn");
    const closeBtn = document.getElementById("close-backup-modal-btn");
    const closeActionBtn = document.getElementById("modal-close-action-btn");

    const openModal = () => {
      overlay.style.display = "flex";
      this.clearModalAlerts();
    };

    const closeModal = () => {
      overlay.style.display = "none";
      this.clearModalAlerts();
    };

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    closeActionBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    const exportBtn = document.getElementById("backup-export-action-btn");
    exportBtn.addEventListener("click", () => this.handleExportData());

    const importTriggerBtn = document.getElementById("backup-import-trigger-btn");
    const fileInput = document.getElementById("hidden-import-file-input");

    importTriggerBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => this.handleImportData(e));

    const clearBtn = document.getElementById("danger-clear-all-btn");
    clearBtn.addEventListener("click", () => {
      if (confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data latihan Anda? Tindakan ini tidak dapat dibatalkan.")) {
        this.workouts = [];
        this.editingWorkout = null;
        this.workoutForm.setEditingWorkout(null);
        this.saveWorkouts();
        closeModal();
      }
    });
  }

  clearModalAlerts() {
    const sFeedback = document.getElementById("import-success-feedback");
    const eFeedback = document.getElementById("import-error-feedback");
    sFeedback.classList.add("hidden");
    sFeedback.innerText = "";
    eFeedback.classList.add("hidden");
    eFeedback.innerText = "";
  }

  showModalAlert(type, message) {
    this.clearModalAlerts();
    const feedback = document.getElementById(
      type === "success" ? "import-success-feedback" : "import-error-feedback"
    );
    
    if (feedback) {
      feedback.innerText = message;
      feedback.classList.remove("hidden");
    }
  }

  handleExportData() {
    try {
      const dataStr = JSON.stringify(this.workouts, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `FitnessPro-Backup-${new Date().toISOString().split("T")[0]}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      this.showModalAlert("success", "Data berhasil diekspor! Periksa unduhan Anda.");
    } catch {
      this.showModalAlert("error", "Gagal mengekspor data latihan.");
    }
  }

  handleImportData(e) {
    const input = e.target;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(item => 
            item && 
            typeof item.exerciseName === "string" && 
            typeof item.category === "string" && 
            Array.isArray(item.sets)
          );

          if (isValid) {
            this.workouts = parsed;
            this.saveWorkouts();
            this.showModalAlert("success", `Data berhasil diimpor! Terisi ${parsed.length} entri latihan.`);
            this.editingWorkout = null;
            this.workoutForm.setEditingWorkout(null);
          } else {
            this.showModalAlert("error", "Format file JSON tidak sesuai dengan struktur latihan.");
          }
        } else {
          this.showModalAlert("error", "Data JSON harus berupa array latihan.");
        }
      } catch {
        this.showModalAlert("error", "Gagal mengurai berkas JSON. Pastikan format berkas benar.");
      }
      input.value = "";
    };

    reader.readAsText(file);
  }

  handleAddWorkout(workoutData) {
    if (this.editingWorkout) {
      const updatedIndex = this.workouts.findIndex((w) => w.id === this.editingWorkout?.id);
      if (updatedIndex !== -1) {
        this.workouts[updatedIndex] = {
          ...workoutData,
          id: this.editingWorkout.id
        };
      }
      this.editingWorkout = null;
      this.workoutForm.setEditingWorkout(null);
    } else {
      const newEntry = {
        id: `workout-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...workoutData
      };
      this.workouts.unshift(newEntry);
    }

    this.saveWorkouts();
  }

  handleCancelEdit() {
    this.editingWorkout = null;
    this.workoutForm.setEditingWorkout(null);
  }

  handleEditWorkout(workout) {
    this.editingWorkout = workout;
    this.workoutForm.setEditingWorkout(workout);
    
    const formElement = document.getElementById("workout-form-wrapper");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  handleDeleteWorkout(id) {
    if (confirm("Apakah Anda yakin ingin menghapus latihan ini?")) {
      this.workouts = this.workouts.filter((w) => w.id !== id);
      
      if (this.editingWorkout && this.editingWorkout.id === id) {
        this.editingWorkout = null;
        this.workoutForm.setEditingWorkout(null);
      }
      
      this.saveWorkouts();
    }
  }

  handleToggleSetComplete(workoutId, setId) {
    const workoutIdx = this.workouts.findIndex((w) => w.id === workoutId);
    if (workoutIdx === -1) return;

    const setIdx = this.workouts[workoutIdx].sets.findIndex((s) => s.id === setId);
    if (setIdx === -1) return;

    const currentStatus = this.workouts[workoutIdx].sets[setIdx].completed;
    const newStatus = !currentStatus;
    this.workouts[workoutIdx].sets[setIdx].completed = newStatus;

    if (newStatus && this.restTimer.getIsAutoStartEnabled()) {
      this.restTimer.startTimer();
    }

    this.saveWorkouts();
  }

  updateStateView() {
    const onboarding = document.getElementById("onboarding-welcome-panel");
    if (onboarding) {
      if (this.workouts.length === 0) {
        onboarding.innerHTML = `
          <div class="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-indigo-500/25 relative overflow-hidden animate-fade-in">
            <div class="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 blur-sm pointer-events-none">
              ${getSvgIcon("dumbbell", "w-72 h-72 rotate-12 text-white")}
            </div>
            <div class="relative z-10 max-w-2xl">
              <span class="px-3 py-1 bg-white/10 text-indigo-300 font-bold text-[10px] uppercase tracking-wider rounded-full border border-white/10 select-none">
                Memulai Perjalanan Anda
              </span>
              <h2 class="text-xl sm:text-2xl font-black font-display tracking-tight mt-3 mb-2">
                Bentuk Tubuh Impian dengan Konsistensi Harian!
              </h2>
              <p class="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Fitness Tracker membantu Anda mencatat latihan secara lokal tanpa ribet pendaftaran. 
                Data Anda sepenuhnya aman di perangkat ini. Silakan mulai dengan mencatat aktivitas latihan pertama Anda di form sebelah kiri!
              </p>
            </div>
          </div>
        `;
        onboarding.classList.remove("hidden");
      } else {
        onboarding.classList.add("hidden");
        onboarding.innerHTML = "";
      }
    }

    const streakBadge = document.getElementById("streak-header-badge");
    if (streakBadge) {
      const currentStreak = calculateStreak(this.workouts);
      if (currentStreak > 0) {
        streakBadge.innerHTML = `
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 rounded-full font-bold text-xs shadow-sm select-none">
            ${getSvgIcon("flame", "w-4 h-4 fill-indigo-400 text-indigo-400")}
            <span>${currentStreak} Hari Streak!</span>
          </div>
        `;
        streakBadge.classList.remove("hidden");
      } else {
        streakBadge.classList.add("hidden");
        streakBadge.innerHTML = "";
      }
    }

    this.statsDashboard.update(this.workouts);
    this.workoutHistory.update(this.workouts);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new FitnessApp();
});
