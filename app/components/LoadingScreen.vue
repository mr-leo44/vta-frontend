<template>
  <div class="loading-root">
    <!-- Dot-grid background identical to login left panel -->
    <div class="dot-grid" />

    <!-- Ambient glows -->
    <div class="glow glow-top" />
    <div class="glow glow-bottom" />

    <!-- Center card -->
    <div class="card">

      <!-- Logo -->
      <div class="logo-wrap">
        <div class="logo-ring logo-ring-1" />
        <div class="logo-ring logo-ring-2" />
        <div class="logo-box">
          <span class="logo-text">VTA</span>
        </div>
      </div>

      <!-- Radar -->
      <div class="radar-wrap" aria-hidden="true">
        <div class="radar-circle radar-c1" />
        <div class="radar-circle radar-c2" />
        <div class="radar-circle radar-c3" />
        <div class="radar-line radar-h" />
        <div class="radar-line radar-v" />
        <div class="radar-sweep" />
        <span class="blip blip-a" />
        <span class="blip blip-b" />
        <span class="blip blip-c" />
      </div>

      <!-- Progress -->
      <div class="progress-track">
        <div class="progress-bar" />
      </div>

      <!-- Text -->
      <div class="text-block">
        <p class="message">{{ message || 'Vérification en cours…' }}</p>
        <p class="sub">Système de gestion du trafic aérien</p>
      </div>

      <!-- Status badge -->
      <div class="badge">
        <span class="badge-dot" />
        <span class="badge-label">VTA System · v1.0.0</span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────────── */
.loading-root {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;
  z-index: 9999;
}

/* ─── Dot grid ─────────────────────────────────────────────────────── */
.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(37,99,235,0.13) 1px, transparent 0);
  background-size: 28px 28px;
  pointer-events: none;
}

/* ─── Glows ────────────────────────────────────────────────────────── */
.glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(90px);
  pointer-events: none;
}
.glow-top {
  top: -180px; right: -140px;
  width: 500px; height: 500px;
  background: rgba(37,99,235,0.10);
  animation: pulse-slow 5s ease-in-out infinite;
}
.glow-bottom {
  bottom: -180px; left: -140px;
  width: 440px; height: 440px;
  background: rgba(99,102,241,0.08);
  animation: pulse-slow 5s ease-in-out infinite 2.5s;
}

/* ─── Card ─────────────────────────────────────────────────────────── */
.card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 44px 52px 36px;
  min-width: 340px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(37,99,235,0.13);
  border-radius: 22px;
  box-shadow:
    0 0 0 1px rgba(37,99,235,0.05),
    0 2px 4px rgba(0,0,0,0.03),
    0 16px 48px rgba(0,0,0,0.07);
  animation: card-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* ─── Logo ─────────────────────────────────────────────────────────── */
