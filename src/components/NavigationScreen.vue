<script setup>
import Card from './Card.vue'

const props = defineProps({
  level: { type: Number, required: true }, // 1 или 2
  cards: { type: Array, required: true }, // [{ label, command }]
  videoMode: { type: Boolean, default: false }, // режим видео (карточки внизу)
})

const emit = defineEmits(['card-click', 'back'])

function handleCardClick(card, index) {
  emit('card-click', { card, index, level: props.level })
}
</script>

<template>
  <div class="navigation-screen" :class="{ 'video-mode': videoMode }">
    <div class="cards-container" :class="{ 'cards-bottom': videoMode }">
      <div class="cards-grid">
        <div
          v-for="(card, index) in cards"
          :key="`${level}-${card.command}`"
          class="card-wrapper"
          @click="handleCardClick(card, index)"
        >
          <Card 
            :label="card.label" 
            :index="index" 
            :image-url="card.imageUrl"
            :is-priority="level === 1 && index < 3"
          />
          <div v-if="!videoMode" class="card-label">{{ card.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navigation-screen {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}
.cards-container {
  width: 100%;
  max-width: 1400px;
  display: flex;
  justify-content: center;
}
.cards-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}
.card-wrapper {
  flex: 0 0 200px;
  max-width: 240px;
  contain: layout style paint;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cards-container.cards-bottom .card-wrapper {
  flex: 0 0 160px;
  max-width: 200px;
}
.cards-container.cards-bottom {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: 1000px;
  gap: 1rem;
  margin: 0 auto;
  padding: 0 80px;
  box-sizing: border-box;
}
.card-wrapper:hover {
  transition: transform 0.15s ease-out;
}
.card-label {
  margin-top: 1rem;
  color: #ffffff;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.3;
  max-width: 100%;
  padding: 0 0.5rem;
}
@media (max-width: 1200px) {
  .card-wrapper {
    flex: 0 0 180px;
    max-width: 200px;
  }
}
@media (max-width: 768px) {
  .card-wrapper {
    flex: 0 0 140px;
    max-width: 160px;
  }
  .cards-container.cards-bottom .card-wrapper {
    flex: 0 0 120px;
    max-width: 140px;
  }
}
</style>
