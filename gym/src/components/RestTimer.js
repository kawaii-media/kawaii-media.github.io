/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSvgIcon } from "../icons.js";
import { playBeep } from "../helpers.js";

export class RestTimer {
  duration = 60; // default 60s
  timeLeft = 60;
  isRunning = false;
  intervalId = null;
  autoStart = false;
  history = [];

  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Load local storage states
    this.autoStart = localStorage.getItem("fit_track_timer_autostart") === "true";
    try {
      const savedHistory = localStorage.getItem("fit_track_timer_history");
      if (savedHistory) this.history = JSON.parse(savedHistory);
    } catch {
      this.history = [];
    }

    this.render();
  }

  getIsAutoStartEnabled() {
    return this.autoStart;
  }

  startTimer(seconds) {
    if (seconds) {
      this.duration = seconds;
      this.timeLeft = seconds;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.isRunning = true;
    this.intervalId = window.setInterval(() => this.tick(), 1000);
    this.updateUI();
  }

  tick() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      if (this.timeLeft === 0) {
        this.completeTimer();
      } else {
        this.updateUI();
      }
    }
  }

  completeTimer() {
    this.stopTimerInterval();
    this.isRunning = false;
    
    // Play beep alarm
    playBeep();

    // Log in history
    this.logTimer(this.duration, "Selesai");

    // Reset values to full duration
    this.timeLeft = this.duration;

    this.updateUI();
    this.renderHistory();
  }

  stopTimerInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  cancelTimer() {
    if (this.isRunning) {
      this.logTimer(this.duration - this.timeLeft, "Dibatalkan");
    }
    this.stopTimerInterval();
    this.isRunning = false;
    this.timeLeft = this.duration;
    this.updateUI();
    this.renderHistory();
  }

  togglePlayPause() {
    if (this.isRunning) {
      this.stopTimerInterval();
      this.isRunning = false;
    } else {
      this.isRunning = true;
      this.intervalId = window.setInterval(() => this.tick(), 1000);
    }
    this.updateUI();
  }

  adjustTime(seconds) {
    const newTime = this.timeLeft + seconds;
    if (newTime > 0) {
      this.timeLeft = newTime;
      // If expanding beyond duration, boost original duration
      if (this.timeLeft > this.duration) {
        this.duration = this.timeLeft;
      }
      this.updateUI();
    }
  }

  setPreset(seconds) {
    this.duration = seconds;
    this.timeLeft = seconds;
    // If it was running, restart with new time
    if (this.isRunning) {
      this.startTimer(seconds);
    } else {
      this.updateUI();
    }
  }

  logTimer(duration, status) {
    if (duration <= 0) return;
    
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5); // "HH:MM"
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short" }); // "15 Jul"
    
    const log = {
      id: `timer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      duration,
      date: `${dateStr}, ${timeStr}`,
      status
    };

    this.history.unshift(log);
    // Limit to 20 entries
    if (this.history.length > 20) this.history.pop();

    localStorage.setItem("fit_track_timer_history", JSON.stringify(this.history));
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem("fit_track_timer_history");
    this.renderHistory();
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  updateUI() {
    // Update play pause button icon/text
    const playPauseBtn = this.container.querySelector("#timer-play-pause-btn");
    if (playPauseBtn) {
      playPauseBtn.innerHTML = this.isRunning
        ? `${getSvgIcon("pause", "w-4 h-4")} <span>Jeda</span>`
        : `${getSvgIcon("play", "w-4 h-4")} <span>Mulai</span>`;
      
      if (this.isRunning) {
        playPauseBtn.className = "flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer";
      } else {
        playPauseBtn.className = "flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer";
      }
    }

    // Update timer text
    const timerDisplay = this.container.querySelector("#timer-countdown-display");
    if (timerDisplay) {
      timerDisplay.innerText = this.formatTime(this.timeLeft);
    }

    // Update SVG progress ring
    const ring = this.container.querySelector("#timer-progress-ring");
    if (ring) {
      const circumference = 339.292; // 2 * pi * 54
      const percent = this.timeLeft / this.duration;
      const offset = circumference - percent * circumference;
      ring.setAttribute("stroke-dashoffset", offset.toString());
    }
  }

  renderHistory() {
    const list = this.container.querySelector("#timer-history-list");
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = `
        <div class="text-center py-4 text-[10px] text-indigo-400/40">
          Belum ada riwayat istirahat.
        </div>
      `;
      return;
    }

    list.innerHTML = this.history.map((log) => {
      const isDone = log.status === "Selesai";
      return `
        <div class="flex items-center justify-between text-[11px] p-2 bg-indigo-950/25 border border-indigo-500/10 rounded-xl">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${isDone ? "bg-emerald-400" : "bg-rose-400"}"></span>
            <span class="font-bold text-white">${log.duration}s istirahat</span>
            <span class="text-[9px] text-indigo-400">${log.date}</span>
          </div>
          <span class="font-semibold ${isDone ? "text-emerald-300" : "text-rose-300"} text-[10px]">
            ${log.status}
          </span>
        </div>
      `;
    }).join("");
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-[#131a35]/65 backdrop-blur-md rounded-3xl border border-indigo-500/25 p-5 shadow-xl">
        
        <!-- Timer Header -->
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-indigo-500/10">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              ${getSvgIcon("sparkles", "w-5 h-5")}
            </div>
            <div>
              <h3 class="font-extrabold text-white font-display text-sm tracking-wide">
                Timer Istirahat
              </h3>
              <p class="text-xs text-indigo-300">Pantau waktu jeda antar set Anda</p>
            </div>
          </div>
          <button
            id="timer-sound-test-btn"
            type="button"
            class="p-2 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/15 rounded-xl text-indigo-300 hover:text-indigo-100 transition-colors cursor-pointer"
            title="Tes Suara Alarm"
          >
            ${getSvgIcon("volume2", "w-4 h-4")}
          </button>
        </div>

        <!-- Timer Circle & Main View -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
          
          <!-- Circle Clock -->
          <div class="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg class="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="rgba(99, 102, 241, 0.08)"
                stroke-width="6"
                fill="transparent"
              />
              <circle
                id="timer-progress-ring"
                cx="64"
                cy="64"
                r="54"
                stroke="url(#timer-grad)"
                stroke-width="7"
                fill="transparent"
                stroke-dasharray="339.292"
                stroke-dashoffset="0"
                stroke-linecap="round"
                class="transition-all duration-300"
              />
              <defs>
                <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span id="timer-countdown-display" class="text-3xl font-black font-mono text-white tracking-tight">
                ${this.formatTime(this.timeLeft)}
              </span>
            </div>
          </div>

          <!-- Adjusters & Presets -->
          <div class="w-full flex-1 space-y-3">
            
            <!-- Quick Preset Grid -->
            <div class="grid grid-cols-3 gap-1.5">
              <button data-seconds="30" class="timer-preset-btn py-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/45 border border-indigo-500/15 rounded-xl transition-all cursor-pointer">30d</button>
              <button data-seconds="60" class="timer-preset-btn py-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/45 border border-indigo-500/15 rounded-xl transition-all cursor-pointer">60d</button>
              <button data-seconds="90" class="timer-preset-btn py-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/45 border border-indigo-500/15 rounded-xl transition-all cursor-pointer">90d</button>
              <button data-seconds="120" class="timer-preset-btn py-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/45 border border-indigo-500/15 rounded-xl transition-all cursor-pointer">2m</button>
              <button data-seconds="180" class="timer-preset-btn py-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/45 border border-indigo-500/15 rounded-xl transition-all cursor-pointer">3m</button>
              <button data-seconds="300" class="timer-preset-btn py-1.5 text-xs font-bold text-indigo-300 bg-indigo-950/45 hover:bg-indigo-900/45 border border-indigo-500/15 rounded-xl transition-all cursor-pointer">5m</button>
            </div>

            <!-- Granular adjustments (+15s / -15s) -->
            <div class="flex gap-2">
              <button id="timer-minus-15-btn" class="flex-1 py-2 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer">-15s</button>
              <button id="timer-plus-15-btn" class="flex-1 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all cursor-pointer">+15s</button>
            </div>
          </div>
        </div>

        <!-- Controls Actions Row -->
        <div class="flex gap-3 mb-5 mt-2">
          <button id="timer-play-pause-btn" class="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
            ${getSvgIcon("play", "w-4 h-4")}
            <span>Mulai</span>
          </button>
          
          <button id="timer-reset-btn" class="px-5 py-3 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-2xl hover:bg-indigo-900 flex items-center justify-center transition-all cursor-pointer" title="Batalkan Timer">
            ${getSvgIcon("rotateCcw", "w-4 h-4")}
          </button>
        </div>

        <!-- Settings Settings checkbox -->
        <div class="flex items-center gap-2 px-1 py-1.5 border-t border-b border-indigo-500/10 mb-4">
          <label class="relative flex items-center gap-2 text-[11px] font-bold text-indigo-200 cursor-pointer select-none">
            <input
              id="timer-autostart-checkbox"
              type="checkbox"
              ${this.autoStart ? "checked" : ""}
              class="w-3.5 h-3.5 bg-indigo-950/60 border border-indigo-500/30 rounded-md outline-none accent-indigo-500 cursor-pointer"
            />
            <span>Mulai istirahat otomatis saat mencentang set riwayat</span>
          </label>
        </div>

        <!-- Timer History logs -->
        <div class="space-y-2 mt-4">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Riwayat Istirahat</span>
            ${this.history.length > 0 ? `
              <button id="clear-timer-history-btn" class="text-[9px] font-semibold text-rose-300 hover:text-rose-200 cursor-pointer">Hapus Semua</button>
            ` : ""}
          </div>
          <div id="timer-history-list" class="space-y-1.5 max-h-24 overflow-y-auto pr-1"></div>
        </div>

      </div>
    `;

    // Bind Event Listeners
    const playPauseBtn = this.container.querySelector("#timer-play-pause-btn");
    playPauseBtn.addEventListener("click", () => this.togglePlayPause());

    const resetBtn = this.container.querySelector("#timer-reset-btn");
    resetBtn.addEventListener("click", () => this.cancelTimer());

    const minusBtn = this.container.querySelector("#timer-minus-15-btn");
    minusBtn.addEventListener("click", () => this.adjustTime(-15));

    const plusBtn = this.container.querySelector("#timer-plus-15-btn");
    plusBtn.addEventListener("click", () => this.adjustTime(15));

    const testBtn = this.container.querySelector("#timer-sound-test-btn");
    testBtn.addEventListener("click", () => playBeep());

    const autostartCheck = this.container.querySelector("#timer-autostart-checkbox");
    autostartCheck.addEventListener("change", (e) => {
      this.autoStart = e.target.checked;
      localStorage.setItem("fit_track_timer_autostart", this.autoStart.toString());
    });

    // Preset buttons binding
    this.container.querySelectorAll(".timer-preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget;
        const seconds = parseInt(el.dataset.seconds || "60");
        this.setPreset(seconds);
      });
    });

    const clearHistoryBtn = this.container.querySelector("#clear-timer-history-btn");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => this.clearHistory());
    }

    // Secondary UI initial draws
    this.updateUI();
    this.renderHistory();
  }
}