.logo-wrap {
  position: relative;
  width: 76px; height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-ring {
  position: absolute;
  inset: -4px;
  border-radius: 16px;
  animation: ring-spin 3s linear infinite;
}
.logo-ring-1 {
  background: conic-gradient(from 0deg, #2563eb 0deg, #6366f1 90deg, transparent 200deg);
  opacity: 0.28;
}
.logo-ring-2 {
  background: conic-gradient(from 200deg, #2563eb 0deg, transparent 120deg);
  opacity: 0.13;
  animation-direction: reverse;
  animation-duration: 6s;
}
.logo-box {
  position: relative;
  z-index: 2;
  width: 62px; height: 62px;
  border-radius: 12px;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(37,99,235,0.38);
}
.logo-text {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.03em;
}

/* ─── Radar ────────────────────────────────────────────────────────── */
.radar-wrap {
  position: relative;
  width: 100px; height: 100px;
  flex-shrink: 0;
}
.radar-circle {
  position: absolute;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(37,99,235,0.22);
}
.radar-c1 { width: 100px; height: 100px; }
.radar-c2 { width: 68px;  height: 68px;  border-color: rgba(37,99,235,0.32); }
.radar-c3 { width: 36px;  height: 36px;  border-color: rgba(37,99,235,0.45); }

/* crosshairs */
.radar-line {
  position: absolute;
  background: rgba(37,99,235,0.14);
}
.radar-h { top: 50%; left: 0; right: 0; height: 1px; transform: translateY(-50%); }
.radar-v { left: 50%; top: 0; bottom: 0; width: 1px; transform: translateX(-50%); }

/* sweep arm */
.radar-sweep {
  position: absolute;
  top: 50%; left: 50%;
  width: 50px; height: 2px;
  transform-origin: 0 50%;
  background: linear-gradient(to right, rgba(37,99,235,0.85), transparent);
  border-radius: 1px;
  animation: sweep 2.2s linear infinite;
}
.radar-sweep::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 50px; height: 50px;
  border-radius: 50%;
  background: conic-gradient(from -30deg at 0 50%,
    rgba(37,99,235,0.14) 0deg,
    transparent 55deg);
  transform: translateY(-50%);
}

/* blip dots */
.blip {
  position: absolute;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #2563eb;
  box-shadow: 0 0 8px 3px rgba(37,99,235,0.55);
}
.blip-a { top: 16%; left: 62%; animation: blip-fade 2.2s ease-in-out infinite 0.5s; }
.blip-b { top: 68%; left: 22%; animation: blip-fade 2.2s ease-in-out infinite 1.2s; }
.blip-c { top: 38%; left: 77%; animation: blip-fade 2.2s ease-in-out infinite 1.9s; }

/* ─── Progress bar ─────────────────────────────────────────────────── */
.progress-track {
  width: 100%;
  height: 3px;
  background: rgba(37,99,235,0.10);
  border-radius: 9999px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #2563eb, #6366f1);
  animation: progress 2s ease-in-out infinite;
}

/* ─── Text ─────────────────────────────────────────────────────────── */
.text-block { text-align: center; }
.message {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.015em;
}
.sub {
  margin: 5px 0 0;
  font-size: 11.5px;
  color: #6b7280;
  letter-spacing: 0.01em;
}

/* ─── Badge ────────────────────────────────────────────────────────── */
.badge {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 9999px;
  background: rgba(37,99,235,0.06);
  border: 1px solid rgba(37,99,235,0.11);
}
.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
  animation: dot-pulse 1.8s ease-in-out infinite;
}
.badge-label {
  font-size: 10.5px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.025em;
}

/* ─── Dark mode ────────────────────────────────────────────────────── */
:global(.dark) .loading-root { background: #030712; }
:global(.dark) .dot-grid {
  background-image: radial-gradient(circle at 1px 1px, rgba(59,130,246,0.18) 1px, transparent 0);
}
:global(.dark) .card {
  background: rgba(3,7,18,0.88);
  border-color: rgba(59,130,246,0.16);
  box-shadow:
    0 0 0 1px rgba(59,130,246,0.07),
    0 4px 8px rgba(0,0,0,0.4),
    0 24px 64px rgba(0,0,0,0.55);
}
:global(.dark) .message { color: #f9fafb; }
:global(.dark) .sub     { color: #4b5563; }
:global(.dark) .badge {
  background: rgba(59,130,246,0.07);
  border-color: rgba(59,130,246,0.14);
}
:global(.dark) .badge-label { color: #4b5563; }
:global(.dark) .radar-circle { border-color: rgba(59,130,246,0.20); }
:global(.dark) .radar-c2 { border-color: rgba(59,130,246,0.28); }
:global(.dark) .radar-c3 { border-color: rgba(59,130,246,0.40); }
:global(.dark) .radar-line { background: rgba(59,130,246,0.12); }
:global(.dark) .progress-track { background: rgba(59,130,246,0.08); }

/* ─── Keyframes ────────────────────────────────────────────────────── */
@keyframes card-in {
  from { opacity: 0; transform: translateY(14px) scale(0.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}
@keyframes ring-spin {
  to { transform: rotate(360deg); }
}
@keyframes sweep {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}
@keyframes blip-fade {
  0%, 100%  { opacity: 0; transform: scale(0.5); }
  40%, 60%  { opacity: 1; transform: scale(1); }
}
@keyframes progress {
  0%   { width: 0%;   margin-left: 0%; }
  50%  { width: 55%;  margin-left: 22%; }
  100% { width: 0%;   margin-left: 100%; }
}
@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.20); }
  50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0.08); }
}
</style>