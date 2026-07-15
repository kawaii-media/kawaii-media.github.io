/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Plus, Volume2, BellRing, Sparkles } from "lucide-react";
import { playBeep } from "../helpers";

export default function RestTimer() {
  const [duration, setDuration] = useState<number>(60); // default 60s
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<string>("1");
  const [customSeconds, setCustomSeconds] = useState<string>("00");
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer countdown tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playBeep();
            triggerVisualAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const triggerVisualAlert = () => {
    setShowNotification(true);
    // Vibrate device if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    setTimeout(() => {
      setShowNotification(false);
    }, 6000);
  };

  // Toggle play/pause
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  // Skip / Zero timer
  const skipTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    playBeep();
    triggerVisualAlert();
  };

  // Select preset duration
  const selectPreset = (seconds: number) => {
    setIsRunning(false);
    setDuration(seconds);
    setTimeLeft(seconds);
  };

  // Add time to current timer (+15s or +30s)
  const addTime = (seconds: number) => {
    setTimeLeft((prev) => {
      const newTime = prev + seconds;
      if (!isRunning && prev === 0) {
        // If timer was finished, reset duration too
        setDuration(seconds);
        return seconds;
      }
      setDuration((d) => Math.max(d, newTime));
      return newTime;
    });
  };

  // Apply custom timer settings
  const applyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = Math.max(0, parseInt(customMinutes) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(customSeconds) || 0));
    
    const totalSecs = mins * 60 + secs;
    if (totalSecs > 0) {
      setIsRunning(false);
      setDuration(totalSecs);
      setTimeLeft(totalSecs);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;

  return (
    <div id="rest-timer-container" className="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 shadow-xl p-6 relative overflow-hidden transition-all duration-300">
      
      {/* Alert Overlay when finished */}
      {showNotification && (
        <div className="absolute inset-0 bg-emerald-600/95 flex flex-col items-center justify-center text-white z-20 animate-fade-in p-4 text-center">
          <div className="bg-white/20 p-4 rounded-full mb-3 animate-bounce">
            <BellRing className="w-10 h-10 text-white" />
          </div>
          <h4 className="text-xl font-bold font-display tracking-tight">Waktu Istirahat Selesai!</h4>
          <p className="text-sm text-emerald-100 mt-1">Kembali ke set berikutnya sekarang! 💪</p>
          <button 
            id="dismiss-timer-alert-btn"
            onClick={() => setShowNotification(false)}
            className="mt-4 px-5 py-2 bg-white text-emerald-800 font-semibold rounded-xl hover:bg-emerald-50 transition-colors text-sm shadow-md"
          >
            Mulai Set Baru
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-indigo-500/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-display text-base">Timer Istirahat</h3>
            <p className="text-xs text-indigo-300">Atur waktu jeda antar set latihan</p>
          </div>
        </div>
        <button
          id="test-beep-btn"
          onClick={playBeep}
          title="Tes suara beep"
          className="p-2 hover:bg-indigo-950 text-indigo-300 hover:text-indigo-100 rounded-xl transition-all duration-200 border border-indigo-500/20 flex items-center gap-1.5 text-xs font-medium"
        >
          <Volume2 className="w-4 h-4" />
          <span>Tes Suara</span>
        </button>
      </div>

      {/* Main Timer Display with circular track */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Circular progress SVG */}
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-indigo-950/55 fill-transparent"
              strokeWidth="6"
            />
            {/* Foreground circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-indigo-400 fill-transparent transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time text overlay */}
          <div className="text-center z-10">
            <div className={`text-4xl font-black font-mono tracking-tight transition-colors duration-300 ${isRunning ? 'text-indigo-400 animate-pulse' : timeLeft === 0 ? 'text-emerald-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-[10px] font-semibold text-indigo-300 tracking-wider uppercase mt-1">
              {isRunning ? "Istirahat..." : timeLeft === 0 ? "Selesai" : "Siap"}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          id="reset-timer-btn"
          onClick={resetTimer}
          title="Reset"
          className="p-3 bg-indigo-950/45 hover:bg-indigo-900/50 text-indigo-300 rounded-2xl transition-all active:scale-95 border border-indigo-500/30 shadow-sm"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          id="toggle-timer-btn"
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-md ${
            isRunning 
              ? "bg-slate-800 hover:bg-slate-700 hover:shadow-lg" 
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/20"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Mulai</span>
            </>
          )}
        </button>

        <button
          id="skip-timer-btn"
          onClick={skipTimer}
          title="Skip"
          className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-2xl transition-all active:scale-95 font-semibold text-xs border border-rose-500/30 shadow-sm"
        >
          Lewati
        </button>
      </div>

      {/* Preset Quick Select */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-indigo-300 tracking-wide uppercase mb-2">Preset Cepat</div>
        <div className="grid grid-cols-5 gap-1.5">
          {[30, 45, 60, 90, 120].map((preset) => (
            <button
              id={`preset-${preset}-btn`}
              key={preset}
              onClick={() => selectPreset(preset)}
              className={`py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
                duration === preset
                  ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-300"
                  : "bg-indigo-950/40 border-indigo-500/15 hover:bg-indigo-900/40 text-indigo-300"
              }`}
            >
              {preset}s
            </button>
          ))}
        </div>
      </div>

      {/* Incremental Adjusters */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <button
          id="add-15s-btn"
          onClick={() => addTime(15)}
          className="flex items-center justify-center gap-1 py-2 text-xs font-bold bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 rounded-xl transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>15 Detik</span>
        </button>
        <button
          id="add-30s-btn"
          onClick={() => addTime(30)}
          className="flex items-center justify-center gap-1 py-2 text-xs font-bold bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 rounded-xl transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>30 Detik</span>
        </button>
      </div>

      {/* Custom Timer Input */}
      <form onSubmit={applyCustomTime} className="border-t border-indigo-500/15 pt-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
            Kustom Waktu
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="custom-minutes-input"
              type="number"
              min="0"
              max="59"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Min"
              className="w-full text-center py-1.5 px-2 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-xs font-bold text-white focus:border-indigo-400 outline-none"
            />
            <span className="text-indigo-400 font-bold">:</span>
            <input
              id="custom-seconds-input"
              type="number"
              min="0"
              max="59"
              value={customSeconds}
              onChange={(e) => setCustomSeconds(e.target.value)}
              placeholder="Det"
              className="w-full text-center py-1.5 px-2 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-xs font-bold text-white focus:border-indigo-400 outline-none"
            />
          </div>
        </div>
        <button
          id="apply-custom-timer-btn"
          type="submit"
          className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
        >
          Terapkan
        </button>
      </form>
    </div>
  );
}
