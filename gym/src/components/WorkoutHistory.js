/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CATEGORIES } from "../types.js";
import { getSvgIcon } from "../icons.js";
import { formatDateIndonesian, calculateVolume } from "../helpers.js";

export class WorkoutHistory {
  workouts = [];
  searchTerm = "";
  categoryFilter = "";
  dateFilter = ""; // "", "today", "7days", "30days"

  constructor(options) {
    this.container = document.getElementById(options.containerId);
    this.onDeleteWorkout = options.onDeleteWorkout;
    this.onEditWorkout = options.onEditWorkout;
    this.onToggleSetComplete = options.onToggleSetComplete;

    this.render();
  }

  update(workouts) {
    this.workouts = workouts;
    this.renderListOnly();
  }

  filterWorkouts() {
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return this.workouts.filter((w) => {
      // 1. Search Term Filter
      const matchSearch =
        w.exerciseName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (w.notes && w.notes.toLowerCase().includes(this.searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      // 2. Category Filter
      if (this.categoryFilter && w.category !== this.categoryFilter) return false;

      // 3. Date Filter
      if (this.dateFilter) {
        const [year, month, day] = w.date.split("-").map(Number);
        const wTime = new Date(year, month - 1, day).getTime();

        if (this.dateFilter === "today" && w.date !== todayStr) return false;
        if (this.dateFilter === "7days" && now - wTime > 7 * oneDayMs) return false;
        if (this.dateFilter === "30days" && now - wTime > 30 * oneDayMs) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort descending by date, then by id desc
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.id.localeCompare(a.id);
    });
  }

  formatDuration(seconds) {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0 && s > 0) return `${m}m ${s}s`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  }

  renderListOnly() {
    const listWrapper = this.container.querySelector("#history-cards-wrapper");
    if (!listWrapper) return;

    const filtered = this.filterWorkouts();

    if (filtered.length === 0) {
      listWrapper.innerHTML = `
        <div class="col-span-1 md:col-span-2 py-16 text-center text-indigo-300 bg-[#131a35]/30 rounded-3xl border border-indigo-500/10">
          <div class="p-3 bg-indigo-500/5 text-indigo-400/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
            ${getSvgIcon("search", "w-6 h-6")}
          </div>
          <h5 class="font-bold text-white mb-0.5">Latihan Tidak Ditemukan</h5>
          <p class="text-[11px] text-indigo-400/70">Coba ubah kata kunci pencarian atau bersihkan filter Anda.</p>
        </div>
      `;
      return;
    }

    listWrapper.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        ${filtered.map((workout) => {
          const isCardio = workout.category === "Kardio";
          const isDurationOnly = workout.exerciseName.toLowerCase().includes("plank");
          const completedSetsCount = workout.sets.filter((s) => s.completed).length;
          const totalSetsCount = workout.sets.length;
          const vol = calculateVolume(workout);

          const catObj = CATEGORIES.find((c) => c.name === workout.category);
          const colorClass = catObj ? catObj.color : "bg-slate-900/40 text-slate-300 border-slate-500/25";

          return `
            <div
              id="workout-card-${workout.id}"
              class="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/20 overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-200"
            >
              
              <!-- Card Header -->
              <div class="p-4 bg-indigo-950/20 border-b border-indigo-500/10 flex items-start justify-between gap-2">
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${colorClass}">
                      ${workout.category}
                    </span>
                    <span class="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                      ${getSvgIcon("calendar", "w-3 h-3 text-indigo-400/70")}
                      <span>${formatDateIndonesian(workout.date)}</span>
                    </span>
                  </div>
                  <h4 class="text-sm font-extrabold text-white font-display mt-1">
                    ${workout.exerciseName}
                  </h4>
                  ${workout.notes ? `
                    <p class="text-[10px] text-indigo-300/80 italic line-clamp-1">
                      "${workout.notes}"
                    </p>
                  ` : ""}
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    data-workout-id="${workout.id}"
                    class="edit-workout-btn p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-200 rounded-lg transition-colors cursor-pointer"
                    title="Edit Latihan"
                  >
                    ${getSvgIcon("edit", "w-3.5 h-3.5")}
                  </button>
                  <button
                    data-workout-id="${workout.id}"
                    class="delete-workout-btn p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Latihan"
                  >
                    ${getSvgIcon("trash", "w-3.5 h-3.5")}
                  </button>
                </div>
              </div>

              <!-- Card Body: Sets Rows -->
              <div class="p-4 space-y-1.5 flex-1">
                
                <!-- Table Header inside Card -->
                <div class="grid grid-cols-12 gap-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1 px-1">
                  <div class="col-span-1 text-center">Status</div>
                  <div class="col-span-2">Set</div>
                  ${isCardio ? `
                    <div class="col-span-4 text-center">Durasi</div>
                    <div class="col-span-4 text-center">Jarak</div>
                    <div class="col-span-1 text-center"></div>
                  ` : isDurationOnly ? `
                    <div class="col-span-8 text-center">Durasi</div>
                    <div class="col-span-1 text-center"></div>
                  ` : `
                    <div class="col-span-4 text-center">Beban</div>
                    <div class="col-span-4 text-center">Repetisi</div>
                    <div class="col-span-1 text-center">Volume</div>
                  `}
                </div>

                <!-- Set Rows list -->
                ${workout.sets.map((set, idx) => `
                  <div
                    id="workout-card-${workout.id}-set-${idx}"
                    class="grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all duration-150 text-xs font-semibold ${
                      set.completed
                        ? "bg-indigo-950/20 border-indigo-900/30 text-indigo-300/40 line-through"
                        : "bg-[#0e1432] border border-indigo-500/15 text-indigo-100"
                    }"
                  >
                    <!-- Complete Checkbox Toggle -->
                    <div class="col-span-1 flex justify-center">
                      <button
                        data-workout-id="${workout.id}"
                        data-set-id="${set.id}"
                        class="toggle-complete-btn transition-colors p-0.5 rounded-full cursor-pointer ${
                          set.completed ? "text-emerald-400 hover:text-emerald-300" : "text-indigo-500/60 hover:text-indigo-400"
                        }"
                        title="${set.completed ? "Tandai Belum Selesai" : "Tandai Selesai"}"
                      >
                        ${set.completed 
                          ? getSvgIcon("checkCircle", "w-4 h-4 fill-emerald-500/10 text-emerald-400") 
                          : getSvgIcon("circle", "w-4 h-4")
                        }
                      </button>
                    </div>

                    <!-- Set Title -->
                    <div class="col-span-2 text-indigo-300 text-[11px]">
                      Set ${idx + 1}
                    </div>

                    ${isCardio ? `
                      <div class="col-span-4 text-center">
                        ${this.formatDuration(set.duration)}
                      </div>
                      <div class="col-span-4 text-center">
                        ${set.distance || 0} <span class="text-[10px] text-indigo-400">km</span>
                      </div>
                      <div class="col-span-1 text-right"></div>
                    ` : isDurationOnly ? `
                      <div class="col-span-8 text-center">
                        ${this.formatDuration(set.duration)}
                      </div>
                      <div class="col-span-1 text-right"></div>
                    ` : `
                      <div class="col-span-4 text-center">
                        ${set.weight} <span class="text-[10px] text-indigo-400">kg</span>
                      </div>
                      <div class="col-span-4 text-center">
                        ${set.reps} <span class="text-[10px] text-indigo-400">reps</span>
                      </div>
                      <div class="col-span-1 text-right text-[10px] text-indigo-400 font-mono pr-1">
                        ${(set.weight || 0) * (set.reps || 0)}
                      </div>
                    `}
                  </div>
                `).join("")}
              </div>

              <!-- Card Footer stats -->
              <div class="px-4 py-2.5 bg-indigo-950/30 border-t border-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-bold text-indigo-300">
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    ${getSvgIcon("sparkles", "w-3.5 h-3.5 text-indigo-400")}
                    <span>Total Set: ${completedSetsCount}/${totalSetsCount}</span>
                  </span>
                  ${workout.caloriesBurned !== undefined && workout.caloriesBurned > 0 ? `
                    <span class="flex items-center gap-1 text-rose-400">
                      ${getSvgIcon("flame", "w-3.5 h-3.5 fill-rose-500/20")}
                      <span>${workout.caloriesBurned} kcal</span>
                    </span>
                  ` : ""}
                </div>
                <div>
                  ${isCardio ? `
                    <span>
                      Total Jarak: <span class="text-white font-mono">${workout.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(2)} km</span>
                    </span>
                  ` : isDurationOnly ? `
                    <span>
                      Total Durasi: <span class="text-white font-mono">${this.formatDuration(workout.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.duration || 0), 0))}</span>
                    </span>
                  ` : `
                    <span>
                      Volume Total: <span class="text-white font-mono">${vol.toLocaleString("id-ID")} kg</span>
                    </span>
                  `}
                </div>
              </div>

            </div>
          `;
        }).join("")}
      </div>
    `;

    // Bind event listeners
    listWrapper.querySelectorAll(".edit-workout-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.workoutId || "";
        const w = this.workouts.find((item) => item.id === id);
        if (w) this.onEditWorkout(w);
      });
    });

    listWrapper.querySelectorAll(".delete-workout-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.workoutId || "";
        this.onDeleteWorkout(id);
      });
    });

    listWrapper.querySelectorAll(".toggle-complete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget;
        const workoutId = el.dataset.workoutId || "";
        const setId = el.dataset.setId || "";
        this.onToggleSetComplete(workoutId, setId);
      });
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Filters panel -->
        <div class="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/20 p-4 shadow-xl flex flex-col md:flex-row gap-4 items-center">
          
          <!-- Search input -->
          <div class="relative w-full md:flex-1">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400">
              ${getSvgIcon("search", "w-4 h-4")}
            </span>
            <input
              id="history-search-input"
              type="text"
              placeholder="Cari nama latihan atau catatan..."
              class="w-full pl-10 pr-4 py-2.5 bg-indigo-950/60 border border-indigo-500/25 rounded-2xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-all placeholder-indigo-300/40"
            />
          </div>

          <!-- Muscle category filters -->
          <div class="flex gap-3 w-full md:w-auto">
            <div class="relative flex-1 md:w-44">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">
                ${getSvgIcon("filter", "w-3.5 h-3.5")}
              </span>
              <select
                id="history-category-filter"
                class="w-full pl-9 pr-3 py-2.5 bg-indigo-950/60 border border-indigo-500/25 rounded-2xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-all cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                ${CATEGORIES.map((cat) => `
                  <option value="${cat.name}">${cat.name}</option>
                `).join("")}
              </select>
            </div>

            <!-- Date filters -->
            <div class="relative flex-1 md:w-44">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">
                ${getSvgIcon("calendar", "w-3.5 h-3.5")}
              </span>
              <select
                id="history-date-filter"
                class="w-full pl-9 pr-3 py-2.5 bg-indigo-950/60 border border-indigo-500/25 rounded-2xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-all cursor-pointer"
              >
                <option value="">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
              </select>
            </div>
          </div>

        </div>

        <!-- History cards container wrapper -->
        <div id="history-cards-wrapper" class="w-full"></div>

      </div>
    `;

    // Bind filters
    const searchInput = this.container.querySelector("#history-search-input");
    searchInput.addEventListener("input", (e) => {
      this.searchTerm = e.target.value;
      this.renderListOnly();
    });

    const categorySelect = this.container.querySelector("#history-category-filter");
    categorySelect.addEventListener("change", (e) => {
      this.categoryFilter = e.target.value;
      this.renderListOnly();
    });

    const dateSelect = this.container.querySelector("#history-date-filter");
    dateSelect.addEventListener("change", (e) => {
      this.dateFilter = e.target.value;
      this.renderListOnly();
    });

    this.renderListOnly();
  }
}
