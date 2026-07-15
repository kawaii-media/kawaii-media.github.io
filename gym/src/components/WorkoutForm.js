/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMMON_EXERCISES, CATEGORIES } from "../types.js";
import { estimateCalories } from "../helpers.js";
import { getSvgIcon } from "../icons.js";

export class WorkoutForm {
  category = "Dada";
  exerciseName = "Bench Press";
  date = "";
  notes = "";
  sets = [{ reps: 10, weight: 0, completed: true }];
  caloriesBurned = 0;
  error = "";
  showSuccess = false;
  editingWorkout = null;
  lastEditId = null;

  constructor(options) {
    this.container = document.getElementById(options.containerId);
    this.onAddWorkout = options.onAddWorkout;
    this.onCancelEdit = options.onCancelEdit;

    // Set today's date
    this.resetDateToToday();
    
    // Initial Render
    this.render();
  }

  resetDateToToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    this.date = `${yyyy}-${mm}-${dd}`;
  }

  setEditingWorkout(entry) {
    this.editingWorkout = entry;
    if (entry) {
      this.category = entry.category;
      this.exerciseName = entry.exerciseName;
      this.date = entry.date;
      this.notes = entry.notes || "";
      this.sets = entry.sets.map((s) => ({
        reps: s.reps,
        weight: s.weight,
        duration: s.duration,
        distance: s.distance,
        completed: s.completed,
      }));
      this.caloriesBurned = entry.caloriesBurned || 0;
      this.lastEditId = entry.id;
    } else {
      this.category = "Dada";
      this.exerciseName = "Bench Press";
      this.resetDateToToday();
      this.notes = "";
      this.sets = [{ reps: 10, weight: 0, completed: true }];
      this.caloriesBurned = 0;
      this.lastEditId = null;
    }
    this.error = "";
    this.showSuccess = false;
    
    // Full re-render when edit state shifts
    this.render();
  }

  triggerCalorieEstimation() {
    if (this.editingWorkout && this.editingWorkout.id === this.lastEditId) {
      // Don't overwrite saved calories when editing, unless they press "Auto"
      return;
    }
    this.caloriesBurned = estimateCalories(this.exerciseName, this.category, this.sets);
    const calInput = this.container.querySelector("#workout-calories-input");
    if (calInput) {
      calInput.value = this.caloriesBurned.toString();
    }
  }

  handleCategoryChange(newCat) {
    this.category = newCat;
    const matched = COMMON_EXERCISES.filter((ex) => ex.category === newCat);
    this.exerciseName = matched.length > 0 ? matched[0].name : "";

    // Set default set format
    if (newCat === "Kardio") {
      this.sets = [{ duration: 900, distance: 2.0, completed: true }]; // 15 min, 2 km
    } else if (this.exerciseName.toLowerCase().includes("plank")) {
      this.sets = [{ duration: 60, completed: true }];
    } else {
      this.sets = [{ reps: 10, weight: 0, completed: true }];
    }

    this.triggerCalorieEstimation();
    this.renderExerciseSelect();
    this.renderQuickSelectChips();
    this.renderSetsManager();
  }

  handleExerciseChange(newName) {
    this.exerciseName = newName;
    
    // Check if new exercise is plank
    if (newName.toLowerCase().includes("plank")) {
      this.sets = [{ duration: 60, completed: true }];
    } else if (this.category !== "Kardio" && this.sets.some(s => s.duration !== undefined)) {
      // Reset from plank duration back to reps/weight if transitioning away
      this.sets = [{ reps: 10, weight: 0, completed: true }];
    }

    this.triggerCalorieEstimation();
    this.renderSetsManager();
    this.updateQuickSelectChipsSelection();
  }

  addSetRow() {
    if (this.category === "Kardio") {
      this.sets.push({ duration: 900, distance: 2.0, completed: true });
    } else if (this.exerciseName.toLowerCase().includes("plank")) {
      this.sets.push({ duration: 60, completed: true });
    } else {
      // Use previous set's reps/weight as default for convenience
      const lastSet = this.sets[this.sets.length - 1];
      this.sets.push({
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 0,
        completed: true,
      });
    }
    this.triggerCalorieEstimation();
    this.renderSetsManager();
  }

  removeSetRow(idx) {
    if (this.sets.length <= 1) {
      this.showValidationError("Minimal harus memiliki 1 set.");
      return;
    }
    this.sets.splice(idx, 1);
    this.triggerCalorieEstimation();
    this.renderSetsManager();
  }

  updateSetField(idx, field, value) {
    if (idx >= 0 && idx < this.sets.length) {
      this.sets[idx] = {
        ...this.sets[idx],
        [field]: value
      };
      this.triggerCalorieEstimation();
    }
  }

  showValidationError(msg) {
    this.error = msg;
    const errorBanner = this.container.querySelector("#form-error-banner");
    if (errorBanner) {
      errorBanner.innerHTML = `
        <div class="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-medium">
          ${getSvgIcon("alert", "w-4 h-4 text-rose-400 shrink-0")}
          <span>${msg}</span>
        </div>
      `;
      errorBanner.classList.remove("hidden");
    }
  }

  showSuccessNotification() {
    this.showSuccess = true;
    const successBanner = this.container.querySelector("#form-success-banner");
    if (successBanner) {
      successBanner.innerHTML = `
        <div class="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-medium animate-fade-in">
          ${getSvgIcon("check", "w-4 h-4 text-emerald-400 shrink-0")}
          <span>Latihan berhasil disimpan! Lihat riwayat di bagian bawah.</span>
        </div>
      `;
      successBanner.classList.remove("hidden");
      
      setTimeout(() => {
        successBanner.classList.add("hidden");
        this.showSuccess = false;
      }, 4000);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.error = "";
    
    // Clear error display
    const errorBanner = this.container.querySelector("#form-error-banner");
    if (errorBanner) errorBanner.classList.add("hidden");

    // Validation
    if (!this.exerciseName.trim()) {
      this.showValidationError("Nama latihan tidak boleh kosong.");
      return;
    }

    if (this.sets.length === 0) {
      this.showValidationError("Mohon tambahkan minimal 1 set latihan.");
      return;
    }

    // Validate sets fields
    const isCardio = this.category === "Kardio";
    const isDurationOnly = this.exerciseName.toLowerCase().includes("plank");

    for (let i = 0; i < this.sets.length; i++) {
      const s = this.sets[i];
      if (isCardio) {
        if (!s.duration || s.duration <= 0) {
          this.showValidationError(`Set #${i+1}: Durasi harus lebih besar dari 0.`);
          return;
        }
      } else if (isDurationOnly) {
        if (!s.duration || s.duration <= 0) {
          this.showValidationError(`Set #${i+1}: Durasi plank harus lebih besar dari 0.`);
          return;
        }
      } else {
        if (s.reps === undefined || s.reps <= 0) {
          this.showValidationError(`Set #${i+1}: Repetisi harus minimal 1.`);
          return;
        }
      }
    }

    // Dispatch save
    this.onAddWorkout({
      category: this.category,
      exerciseName: this.exerciseName.trim(),
      date: this.date,
      notes: this.notes.trim() || undefined,
      caloriesBurned: this.caloriesBurned,
      sets: this.sets.map((s, idx) => ({
        id: `s-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        ...s
      }))
    });

    this.showSuccessNotification();

    // Reset if we were not editing
    if (!this.editingWorkout) {
      this.notes = "";
      if (this.category === "Kardio") {
        this.sets = [{ duration: 900, distance: 2.0, completed: true }];
      } else if (this.exerciseName.toLowerCase().includes("plank")) {
        this.sets = [{ duration: 60, completed: true }];
      } else {
        this.sets = [{ reps: 10, weight: 0, completed: true }];
      }
      this.triggerCalorieEstimation();
      
      const notesInput = this.container.querySelector("#workout-notes-input");
      if (notesInput) notesInput.value = "";
      
      this.renderSetsManager();
    }
  }

  renderExerciseSelect() {
    const parent = this.container.querySelector("#exercise-select-container");
    if (!parent) return;

    const filtered = COMMON_EXERCISES.filter((ex) => ex.category === this.category);
    const isCommon = filtered.some((ex) => ex.name === this.exerciseName);
    const selectValue = isCommon ? this.exerciseName : (this.exerciseName === "" ? "" : "__custom__");

    if (filtered.length > 0) {
      parent.innerHTML = `
        <select
          id="exercise-select"
          class="w-full px-4 py-2.5 bg-indigo-950/60 border border-indigo-500/30 text-white rounded-xl text-sm font-semibold focus:border-indigo-400 outline-none transition-colors cursor-pointer"
        >
          <option value="" class="bg-[#0e1432] text-indigo-300">-- Pilih Latihan --</option>
          ${filtered.map((ex) => `
            <option value="${ex.name}" class="bg-[#0e1432] text-white" ${selectValue === ex.name ? "selected" : ""}>
              ${ex.name}
            </option>
          `).join("")}
          <option value="__custom__" class="bg-[#0e1432] text-indigo-300" ${selectValue === "__custom__" ? "selected" : ""}>✎ Kustom (Ketik Sendiri)...</option>
        </select>
        
        <div id="custom-exercise-input-wrapper" class="mt-2 ${selectValue === "__custom__" ? "" : "hidden"}">
          <input
            id="exercise-name-custom-input"
            type="text"
            required
            placeholder="Ketik nama latihan kustom..."
            value="${isCommon ? "" : this.exerciseName}"
            class="w-full px-4 py-2 bg-indigo-950/60 border border-indigo-500/30 text-white rounded-xl text-sm font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors placeholder-indigo-300/40"
          />
        </div>
      `;

      // Bind listener
      const select = parent.querySelector("#exercise-select");
      select.addEventListener("change", (e) => {
        const val = e.target.value;
        const customWrapper = parent.querySelector("#custom-exercise-input-wrapper");
        const customInput = parent.querySelector("#exercise-name-custom-input");

        if (val === "__custom__") {
          customWrapper.classList.remove("hidden");
          customInput.focus();
          this.handleExerciseChange(customInput.value);
        } else {
          customWrapper.classList.add("hidden");
          this.handleExerciseChange(val);
        }
      });

      const customInput = parent.querySelector("#exercise-name-custom-input");
      customInput.addEventListener("input", (e) => {
        this.handleExerciseChange(e.target.value);
      });

    } else {
      parent.innerHTML = `
        <input
          id="exercise-name-input"
          type="text"
          required
          placeholder="Contoh: Yoga, Lari, dll."
          value="${this.exerciseName}"
          class="w-full px-4 py-2.5 bg-indigo-950/60 border border-indigo-500/30 text-white rounded-xl text-sm font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors placeholder-indigo-300/40"
        />
      `;

      const input = parent.querySelector("#exercise-name-input");
      input.addEventListener("input", (e) => {
        this.handleExerciseChange(e.target.value);
      });
    }
  }

  renderQuickSelectChips() {
    const parent = this.container.querySelector("#chips-container");
    if (!parent) return;

    if (this.editingWorkout) {
      parent.innerHTML = "";
      return;
    }

    parent.innerHTML = `
      <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
        ${getSvgIcon("sparkles", "w-3 h-3 text-indigo-400")}
        <span>Pilih Cepat Latihan Populer</span>
      </div>
      <div class="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-500/20">
        ${COMMON_EXERCISES.map((ex) => {
          const isSelected = this.exerciseName === ex.name;
          return `
            <button
              id="quick-ex-${ex.name.replace(/\s+/g, '-').toLowerCase()}"
              type="button"
              data-exercise="${ex.name}"
              data-category="${ex.category}"
              class="quick-select-chip px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-sm"
                  : "bg-indigo-950/50 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/45 hover:bg-indigo-900/45"
              }"
            >
              ${ex.name}
            </button>
          `;
        }).join("")}
      </div>
    `;

    // Bind chips click
    parent.querySelectorAll(".quick-select-chip").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const exName = btn.dataset.exercise || "";
        const exCat = btn.dataset.category || "";

        const catSelect = this.container.querySelector("#category-select");
        if (catSelect && catSelect.value !== exCat) {
          catSelect.value = exCat;
          this.category = exCat;
        }

        this.category = exCat;
        this.handleExerciseChange(exName);
        
        this.renderExerciseSelect();
        this.updateQuickSelectChipsSelection();
      });
    });
  }

  updateQuickSelectChipsSelection() {
    const chips = this.container.querySelectorAll(".quick-select-chip");
    chips.forEach((chip) => {
      const chipEx = chip.dataset.exercise || "";
      const isSelected = this.exerciseName === chipEx;
      if (isSelected) {
        chip.className = "quick-select-chip px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-sm";
      } else {
        chip.className = "quick-select-chip px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer bg-indigo-950/50 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/45 hover:bg-indigo-900/45";
      }
    });
  }

  renderSetsManager() {
    const parent = this.container.querySelector("#sets-manager-container");
    if (!parent) return;

    const isCardio = this.category === "Kardio";
    const isDurationOnly = this.exerciseName.toLowerCase().includes("plank");

    parent.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs font-bold text-indigo-300 uppercase tracking-wider">
          ${isCardio ? "Pengaturan Durasi & Jarak" : isDurationOnly ? "Pengaturan Durasi Latihan" : "Pengaturan Set Latihan"}
        </div>
        <button
          id="add-set-row-btn"
          type="button"
          class="flex items-center gap-1 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg transition-colors border border-indigo-500/35 cursor-pointer"
        >
          ${getSvgIcon("plus", "w-3.5 h-3.5")}
          <span>Tambah Set</span>
        </button>
      </div>

      <!-- Set Header Labels -->
      <div class="grid grid-cols-12 gap-2 mb-2 text-center text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2">
        <div class="col-span-2 text-left">Set</div>
        ${isCardio ? `
          <div class="col-span-5">Durasi (M:D)</div>
          <div class="col-span-4">Jarak (Km)</div>
        ` : isDurationOnly ? `
          <div class="col-span-9">Durasi Latihan (M:D)</div>
        ` : `
          <div class="col-span-5">Beban (Kg)</div>
          <div class="col-span-4">Repetisi</div>
        `}
        <div class="col-span-1"></div>
      </div>

      <!-- Set Items list -->
      <div id="sets-rows-list" class="space-y-2 max-h-56 overflow-y-auto pr-1">
        ${this.sets.map((set, idx) => {
          const totalSec = set.duration || 0;
          const minVal = Math.floor(totalSec / 60);
          const secVal = totalSec % 60;

          return `
            <div
              id="set-row-${idx}"
              class="grid grid-cols-12 gap-2 items-center bg-[#0d1330] border border-indigo-500/20 rounded-xl p-2 shadow-sm"
            >
              <div class="col-span-2 text-xs font-bold text-indigo-300 pl-1">
                #${idx + 1}
              </div>

              ${isCardio ? `
                <!-- Duration Input (Min & Sec) -->
                <div class="col-span-5 flex items-center justify-between gap-1 bg-indigo-950/40 rounded-lg px-2 border border-indigo-500/20 focus-within:border-indigo-400 text-xs">
                  <input
                    id="set-${idx}-min-input"
                    type="number"
                    min="0"
                    placeholder="Min"
                    value="${minVal || ""}"
                    class="set-duration-min-field w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    data-index="${idx}"
                  />
                  <span class="text-indigo-500 font-bold">:</span>
                  <input
                    id="set-${idx}-sec-input"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Det"
                    value="${secVal || ""}"
                    class="set-duration-sec-field w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    data-index="${idx}"
                  />
                </div>

                <!-- Distance Input -->
                <div class="col-span-4 flex items-center gap-1 bg-indigo-950/40 rounded-lg px-2 border border-indigo-500/20 focus-within:border-indigo-400">
                  <input
                    id="set-${idx}-distance-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.0"
                    value="${set.distance || ""}"
                    class="set-distance-field w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    data-index="${idx}"
                  />
                  <span class="text-[10px] font-semibold text-indigo-400 uppercase">km</span>
                </div>
              ` : isDurationOnly ? `
                <!-- Duration Input (Min & Sec, occupying column-span 9) -->
                <div class="col-span-9 flex items-center justify-center gap-1 bg-indigo-950/40 rounded-lg px-4 border border-indigo-500/20 focus-within:border-indigo-400 text-xs">
                  <input
                    id="set-${idx}-min-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value="${minVal || ""}"
                    class="set-duration-min-field w-12 text-right py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    data-index="${idx}"
                  />
                  <span class="text-indigo-400 font-semibold text-[10px] px-1">menit</span>
                  <span class="text-indigo-500 font-bold">:</span>
                  <input
                    id="set-${idx}-sec-input"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value="${secVal || ""}"
                    class="set-duration-sec-field w-12 text-left py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    data-index="${idx}"
                  />
                  <span class="text-indigo-400 font-semibold text-[10px] px-1">detik</span>
                </div>
              ` : `
                <!-- Weight Input -->
                <div class="col-span-5 flex items-center gap-1 bg-indigo-950/40 rounded-lg px-2 border border-indigo-500/20 focus-within:border-indigo-400">
                  <input
                    id="set-${idx}-weight-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value="${set.weight || ""}"
                    class="set-weight-field w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    placeholder="0"
                    data-index="${idx}"
                  />
                  <span class="text-[10px] font-semibold text-indigo-400 uppercase">kg</span>
                </div>

                <!-- Reps Input -->
                <div class="col-span-4 flex items-center gap-1 bg-indigo-950/40 rounded-lg px-2 border border-indigo-500/20 focus-within:border-indigo-400">
                  <input
                    id="set-${idx}-reps-input"
                    type="number"
                    min="1"
                    step="1"
                    value="${set.reps || ""}"
                    class="set-reps-field w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                    placeholder="10"
                    data-index="${idx}"
                  />
                </div>
              `}

              <!-- Delete button -->
              <div class="col-span-1 flex justify-center">
                <button
                  type="button"
                  data-index="${idx}"
                  class="delete-set-row-btn p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Set"
                >
                  ${getSvgIcon("trash", "w-3.5 h-3.5")}
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Bind events for rows
    const addBtn = parent.querySelector("#add-set-row-btn");
    addBtn.addEventListener("click", () => this.addSetRow());

    // Duration Min field
    parent.querySelectorAll(".set-duration-min-field").forEach((input) => {
      input.addEventListener("input", (e) => {
        const el = e.target;
        const idx = parseInt(el.dataset.index || "0");
        const m = parseInt(el.value) || 0;
        const currentSec = (this.sets[idx].duration || 0) % 60;
        this.updateSetField(idx, "duration", m * 60 + currentSec);
      });
    });

    // Duration Sec field
    parent.querySelectorAll(".set-duration-sec-field").forEach((input) => {
      input.addEventListener("input", (e) => {
        const el = e.target;
        const idx = parseInt(el.dataset.index || "0");
        const s = Math.min(59, parseInt(el.value) || 0);
        const currentMin = Math.floor((this.sets[idx].duration || 0) / 60);
        this.updateSetField(idx, "duration", currentMin * 60 + s);
      });
    });

    // Distance field
    parent.querySelectorAll(".set-distance-field").forEach((input) => {
      input.addEventListener("input", (e) => {
        const el = e.target;
        const idx = parseInt(el.dataset.index || "0");
        const val = parseFloat(el.value) || 0;
        this.updateSetField(idx, "distance", val);
      });
    });

    // Weight field
    parent.querySelectorAll(".set-weight-field").forEach((input) => {
      input.addEventListener("input", (e) => {
        const el = e.target;
        const idx = parseInt(el.dataset.index || "0");
        const val = parseFloat(el.value) || 0;
        this.updateSetField(idx, "weight", val);
      });
    });

    // Reps field
    parent.querySelectorAll(".set-reps-field").forEach((input) => {
      input.addEventListener("input", (e) => {
        const el = e.target;
        const idx = parseInt(el.dataset.index || "0");
        const val = parseInt(el.value) || 0;
        this.updateSetField(idx, "reps", val);
      });
    });

    // Delete Buttons
    parent.querySelectorAll(".delete-set-row-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget;
        const idx = parseInt(el.dataset.index || "0");
        this.removeSetRow(idx);
      });
    });
  }

  render() {
    this.container.innerHTML = `
      <form id="workout-logging-form" class="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 p-5 shadow-xl">
        
        <!-- Form Header -->
        <div class="flex items-center justify-between mb-5 pb-3 border-b border-indigo-500/10">
          <div class="flex items-center gap-2.5">
            <div class="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              ${getSvgIcon("dumbbell", "w-5 h-5")}
            </div>
            <div>
              <h3 id="form-title" class="font-extrabold text-white font-display text-sm tracking-wide">
                ${this.editingWorkout ? "Ubah Latihan" : "Catat Latihan"}
              </h3>
              <p class="text-xs text-indigo-300">
                ${this.editingWorkout ? "Perbarui detail latihan Anda" : "Tambah aktivitas latihan baru Anda"}
              </p>
            </div>
          </div>
          ${this.editingWorkout ? `
            <button
              id="cancel-edit-btn"
              type="button"
              class="text-xs font-semibold text-rose-300 hover:text-rose-200 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20 cursor-pointer"
            >
              Batal
            </button>
          ` : ""}
        </div>

        <!-- Success notification banner wrapper -->
        <div id="form-success-banner" class="hidden"></div>

        <!-- Error Banner wrapper -->
        <div id="form-error-banner" class="hidden"></div>

        <!-- Workout Metadata Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
              Kelompok Otot (Kategori)
            </label>
            <select
              id="category-select"
              class="w-full px-3.5 py-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-sm font-semibold text-white focus:border-indigo-400 outline-none transition-colors cursor-pointer"
            >
              ${CATEGORIES.map((cat) => `
                <option value="${cat.name}" class="bg-[#0e1432] text-white" ${this.category === cat.name ? "selected" : ""}>
                  ${cat.name}
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
              Nama Latihan
            </label>
            <div id="exercise-select-container"></div>
          </div>
        </div>

        <!-- Quick Select Exercises (Horizontal Scrolling Chips) -->
        <div id="chips-container" class="mb-5"></div>

        <!-- Sets Manager Cardboard -->
        <div id="sets-manager-container" class="mb-5 border border-indigo-500/15 rounded-2xl p-4 bg-indigo-950/40"></div>

        <!-- Date, Calories & Notes Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label class="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              ${getSvgIcon("calendar", "w-3.5 h-3.5 text-indigo-400")}
              <span>Tanggal</span>
            </label>
            <input
              id="workout-date-input"
              type="date"
              required
              value="${this.date}"
              class="w-full px-3.5 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              ${getSvgIcon("flame", "w-3.5 h-3.5 text-rose-400")}
              <span>Kalori (kcal)</span>
            </label>
            <div class="flex gap-1">
              <input
                id="workout-calories-input"
                type="number"
                min="0"
                step="0.1"
                value="${this.caloriesBurned || ""}"
                class="w-full px-3.5 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-colors"
              />
              <button
                id="recalc-calories-btn"
                type="button"
                class="px-2 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[10px] font-bold rounded-xl hover:bg-indigo-500/25 transition-colors shrink-0 cursor-pointer"
                title="Hitung ulang otomatis berdasarkan jenis latihan Anda"
              >
                Auto
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              ${getSvgIcon("bookOpen", "w-3.5 h-3.5 text-indigo-400")}
              <span>Catatan (Opsional)</span>
            </label>
            <input
              id="workout-notes-input"
              type="text"
              placeholder="RPE 8.5, bertenaga, dll."
              value="${this.notes}"
              class="w-full px-3.5 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-colors placeholder-indigo-300/40"
            />
          </div>
        </div>

        <!-- Submit Action -->
        <button
          id="submit-workout-btn"
          type="submit"
          class="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.98] cursor-pointer ${
            this.editingWorkout
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 shadow-lg shadow-amber-500/15"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 shadow-lg shadow-indigo-500/15"
          }"
        >
          ${this.editingWorkout ? "Simpan Perubahan Latihan" : "Simpan Latihan Baru"}
        </button>
      </form>
    `;

    // Bind Base Event Listeners
    const form = this.container.querySelector("#workout-logging-form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    const cancelEditBtn = this.container.querySelector("#cancel-edit-btn");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => this.onCancelEdit());
    }

    const categorySelect = this.container.querySelector("#category-select");
    categorySelect.addEventListener("change", (e) => {
      this.handleCategoryChange(e.target.value);
    });

    const dateInput = this.container.querySelector("#workout-date-input");
    dateInput.addEventListener("change", (e) => {
      this.date = e.target.value;
    });

    const caloriesInput = this.container.querySelector("#workout-calories-input");
    caloriesInput.addEventListener("input", (e) => {
      this.caloriesBurned = parseFloat(e.target.value) || 0;
    });

    const recalcBtn = this.container.querySelector("#recalc-calories-btn");
    recalcBtn.addEventListener("click", () => {
      this.caloriesBurned = estimateCalories(this.exerciseName, this.category, this.sets);
      if (caloriesInput) caloriesInput.value = this.caloriesBurned.toString();
    });

    const notesInput = this.container.querySelector("#workout-notes-input");
    notesInput.addEventListener("input", (e) => {
      this.notes = e.target.value;
    });

    // Sub-renders
    this.renderExerciseSelect();
    this.renderQuickSelectChips();
    this.renderSetsManager();
  }
}
