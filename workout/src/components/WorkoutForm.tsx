/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Dumbbell, Calendar, Check, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { WorkoutEntry, ExerciseSet, COMMON_EXERCISES, CATEGORIES } from "../types";

interface WorkoutFormProps {
  onAddWorkout: (workout: Omit<WorkoutEntry, "id">) => void;
  editEntry: WorkoutEntry | null;
  onCancelEdit: () => void;
}

export default function WorkoutForm({ onAddWorkout, editEntry, onCancelEdit }: WorkoutFormProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [category, setCategory] = useState("Dada");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<Omit<ExerciseSet, "id">[]>([
    { reps: 10, weight: 0, completed: true }
  ]);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter common exercises based on the selected category
  const filteredCommonExercises = COMMON_EXERCISES.filter((ex) => ex.category === category);
  
  // Determine the value for the exercise select dropdown
  const isCommon = filteredCommonExercises.some((ex) => ex.name === exerciseName);
  const selectValue = isCommon ? exerciseName : (exerciseName === "" ? "" : "__custom__");

  // Set today's date as default in YYYY-MM-DD
  useEffect(() => {
    if (!editEntry) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [editEntry]);

  // Load entry if editing
  useEffect(() => {
    if (editEntry) {
      setExerciseName(editEntry.exerciseName);
      setCategory(editEntry.category);
      setDate(editEntry.date);
      setNotes(editEntry.notes || "");
      setSets(editEntry.sets.map((s) => ({ reps: s.reps, weight: s.weight, completed: s.completed })));
    } else {
      // Reset form
      setExerciseName("Bench Press"); // Default to first exercise of Dada
      setCategory("Dada");
      setNotes("");
      setSets([{ reps: 10, weight: 0, completed: true }]);
    }
  }, [editEntry]);

  // Handle category dropdown change
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const matched = COMMON_EXERCISES.filter((ex) => ex.category === newCat);
    if (matched.length > 0) {
      setExerciseName(matched[0].name);
    } else {
      setExerciseName("");
    }
  };

  // Handle exercise select dropdown change
  const handleExerciseDropdownChange = (val: string) => {
    if (val === "__custom__") {
      setExerciseName("");
    } else {
      setExerciseName(val);
    }
  };

  // Auto-set category when selecting common exercises
  const handleSelectQuickExercise = (name: string, cat: string) => {
    setExerciseName(name);
    setCategory(cat);
  };

  // Add a new set row. Pre-fill with the values of the last set for extreme convenience!
  const addSetRow = () => {
    const lastSet = sets[sets.length - 1] || { reps: 10, weight: 0, completed: true };
    setSets([...sets, { reps: lastSet.reps, weight: lastSet.weight, completed: true }]);
  };

  // Remove a set row
  const removeSetRow = (index: number) => {
    if (sets.length <= 1) {
      setError("Latihan harus memiliki minimal 1 set.");
      return;
    }
    const updated = sets.filter((_, i) => i !== index);
    setSets(updated);
  };

  // Update a single set's reps or weight
  const updateSetField = (index: number, field: "reps" | "weight", value: number) => {
    const updated = [...sets];
    updated[index] = {
      ...updated[index],
      [field]: isNaN(value) ? 0 : value
    };
    setSets(updated);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!exerciseName.trim()) {
      setError("Nama latihan tidak boleh kosong.");
      return;
    }

    if (!date) {
      setError("Tanggal harus ditentukan.");
      return;
    }

    // Ensure all sets have valid values
    for (let i = 0; i < sets.length; i++) {
      if (sets[i].reps <= 0) {
        setError(`Set #${i + 1} harus memiliki repetisi lebih dari 0.`);
        return;
      }
      if (sets[i].weight < 0) {
        setError(`Set #${i + 1} beban tidak boleh kurang dari 0.`);
        return;
      }
    }

    // Validated, submit
    onAddWorkout({
      date,
      exerciseName: exerciseName.trim(),
      category,
      sets: sets.map((s, idx) => ({
        id: editEntry?.sets[idx]?.id || `set-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        ...s
      })),
      notes: notes.trim() || undefined
    });

    if (!editEntry) {
      // Clear for new entry
      setExerciseName("");
      setNotes("");
      setSets([{ reps: 10, weight: 0, completed: true }]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <form id="workout-form" onSubmit={handleSubmit} className="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 shadow-xl p-6 transition-all duration-300">
      
      {/* Dynamic Header based on Edit/Create mode */}
      <div className="flex items-center justify-between mb-5 border-b border-indigo-500/15 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${editEntry ? "bg-amber-500/15 text-amber-400" : "bg-indigo-500/15 text-indigo-400"}`}>
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-display text-base">
              {editEntry ? "Ubah Latihan" : "Catat Latihan"}
            </h3>
            <p className="text-xs text-indigo-300">
              {editEntry ? "Perbarui detail latihan Anda" : "Tambah aktivitas latihan baru Anda"}
            </p>
          </div>
        </div>
        {editEntry && (
          <button
            id="cancel-edit-btn"
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-semibold text-rose-300 hover:text-rose-200 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
          >
            Batal
          </button>
        )}
      </div>

      {/* Success notification banner */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-medium animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Latihan berhasil disimpan! Lihat riwayat di bagian bawah.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workout Metadata Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
            Kelompok Otot (Kategori)
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-sm font-semibold text-white focus:border-indigo-400 outline-none transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name} className="bg-[#0e1432] text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
            Nama Latihan
          </label>
          {filteredCommonExercises.length > 0 ? (
            <div className="space-y-2">
              <select
                id="exercise-select"
                value={selectValue}
                onChange={(e) => handleExerciseDropdownChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-indigo-950/60 border border-indigo-500/30 text-white rounded-xl text-sm font-semibold focus:border-indigo-400 outline-none transition-colors"
              >
                <option value="" className="bg-[#0e1432] text-indigo-300">-- Pilih Latihan --</option>
                {filteredCommonExercises.map((ex) => (
                  <option key={ex.name} value={ex.name} className="bg-[#0e1432] text-white">
                    {ex.name}
                  </option>
                ))}
                <option value="__custom__" className="bg-[#0e1432] text-indigo-300">✎ Kustom (Ketik Sendiri)...</option>
              </select>
              
              {selectValue === "__custom__" && (
                <input
                  id="exercise-name-custom-input"
                  type="text"
                  required
                  placeholder="Ketik nama latihan kustom..."
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-4 py-2 bg-indigo-950/60 border border-indigo-500/30 text-white rounded-xl text-sm font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors placeholder-indigo-300/40"
                />
              )}
            </div>
          ) : (
            <input
              id="exercise-name-input"
              type="text"
              required
              placeholder="Contoh: Yoga, Lari, dll."
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full px-4 py-2.5 bg-indigo-950/60 border border-indigo-500/30 text-white rounded-xl text-sm font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-colors placeholder-indigo-300/40"
            />
          )}
        </div>
      </div>

      {/* Quick Select Exercises (Horizontal Scrolling Chips) */}
      {!editEntry && (
        <div className="mb-5">
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Pilih Cepat Latihan Populer</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-500/20">
            {COMMON_EXERCISES.map((ex) => (
              <button
                id={`quick-ex-${ex.name.replace(/\s+/g, '-').toLowerCase()}`}
                key={ex.name}
                type="button"
                onClick={() => handleSelectQuickExercise(ex.name, ex.category)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                  exerciseName === ex.name
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-sm"
                    : "bg-indigo-950/50 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/45 hover:bg-indigo-900/45"
                }`}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sets Manager Cardboard */}
      <div className="mb-5 border border-indigo-500/15 rounded-2xl p-4 bg-indigo-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Pengaturan Set Latihan
          </div>
          <button
            id="add-set-row-btn"
            type="button"
            onClick={addSetRow}
            className="flex items-center gap-1 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg transition-colors border border-indigo-500/35"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Set</span>
          </button>
        </div>

        {/* Set Header Labels */}
        <div className="grid grid-cols-12 gap-2 mb-2 text-center text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2">
          <div className="col-span-2 text-left">Set</div>
          <div className="col-span-5">Beban (Kg)</div>
          <div className="col-span-4">Repetisi</div>
          <div className="col-span-1"></div>
        </div>

        {/* Set Items list */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {sets.map((set, idx) => (
            <div
              id={`set-row-${idx}`}
              key={idx}
              className="grid grid-cols-12 gap-2 items-center bg-[#0d1330] border border-indigo-500/20 rounded-xl p-2 shadow-sm"
            >
              <div className="col-span-2 text-xs font-bold text-indigo-300 pl-1">
                #{idx + 1}
              </div>

              {/* Weight Input */}
              <div className="col-span-5 flex items-center gap-1 bg-indigo-950/40 rounded-lg px-2 border border-indigo-500/20 focus-within:border-indigo-400">
                <input
                  id={`set-${idx}-weight-input`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight || ""}
                  onChange={(e) => updateSetField(idx, "weight", parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                />
                <span className="text-[10px] font-semibold text-indigo-400 uppercase">kg</span>
              </div>

              {/* Reps Input */}
              <div className="col-span-4 flex items-center gap-1 bg-indigo-950/40 rounded-lg px-2 border border-indigo-500/20 focus-within:border-indigo-400">
                <input
                  id={`set-${idx}-reps-input`}
                  type="number"
                  min="1"
                  step="1"
                  value={set.reps || ""}
                  onChange={(e) => updateSetField(idx, "reps", parseInt(e.target.value))}
                  placeholder="10"
                  className="w-full text-center py-1.5 text-xs font-bold text-white bg-transparent outline-none"
                />
              </div>

              {/* Delete button */}
              <div className="col-span-1 flex justify-center">
                <button
                  id={`delete-set-${idx}-btn`}
                  type="button"
                  onClick={() => removeSetRow(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Hapus Set"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date & Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tanggal</span>
          </label>
          <input
            id="workout-date-input"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Catatan Latihan (Opsional)</span>
          </label>
          <input
            id="workout-notes-input"
            type="text"
            placeholder="Contoh: RPE 8.5, bar speed cepat, dll."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs font-semibold text-white focus:border-indigo-400 outline-none transition-colors placeholder-indigo-300/40"
          />
        </div>
      </div>

      {/* Submit Action */}
      <button
        id="submit-workout-btn"
        type="submit"
        className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.98] cursor-pointer ${
          editEntry
            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 shadow-lg shadow-amber-500/15"
            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 shadow-lg shadow-indigo-500/15"
        }`}
      >
        {editEntry ? "Simpan Perubahan Latihan" : "Simpan Latihan Baru"}
      </button>
    </form>
  );
}
