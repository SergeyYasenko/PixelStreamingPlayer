<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  index: { type: Number, default: 0 },
  imageUrl: { type: String, default: null },
})

const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}

function handleImageLoad() {
  imageError.value = false
}
</script>

<template>
  <div class="card">
    <div class="card-content">
      <div v-if="imageUrl && !imageError" class="card-image">
        <img 
          :src="imageUrl" 
          :alt="label" 
          @error="handleImageError"
          @load="handleImageLoad"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div v-else class="card-placeholder" />
    </div>
  </div>
</template>

<style scoped>
.card {
  aspect-ratio: 3/4;
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: transform 0.15s ease-out;
}
.card:hover {
  transform: translateY(-4px);
}
.card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
}
.card-placeholder {
  width: 100%;
  height: 100%;
  background: #0f172a;
  border-radius: 0;
  border: none;
}
.card-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0f172a;
  border-radius: 16px;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 16px;
}
</style>
