/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExerciseSet {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number; // duration in seconds (for cardio / plank)
  distance?: number; // distance in km (for cardio)
  completed: boolean;
}

export interface WorkoutEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  exerciseName: string;
  category: string; // Muscle group: "Dada", "Punggung", "Kaki", "Bahu", "Lengan", "Inti", "Kardio", "Lainnya"
  sets: ExerciseSet[];
  notes?: string;
  caloriesBurned?: number; // Estimated or manual calories burned
}

export interface TimerState {
  duration: number; // total seconds
  timeLeft: number; // current remaining seconds
  isRunning: boolean;
}

export const COMMON_EXERCISES = [
  { name: "Bench Press", category: "Dada" },
  { name: "Push Up", category: "Dada" },
  { name: "Chest Fly", category: "Dada" },
  { name: "Squat", category: "Kaki" },
  { name: "Deadlift", category: "Punggung" },
  { name: "Pull Up", category: "Punggung" },
  { name: "Lat Pulldown", category: "Punggung" },
  { name: "Overhead Press", category: "Bahu" },
  { name: "Lateral Raise", category: "Bahu" },
  { name: "Bicep Curl", category: "Lengan" },
  { name: "Tricep Pushdown", category: "Lengan" },
  { name: "Plank", category: "Inti" },
  { name: "Crunches", category: "Inti" },
  { name: "Lari / Treadmill", category: "Kardio" },
  { name: "Bersepeda", category: "Kardio" },
];

export const CATEGORIES = [
  { name: "Dada", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300" },
  { name: "Punggung", color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { name: "Kaki", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300" },
  { name: "Bahu", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300" },
  { name: "Lengan", color: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300" },
  { name: "Inti", color: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300" },
  { name: "Kardio", color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300" },
  { name: "Lainnya", color: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300" },
];
