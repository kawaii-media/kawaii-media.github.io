/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Flame, Dumbbell, Award, Layers, TrendingUp, CalendarDays, Sparkles } from "lucide-react";
import { WorkoutEntry, CATEGORIES } from "../types";
import { calculateStreak, calculateVolume, getWeeklyDistribution, getCategoryDistribution } from "../helpers";

interface StatsDashboardProps {
  workouts: WorkoutEntry[];
}

export default function StatsDashboard({ workouts }: StatsDashboardProps) {
  const streak = calculateStreak(workouts);
  const totalWorkouts = workouts.length;

  // Calculate total training volume (completed sets only)
  const totalVolume = workouts.reduce((sum, w) => sum + calculateVolume(w), 0);

  // Calculate total completed sets
  const totalSets = workouts.reduce((sum, w) => sum + w.sets.filter((s) => s.completed).length, 0);

  // Get weekly data distribution
  const weeklyData = getWeeklyDistribution(workouts);

  // Get muscle category distribution
  const categoryData = getCategoryDistribution(workouts);

  // Find max count to scale visual bars
  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 1);
  const maxCategoryCount = Math.max(...categoryData.map((c) => c.count), 1);

  // Helper for category color class
  const getProgressColor = (catName: string) => {
    switch (catName) {
      case "Dada": return "bg-indigo-400";
      case "Punggung": return "bg-emerald-400";
      case "Kaki": return "bg-violet-400";
      case "Bahu": return "bg-amber-400";
      case "Lengan": return "bg-rose-400";
      case "Inti": return "bg-sky-400";
      case "Kardio": return "bg-fuchsia-400";
      default: return "bg-indigo-300";
    }
  };

  return (
    <div id="stats-dashboard-container" className="space-y-6">
      
      {/* 4-Column Bento Box Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Bento Box */}
        <div id="stat-streak-box" className="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
            <Flame className={`w-6 h-6 ${streak > 0 ? 'fill-indigo-400 text-indigo-400 animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Streak Hari</div>
            <div className="text-xl font-extrabold text-white font-display mt-0.5">
              {streak} <span className="text-xs font-semibold text-indigo-200">hari</span>
            </div>
            <div className="text-[9px] text-indigo-300/80 mt-0.5 truncate">
              {streak > 0 ? "Bagus! Pertahankan" : "Ayo mulai hari ini!"}
            </div>
          </div>
        </div>

        {/* Total Workouts Bento Box */}
        <div id="stat-workouts-box" className="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Total Latihan</div>
            <div className="text-xl font-extrabold text-white font-display mt-0.5">
              {totalWorkouts} <span className="text-xs font-semibold text-indigo-200">kali</span>
            </div>
            <div className="text-[9px] text-indigo-300/80 mt-0.5 truncate">
              Aktivitas tercatat
            </div>
          </div>
        </div>

        {/* Total Volume Bento Box */}
        <div id="stat-volume-box" className="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Total Volume</div>
            <div className="text-xl font-extrabold text-white font-display mt-0.5">
              {totalVolume.toLocaleString("id-ID")} <span className="text-xs font-semibold text-indigo-200">kg</span>
            </div>
            <div className="text-[9px] text-indigo-300/80 mt-0.5 truncate">
              Beban kumulatif
            </div>
          </div>
        </div>

        {/* Total Sets Bento Box */}
        <div id="stat-sets-box" className="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Total Set Selesai</div>
            <div className="text-xl font-extrabold text-white font-display mt-0.5">
              {totalSets} <span className="text-xs font-semibold text-indigo-200">set</span>
            </div>
            <div className="text-[9px] text-indigo-300/80 mt-0.5 truncate">
              Repetisi berhasil
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Weekly Frequency vs Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly frequency display */}
        <div className="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 shadow-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-indigo-500/15 pb-3">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-white text-sm font-display">Frekuensi Latihan Mingguan</h4>
            </div>

            {/* Custom SVG/HTML Bar Chart for Weekly Activity */}
            <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4 px-2">
              {weeklyData.map((d) => {
                const percent = (d.count / maxWeeklyCount) * 100;
                return (
                  <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group relative">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-30">
                      {d.count} latihan
                    </div>

                    {/* Bar background and filled progress */}
                    <div className="w-full bg-indigo-950/45 border border-indigo-500/15 rounded-lg h-24 relative overflow-hidden flex items-end">
                      <div
                        id={`weekly-bar-${d.day.toLowerCase()}`}
                        style={{ height: `${percent === 0 ? 0 : Math.max(8, percent)}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          d.count > 0 ? "bg-gradient-to-t from-indigo-500 to-purple-500 hover:brightness-110 shadow-md shadow-indigo-500/20" : "bg-transparent"
                        }`}
                      ></div>
                    </div>

                    {/* Day name */}
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      {d.day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-[10px] text-indigo-300 mt-4 pt-2 border-t border-indigo-500/15 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Menampilkan data latihan dalam 7 hari terakhir.</span>
          </div>
        </div>

        {/* Muscle group split distribution */}
        <div className="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 shadow-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-indigo-500/15 pb-3">
              <Award className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-sm font-display">Distribusi Target Otot</h4>
            </div>

            {/* Muscle Split Progress list */}
            {categoryData.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-indigo-300 text-xs py-10">
                <span>Belum ada data distribusi.</span>
                <span className="text-[10px] mt-1 text-indigo-400/80">Mulailah mencatat latihan untuk melihat pembagian porsi latihan Anda!</span>
              </div>
            ) : (
              <div className="space-y-3.5 pr-1 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20">
                {categoryData.map((c) => {
                  const percent = (c.count / maxCategoryCount) * 100;
                  return (
                    <div id={`muscle-dist-${c.category.toLowerCase()}`} key={c.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-100">
                        <span>{c.category}</span>
                        <span className="text-indigo-300 text-[10px]">{c.count} set</span>
                      </div>
                      
                      {/* Custom progress bar */}
                      <div className="h-2 w-full bg-indigo-950/50 rounded-full overflow-hidden">
                        <div
                          id={`muscle-bar-${c.category.toLowerCase()}`}
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(c.category)}`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[10px] text-indigo-300 mt-4 pt-2 border-t border-indigo-500/15">
            Kalkulasi didasarkan pada jumlah set selesai untuk setiap kelompok otot.
          </div>
        </div>
      </div>
    </div>
  );
}
