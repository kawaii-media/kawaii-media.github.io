/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Filter, Trash2, Edit3, CheckCircle2, Circle, Eye, Calendar, Sparkles, BookOpen } from "lucide-react";
import { WorkoutEntry, CATEGORIES } from "../types";
import { formatDateIndonesian, calculateVolume } from "../helpers";

interface WorkoutHistoryProps {
  workouts: WorkoutEntry[];
  onDeleteWorkout: (id: string) => void;
  onEditWorkout: (entry: WorkoutEntry) => void;
  onToggleSetComplete: (workoutId: string, setId: string) => void;
}

export default function WorkoutHistory({
  workouts,
  onDeleteWorkout,
  onEditWorkout,
  onToggleSetComplete
}: WorkoutHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter workouts based on search term and selected category
  const filteredWorkouts = workouts.filter((w) => {
    const matchesSearch =
      w.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.notes && w.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? w.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Group workouts by date (descending order)
  const groupedWorkouts: { [key: string]: WorkoutEntry[] } = {};
  filteredWorkouts.forEach((w) => {
    if (!groupedWorkouts[w.date]) {
      groupedWorkouts[w.date] = [];
    }
    groupedWorkouts[w.date].push(w);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => b.localeCompare(a));

  // Find color style for a category
  const getCategoryColor = (catName: string) => {
    const name = catName.toLowerCase();
    if (name === "dada") return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
    if (name === "punggung") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    if (name === "kaki") return "bg-violet-500/15 text-violet-300 border-violet-500/30";
    if (name === "bahu") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    if (name === "lengan") return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    if (name === "inti") return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
  };

  return (
    <div id="workout-history-section" className="space-y-6">
      
      {/* Search & Filter Header Grid */}
      <div className="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 shadow-xl p-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white font-display text-base">Riwayat Latihan</h3>
            <p className="text-xs text-indigo-300">Daftar semua aktivitas olahraga harian Anda</p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-72 flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl px-3 py-2 focus-within:border-indigo-400">
            <Search className="w-4 h-4 text-indigo-400 shrink-0" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Cari nama latihan atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent outline-none text-white placeholder-indigo-400/40"
            />
          </div>
        </div>

        {/* Category Filters (Horizontal Scrolling) */}
        <div>
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" />
            <span>Filter Berdasarkan Kelompok Otot</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-indigo-500/20">
            <button
              id="filter-cat-all"
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-md"
                  : "bg-indigo-950/50 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-900/40"
              }`}
            >
              Semua Otot
            </button>
            {CATEGORIES.map((cat) => (
              <button
                id={`filter-cat-${cat.name.toLowerCase()}`}
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-md"
                    : "bg-indigo-950/50 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-900/40"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div id="empty-history-card" className="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-dashed border-indigo-500/30 p-10 text-center flex flex-col items-center justify-center">
          <div className="p-4 bg-indigo-500/10 rounded-full mb-3 text-indigo-400">
            <Calendar className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-white text-sm font-display">Tidak Ada Riwayat Latihan</h4>
          <p className="text-xs text-indigo-300 mt-1 max-w-sm">
            {searchTerm || selectedCategory
              ? "Tidak ada latihan yang cocok dengan kriteria pencarian atau filter Anda."
              : "Belum ada latihan yang tercatat. Silakan tambah latihan Anda di form Catat Latihan!"}
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              id="reset-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-xs font-bold rounded-xl hover:bg-indigo-500/25 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => (
            <div id={`date-group-${dateStr}`} key={dateStr} className="space-y-3">
              
              {/* Date Section Header */}
              <div className="flex items-center gap-3 px-2">
                <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></div>
                <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider font-display">
                  {formatDateIndonesian(dateStr)}
                </h4>
                <div className="flex-1 h-[1px] bg-indigo-500/15"></div>
              </div>

              {/* Cards Grid for the Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedWorkouts[dateStr].map((workout) => {
                  const vol = calculateVolume(workout);
                  return (
                    <div
                      id={`workout-card-${workout.id}`}
                      key={workout.id}
                      className="bg-[#131a35]/65 backdrop-blur-md rounded-2xl border border-indigo-500/25 shadow-lg hover:border-indigo-400/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-indigo-500/15 flex items-start justify-between bg-indigo-950/40">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm leading-tight">
                              {workout.exerciseName}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(workout.category)}`}>
                              {workout.category}
                            </span>
                          </div>
                          {workout.notes && (
                            <div className="text-xs text-indigo-300 italic flex items-center gap-1 mt-1">
                              <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span>{workout.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Edit / Delete action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`edit-workout-${workout.id}-btn`}
                            onClick={() => onEditWorkout(workout)}
                            className="p-1.5 hover:bg-amber-500/15 text-slate-400 hover:text-amber-300 rounded-lg transition-colors"
                            title="Edit Latihan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-workout-${workout.id}-btn`}
                            onClick={() => {
                              if (window.confirm(`Hapus latihan "${workout.exerciseName}"?`)) {
                                onDeleteWorkout(workout.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 rounded-lg transition-colors"
                            title="Hapus Latihan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body - List of Sets */}
                      <div className="p-4 space-y-1.5 flex-1">
                        <div className="grid grid-cols-12 gap-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1 px-1">
                          <div className="col-span-1 text-center">Status</div>
                          <div className="col-span-2">Set</div>
                          <div className="col-span-4 text-center">Beban</div>
                          <div className="col-span-4 text-center">Repetisi</div>
                          <div className="col-span-1 text-center">Volume</div>
                        </div>

                        {workout.sets.map((set, idx) => (
                          <div
                            id={`workout-card-${workout.id}-set-${idx}`}
                            key={set.id}
                            className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all duration-150 text-xs font-semibold ${
                              set.completed
                                ? "bg-indigo-950/20 border-indigo-900/30 text-indigo-300/40 line-through"
                                : "bg-[#0e1432] border border-indigo-500/15 text-indigo-100"
                            }`}
                          >
                            {/* Complete Checkbox Toggle */}
                            <div className="col-span-1 flex justify-center">
                              <button
                                id={`toggle-complete-${workout.id}-${set.id}-btn`}
                                type="button"
                                onClick={() => onToggleSetComplete(workout.id, set.id)}
                                className={`transition-colors p-0.5 rounded-full cursor-pointer ${
                                  set.completed ? "text-emerald-400 hover:text-emerald-300" : "text-indigo-500/60 hover:text-indigo-400"
                                }`}
                                title={set.completed ? "Tandai Belum Selesai" : "Tandai Selesai"}
                              >
                                {set.completed ? (
                                  <CheckCircle2 className="w-4 h-4 fill-emerald-500/10 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <div className="col-span-2 text-indigo-300">
                              Set {idx + 1}
                            </div>

                            <div className="col-span-4 text-center">
                              {set.weight} <span className="text-[10px] text-indigo-400">kg</span>
                            </div>

                            <div className="col-span-4 text-center">
                              {set.reps} <span className="text-[10px] text-indigo-400">reps</span>
                            </div>

                            <div className="col-span-1 text-right text-[10px] text-indigo-400 font-mono pr-1">
                              {set.weight * set.reps}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer - Summary stats */}
                      <div className="px-4 py-2.5 bg-indigo-950/30 border-t border-indigo-500/15 flex items-center justify-between text-[11px] font-bold text-indigo-300">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Total Set: {workout.sets.length}</span>
                        </span>
                        <span>
                          Volume Total: <span className="text-white font-mono">{vol} kg</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
