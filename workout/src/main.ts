/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "./index.css";
import { WorkoutEntry } from "./types";
import { calculateStreak } from "./helpers";
import { getSvgIcon } from "./icons";
import { WorkoutForm } from "./components/WorkoutForm";
import { RestTimer } from "./components/RestTimer";
import { StatsDashboard } from "./components/StatsDashboard";
import { WorkoutHistory } from "./components/WorkoutHistory";

class FitnessApp {
  private workouts: WorkoutEntry[] = [];
  private editingWorkout: WorkoutEntry | null = null;

  // Components references
  private workoutForm!: WorkoutForm;
  private restTimer!: RestTimer;
  private statsDashboard!: StatsDashboard;
  private workoutHistory!: WorkoutHistory;

  constructor() {
    this.loadWorkouts();
    this.initLayout();
    this.initComponents();
    this.bindGlobalEvents();
    this.updateStateView();
  }

  private loadWorkouts() {
    try {
      const saved = localStorage.getItem("fit_track_workouts");
      this.workouts = saved ? JSON.parse(saved) : [];
    } catch {
      this.workouts = [];
    }
  }

  private saveWorkouts() {
    localStorage.setItem("fit_track_workouts", JSON.stringify(this.workouts));
    this.updateStateView();
  }

  private initLayout() {
    // Generate base skeleton inside index.html's body
    // This allows us to keep the index.html very minimal and render everything dynamically
    const root = document.getElementById("root") as HTMLElement;
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

  private initComponents() {
    // 1. Rest Timer
    this.restTimer = new RestTimer("rest-timer-wrapper");

    // 2. Workout Form
    this.workoutForm = new WorkoutForm({
      containerId: "workout-form-wrapper",
      onAddWorkout: (workout) => this.handleAddWorkout(workout),
      onCancelEdit: () => this.handleCancelEdit(),
    });

    // 3. Stats Dashboard
    this.statsDashboard = new StatsDashboard("stats-dashboard-wrapper");

    // 4. Workout History
    this.workoutHistory = new WorkoutHistory({
      containerId: "workout-history-wrapper",
      onDeleteWorkout: (id) => this.handleDeleteWorkout(id),
      onEditWorkout: (workout) => this.handleEditWorkout(workout),
      onToggleSetComplete: (workoutId, setId) => this.handleToggleSetComplete(workoutId, setId),
    });
  }

  private bindGlobalEvents() {
    // Modal Overlay Toggle bindings
    const overlay = document.getElementById("backup-modal-overlay") as HTMLElement;
    const openBtn = document.getElementById("open-backup-modal-btn") as HTMLButtonElement;
    const closeBtn = document.getElementById("close-backup-modal-btn") as HTMLButtonElement;
    const closeActionBtn = document.getElementById("modal-close-action-btn") as HTMLButtonElement;

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

    // Click outside to close modal
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    // Export Trigger
    const exportBtn = document.getElementById("backup-export-action-btn") as HTMLButtonElement;
    exportBtn.addEventListener("click", () => this.handleExportData());

    // Import Hidden Trigger
    const importTriggerBtn = document.getElementById("backup-import-trigger-btn") as HTMLButtonElement;
    const fileInput = document.getElementById("hidden-import-file-input") as HTMLInputElement;

    importTriggerBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => this.handleImportData(e));

    // Clear All
    const clearBtn = document.getElementById("danger-clear-all-btn") as HTMLButtonElement;
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

  private clearModalAlerts() {
    const sFeedback = document.getElementById("import-success-feedback") as HTMLElement;
    const eFeedback = document.getElementById("import-error-feedback") as HTMLElement;
    sFeedback.classList.add("hidden");
    sFeedback.innerText = "";
    eFeedback.classList.add("hidden");
    eFeedback.innerText = "";
  }

  private showModalAlert(type: "success" | "error", message: string) {
    this.clearModalAlerts();
    const feedback = document.getElementById(
      type === "success" ? "import-success-feedback" : "import-error-feedback"
    ) as HTMLElement;
    
    if (feedback) {
      feedback.innerText = message;
      feedback.classList.remove("hidden");
    }
  }

  private handleExportData() {
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

  private handleImportData(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Validate basic structure
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
            // Reset edit form if we were in editing state
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
      // Reset input value so it can trigger change event again
      input.value = "";
    };

    reader.readAsText(file);
  }

  private handleAddWorkout(workoutData: Omit<WorkoutEntry, "id">) {
    if (this.editingWorkout) {
      // Update Mode
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
      // Create Mode
      const newEntry: WorkoutEntry = {
        id: `workout-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...workoutData
      };
      this.workouts.unshift(newEntry);
    }

    this.saveWorkouts();
  }

  private handleCancelEdit() {
    this.editingWorkout = null;
    this.workoutForm.setEditingWorkout(null);
  }

  private handleEditWorkout(workout: WorkoutEntry) {
    this.editingWorkout = workout;
    this.workoutForm.setEditingWorkout(workout);
    
    // Smooth scroll to form container
    const formElement = document.getElementById("workout-form-wrapper");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  private handleDeleteWorkout(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus latihan ini?")) {
      this.workouts = this.workouts.filter((w) => w.id !== id);
      
      // If deleting the active editing workout, cancel edit mode
      if (this.editingWorkout && this.editingWorkout.id === id) {
        this.editingWorkout = null;
        this.workoutForm.setEditingWorkout(null);
      }
      
      this.saveWorkouts();
    }
  }

  private handleToggleSetComplete(workoutId: string, setId: string) {
    const workoutIdx = this.workouts.findIndex((w) => w.id === workoutId);
    if (workoutIdx === -1) return;

    const setIdx = this.workouts[workoutIdx].sets.findIndex((s) => s.id === setId);
    if (setIdx === -1) return;

    // Toggle completed state
    const currentStatus = this.workouts[workoutIdx].sets[setIdx].completed;
    const newStatus = !currentStatus;
    this.workouts[workoutIdx].sets[setIdx].completed = newStatus;

    // Trigger Autostart Timer if set completed is checked and autostart enabled
    if (newStatus && this.restTimer.getIsAutoStartEnabled()) {
      this.restTimer.startTimer();
    }

    this.saveWorkouts();
  }

  private updateStateView() {
    // 1. Onboarding guides
    const onboarding = document.getElementById("onboarding-welcome-panel") as HTMLElement;
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

    // 2. Header Streak Badge
    const streakBadge = document.getElementById("streak-header-badge") as HTMLElement;
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

    // 3. Update dynamic stats panels
    this.statsDashboard.update(this.workouts);

    // 4. Update logs history list
    this.workoutHistory.update(this.workouts);
  }
}

// Instantiate App
window.addEventListener("DOMContentLoaded", () => {
  new FitnessApp();
});
