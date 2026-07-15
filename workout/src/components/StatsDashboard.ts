/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkoutEntry } from "../types";
import { getSvgIcon } from "../icons";
import { calculateStreak, getWeeklyDistribution, getCategoryDistribution } from "../helpers";

export class StatsDashboard {
  private container: HTMLElement;
  private workouts: WorkoutEntry[] = [];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.renderEmpty();
  }

  public update(workouts: WorkoutEntry[]) {
    this.workouts = workouts;
    if (workouts.length === 0) {
      this.renderEmpty();
    } else {
      this.render();
    }
  }

  private renderEmpty() {
    this.container.innerHTML = `
      <div class="bg-[#131a35]/40 backdrop-blur-md rounded-3xl border border-indigo-500/15 p-6 text-center text-indigo-300">
        <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
          ${getSvgIcon("sparkles", "w-6 h-6")}
        </div>
        <h4 class="font-bold text-white mb-1">Statistik Anda Kosong</h4>
        <p class="text-xs text-indigo-300/80 max-w-sm mx-auto leading-relaxed">
          Catat latihan pertama Anda di form sebelah kiri untuk mengaktifkan analisis data visual di sini!
        </p>
      </div>
    `;
  }

  private render() {
    // Math Aggregations
    const streak = calculateStreak(this.workouts);

    // Total sets (completed sets only)
    const totalSets = this.workouts.reduce((sum, w) => sum + w.sets.filter((s) => s.completed).length, 0);

    // Total calories
    const totalCalories = this.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Total Volume (reps * weight for completed sets across non-cardio/non-plank)
    const totalVolume = this.workouts.reduce((sum, w) => {
      const isCardio = w.category === "Kardio";
      const isPlank = w.exerciseName.toLowerCase().includes("plank");
      if (isCardio || isPlank) return sum;

      const vol = w.sets
        .filter((s) => s.completed)
        .reduce((sSum, s) => sSum + (s.reps || 0) * (s.weight || 0), 0);
      return sum + vol;
    }, 0);

    // Unique days count where at least one set is completed
    const activeDays = Array.from(
      new Set(
        this.workouts
          .filter((w) => w.sets.some((s) => s.completed))
          .map((w) => w.date)
      )
    ).length;

    // Build Layout
    this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Bento Box 5-Column Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <!-- Streak Card -->
          <div class="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
            <div class="p-3 bg-orange-500/10 text-orange-400 rounded-2xl shrink-0">
              ${getSvgIcon("flame", "w-6 h-6 fill-orange-500/10")}
            </div>
            <div>
              <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Streak</div>
              <div class="text-xl font-extrabold text-white font-display mt-0.5">
                ${streak} <span class="text-xs font-semibold text-orange-300">Hari</span>
              </div>
              <div class="text-[9px] text-indigo-300/80 mt-0.5 truncate">
                Latihan beruntun
              </div>
            </div>
          </div>

          <!-- Total Volume Card -->
          <div class="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
            <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
              ${getSvgIcon("sparkles", "w-6 h-6")}
            </div>
            <div>
              <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Vol Total</div>
              <div class="text-xl font-extrabold text-white font-display mt-0.5">
                ${totalVolume.toLocaleString("id-ID")} <span class="text-xs font-semibold text-indigo-300">kg</span>
              </div>
              <div class="text-[9px] text-indigo-300/80 mt-0.5 truncate">
                Beban diangkat
              </div>
            </div>
          </div>

          <!-- Total Sets Card -->
          <div class="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
            <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
              ${getSvgIcon("checkCircle", "w-6 h-6")}
            </div>
            <div>
              <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Set Selesai</div>
              <div class="text-xl font-extrabold text-white font-display mt-0.5">
                ${totalSets} <span class="text-xs font-semibold text-emerald-300">Set</span>
              </div>
              <div class="text-[9px] text-indigo-300/80 mt-0.5 truncate">
                Set telah selesai
              </div>
            </div>
          </div>

          <!-- Active Days Card -->
          <div class="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
            <div class="p-3 bg-purple-500/10 text-purple-400 rounded-2xl shrink-0">
              ${getSvgIcon("calendar", "w-6 h-6")}
            </div>
            <div>
              <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Hari Aktif</div>
              <div class="text-xl font-extrabold text-white font-display mt-0.5">
                ${activeDays} <span class="text-xs font-semibold text-purple-300">Hari</span>
              </div>
              <div class="text-[9px] text-indigo-300/80 mt-0.5 truncate">
                Konsistensi latihan
              </div>
            </div>
          </div>

          <!-- Total Calories Card -->
          <div class="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3 col-span-2 sm:col-span-1">
            <div class="p-3 bg-rose-500/10 text-rose-400 rounded-2xl shrink-0">
              ${getSvgIcon("flame", "w-6 h-6 fill-rose-500/20")}
            </div>
            <div>
              <div class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Total Kalori</div>
              <div class="text-xl font-extrabold text-white font-display mt-0.5">
                ${totalCalories.toLocaleString("id-ID")} <span class="text-xs font-semibold text-rose-300">kcal</span>
              </div>
              <div class="text-[9px] text-indigo-300/80 mt-0.5 truncate">
                Kalori terbakar
              </div>
            </div>
          </div>

        </div>

        <!-- Charts Row (Grid 2 cols on Desktop) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <!-- Weekly frequency (Col: 7) -->
          <div class="md:col-span-7 bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/20 p-5 shadow-xl">
            <h4 class="font-extrabold text-white font-display text-sm mb-1 tracking-wide">Frekuensi Latihan Mingguan</h4>
            <p class="text-[11px] text-indigo-300 mb-5">Jumlah latihan yang diselesaikan dalam 7 hari terakhir</p>
            
            <div class="h-56 flex items-end justify-between px-2 pt-2 pb-1 bg-indigo-950/20 rounded-2xl border border-indigo-500/10">
              <div id="weekly-frequency-chart" class="w-full h-full">
                <!-- Will render SVG weekly chart below -->
              </div>
            </div>
          </div>

          <!-- Category Split (Col: 5) -->
          <div class="md:col-span-5 bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/20 p-5 shadow-xl">
            <h4 class="font-extrabold text-white font-display text-sm mb-1 tracking-wide">Distribusi Kategori Latihan</h4>
            <p class="text-[11px] text-indigo-300 mb-5">Porsi latihan berdasarkan kelompok otot (jumlah set)</p>
            
            <div id="category-distribution-container" class="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              <!-- Will render Category Bars below -->
            </div>
          </div>

        </div>

      </div>
    `;

    // Render Sub-charts
    this.renderWeeklyChart();
    this.renderCategorySplit();
  }

  private renderWeeklyChart() {
    const parent = this.container.querySelector("#weekly-frequency-chart") as HTMLElement;
    if (!parent) return;

    const data = getWeeklyDistribution(this.workouts);
    const counts = data.map((d) => d.count);
    const maxVal = Math.max(...counts, 4); // default scale min of 4

    // We can render a highly stylized SVG Bar Chart!
    const chartHeight = 160;
    const barWidth = 32;
    const gap = 14;
    const totalBars = data.length;
    
    // Draw using standard HTML vectors and responsive layout
    parent.innerHTML = `
      <div class="w-full h-full flex flex-col justify-end">
        <div class="flex items-end justify-around w-full h-[180px] relative">
          <!-- Horizontal Guideline grids -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            <div class="border-b border-indigo-400 w-full"></div>
            <div class="border-b border-indigo-400 w-full"></div>
            <div class="border-b border-indigo-400 w-full"></div>
            <div class="border-b border-indigo-400 w-full"></div>
          </div>

          ${data.map((item, idx) => {
            const heightPercent = (item.count / maxVal) * 100;
            const barHeight = Math.max(8, (item.count / maxVal) * 130); // scale max to 130px
            const isZero = item.count === 0;

            return `
              <div class="flex flex-col items-center group relative z-1">
                
                <!-- Tooltip on Hover -->
                <div class="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 bg-indigo-950 border border-indigo-400/40 text-white font-black text-[10px] px-2 py-1.5 rounded-lg shadow-xl z-10 pointer-events-none whitespace-nowrap">
                  ${item.count} Latihan
                </div>

                <!-- Styled Vertical Bar with gradient -->
                <div 
                  class="w-6 sm:w-8 rounded-t-lg transition-all duration-300 relative cursor-pointer ${
                    isZero 
                      ? "bg-indigo-950/40 border border-indigo-500/10 h-2" 
                      : "bg-gradient-to-t from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/10 group-hover:brightness-110 active:scale-95"
                  }"
                  style="height: ${barHeight}px;"
                >
                  ${!isZero ? `
                    <!-- Inner indicator glow top -->
                    <div class="absolute inset-x-0 top-0 h-1.5 bg-white/30 rounded-t-lg"></div>
                    <!-- Indicator count -->
                    <span class="absolute -top-5 inset-x-0 text-center font-bold text-[9px] text-indigo-200">
                      ${item.count}
                    </span>
                  ` : ""}
                </div>

                <!-- Label -->
                <span class="text-[9px] font-bold ${isZero ? "text-indigo-400/50" : "text-indigo-300"} mt-2 uppercase tracking-wide">
                  ${item.day.substring(0, 3)}
                </span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  private renderCategorySplit() {
    const parent = this.container.querySelector("#category-distribution-container") as HTMLElement;
    if (!parent) return;

    const data = getCategoryDistribution(this.workouts);
    if (data.length === 0) {
      parent.innerHTML = `
        <div class="text-center py-8 text-xs text-indigo-400/50">
          Belum ada latihan terselesaikan untuk dikelompokkan.
        </div>
      `;
      return;
    }

    const totalSets = data.reduce((sum, d) => sum + d.count, 0);

    parent.innerHTML = data.map((item) => {
      const percentage = totalSets > 0 ? Math.round((item.count / totalSets) * 100) : 0;
      
      // Select appropriate theme colors based on category
      let barColor = "from-blue-500 to-indigo-500";
      let badgeColor = "bg-blue-500/10 text-blue-300 border-blue-500/20";
      
      if (item.category === "Punggung") {
        barColor = "from-emerald-500 to-teal-500";
        badgeColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      } else if (item.category === "Kaki") {
        barColor = "from-amber-500 to-orange-500";
        badgeColor = "bg-amber-500/10 text-amber-300 border-amber-500/20";
      } else if (item.category === "Bahu") {
        barColor = "from-purple-500 to-fuchsia-500";
        badgeColor = "bg-purple-500/10 text-purple-300 border-purple-500/20";
      } else if (item.category === "Lengan") {
        barColor = "from-pink-500 to-rose-500";
        badgeColor = "bg-pink-500/10 text-pink-300 border-pink-500/20";
      } else if (item.category === "Inti") {
        barColor = "from-teal-500 to-cyan-500";
        badgeColor = "bg-teal-500/10 text-teal-300 border-teal-500/20";
      } else if (item.category === "Kardio") {
        barColor = "from-rose-500 to-red-500";
        badgeColor = "bg-rose-500/10 text-rose-300 border-rose-500/20";
      } else if (item.category === "Lainnya") {
        barColor = "from-slate-500 to-indigo-600";
        badgeColor = "bg-slate-500/10 text-slate-300 border-slate-500/20";
      }

      return `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${badgeColor}">
              ${item.category}
            </span>
            <div class="text-right text-[10px] text-indigo-300">
              <span class="text-white font-mono font-bold">${item.count} set</span> 
              <span class="text-indigo-400 font-mono">(${percentage}%)</span>
            </div>
          </div>
          <div class="w-full h-2 bg-indigo-950/50 rounded-full border border-indigo-500/5 overflow-hidden">
            <div 
              class="h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500" 
              style="width: ${percentage}%;"
            ></div>
          </div>
        </div>
      `;
    }).join("");
  }
}
