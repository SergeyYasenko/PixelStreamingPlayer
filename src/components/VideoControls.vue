<script setup>
const emit = defineEmits(['prev', 'next'])

function handlePrev() {
  emit('prev')
}

function handleNext() {
  emit('next')
}
</script>

<template>
  <div class="video-controls">
    <button class="nav-arrow nav-arrow-left" @click="handlePrev">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
    <button class="nav-arrow nav-arrow-right" @click="handleNext">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.video-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
  box-sizing: border-box;
  pointer-events: none;
}
.nav-arrow {
  width: 56px;
  height: 56px;
  background: rgba(30, 41, 59, 0.95);
  border: 2px solid #475569;
  border-radius: 50%;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  pointer-events: all;
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}
.nav-arrow:hover {
  background: rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
  transform: scale(1.15);
}
.nav-arrow:active {
  transform: scale(0.9);
}
.nav-arrow-left {
  order: 1;
}
.nav-arrow-right {
  order: 3;
}
</style>
