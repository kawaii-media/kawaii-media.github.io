/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkoutEntry } from "./types";

// Play a loud, repeating alarm sound using the Web Audio API
export function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    const playPulse = (startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Use "triangle" wave for a sharp, piercing digital alarm sound that stands out
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1000, ctx.currentTime + startTime); // Loud 1kHz frequency
      
      // Loud volume but clean and safe
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.02); // Fast attack
      gain.gain.setValueAtTime(0.3, ctx.currentTime + startTime + duration - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration); // Fast decay to prevent clicks
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Schedule 4 cycles of double-beeps (total duration of about 2.2 seconds)
    // "Beep Beep ... Beep Beep ... Beep Beep ... Beep Beep"
    const alarmBeeps = [
      { start: 0.0, dur: 0.15 },
      { start: 0.2, dur: 0.15 },
      
      { start: 0.6, dur: 0.15 },
      { start: 0.8, dur: 0.15 },
      
      { start: 1.2, dur: 0.15 },
      { start: 1.4, dur: 0.15 },
      
      { start: 1.8, dur: 0.15 },
      { start: 2.0, dur: 0.15 }
    ];

    alarmBeeps.forEach(b => {
      playPulse(b.start, b.dur);
    });
  } catch (err) {
    console.warn("Failed to play synthesized alarm:", err);
  }
}

// Calculate the active workout streak (consecutive days of workouts)
export function calculateStreak(workouts: WorkoutEntry[]): number {
  if (workouts.length === 0) return 0;

  // Get unique dates of workouts
  const uniqueDates = Array.from(new Set(workouts.map((w) => w.date))).sort();
  if (uniqueDates.length === 0) return 0;

  // Convert dates to absolute timestamps at midnight in local time
  const dates = uniqueDates.map((dStr) => {
    const [year, month, day] = dStr.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  });

  const oneDayMs = 24 * 60 * 60 * 1000;
  
  // Set current date at midnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - oneDayMs;

  // Find if they have a workout today or yesterday to continue the streak
  const lastWorkoutDate = dates[dates.length - 1];
  if (lastWorkoutDate !== today && lastWorkoutDate !== yesterday) {
    return 0; // Streak has broken
  }

  let streak = 1;
  let currentDateIdx = dates.length - 1;

  while (currentDateIdx > 0) {
    const diff = dates[currentDateIdx] - dates[currentDateIdx - 1];
    if (diff === oneDayMs) {
      streak++;
      currentDateIdx--;
    } else if (diff === 0) {
      // Same day, skip
      currentDateIdx--;
    } else {
      // Gap in streak
      break;
    }
  }

  return streak;
}

// Calculate total volume for a single workout entry (sum of reps * weight for completed sets)
export function calculateVolume(entry: WorkoutEntry): number {
  return entry.sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.reps * s.weight, 0);
}

// Format a date string (YYYY-MM-DD) to Indonesian format (e.g., "Rabu, 15 Juli 2026")
export function formatDateIndonesian(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch (err) {
    return dateStr;
  }
}

// Get weekly distribution (last 7 days counts)
export function getWeeklyDistribution(workouts: WorkoutEntry[]) {
  const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const result = daysOfWeek.map((day) => ({ day, count: 0 }));

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  workouts.forEach((w) => {
    const [year, month, day] = w.date.split("-").map(Number);
    const wDate = new Date(year, month - 1, day);
    if (wDate >= oneWeekAgo) {
      const dayName = daysOfWeek[wDate.getDay()];
      const found = result.find((r) => r.day === dayName);
      if (found) found.count += 1;
    }
  });

  // Reorder so that "Monday" (Senin) is first or current day is last
  // Let's keep it standard: Monday to Sunday
  const mondayFirstOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  return mondayFirstOrder.map((day) => {
    const found = result.find((r) => r.day === day);
    return { day, count: found ? found.count : 0 };
  });
}

// Get muscle group target distribution
export function getCategoryDistribution(workouts: WorkoutEntry[]) {
  const categories = ["Dada", "Punggung", "Kaki", "Bahu", "Lengan", "Inti", "Kardio", "Lainnya"];
  const distribution = categories.map((cat) => ({ category: cat, count: 0 }));

  workouts.forEach((w) => {
    const found = distribution.find((d) => d.category === w.category);
    if (found) {
      found.count += w.sets.length; // Count total sets performed for this muscle group
    }
  });

  return distribution.filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
}
