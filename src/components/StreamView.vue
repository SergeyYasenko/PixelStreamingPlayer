<script setup>
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import { usePixelStreaming } from '../composables/usePixelStreaming'
import NavigationScreen from './NavigationScreen.vue'
import Card from './Card.vue'

// Уровень 1: стартовые карточки
const LEVEL1_CARDS = [
  { label: 'Категория 1', command: 'Category1', imageUrl: '/images/lvl1/image1.jpg' },
  { label: 'Категория 2', command: 'Category2', imageUrl: '/images/lvl1/image2.jpg' },
  { label: 'Категория 3', command: 'Category3', imageUrl: '/images/lvl1/image3.jpg' },
  { label: 'Категория 4', command: 'Category4', imageUrl: '/images/lvl1/image4.jpg' },
  { label: 'Категория 5', command: 'Category5', imageUrl: '/images/lvl1/image5.jpg' },
]

// Карточки второго уровня для каждой категории
const LEVEL2_CARDS_BY_CATEGORY = {
  Category1: [
    { label: 'Видео 1.1', command: 'Video1_1', imageUrl: '/images/lvl1/SubLvl1/1.jpg' },
    { label: 'Видео 1.2', command: 'Video1_2', imageUrl: '/images/lvl1/SubLvl1/2.jpg' },
    { label: 'Видео 1.3', command: 'Video1_3', imageUrl: '/images/lvl1/SubLvl1/3.jpg' },
    { label: 'Видео 1.4', command: 'Video1_4', imageUrl: '/images/lvl1/SubLvl1/4.jpg' },
    { label: 'Видео 1.5', command: 'Video1_5', imageUrl: '/images/lvl1/SubLvl1/5.jpg' },
  ],
  Category2: [
    { label: 'Видео 2.1', command: 'Video2_1', imageUrl: '/images/lvl1/SubLvl2/1.jpg' },
    { label: 'Видео 2.2', command: 'Video2_2', imageUrl: '/images/lvl1/SubLvl2/2.jpg' },
    { label: 'Видео 2.3', command: 'Video2_3', imageUrl: '/images/lvl1/SubLvl2/3.jpg' },
    { label: 'Видео 2.4', command: 'Video2_4', imageUrl: '/images/lvl1/SubLvl2/4.jpg' },
    { label: 'Видео 2.5', command: 'Video2_5', imageUrl: '/images/lvl1/SubLvl2/5.jpg' },
  ],
  Category3: [
    { label: 'Видео 3.1', command: 'Video3_1', imageUrl: '/images/lvl1/SubLvl3/1.jpg' },
    { label: 'Видео 3.2', command: 'Video3_2', imageUrl: '/images/lvl1/SubLvl3/2.jpg' },
    { label: 'Видео 3.3', command: 'Video3_3', imageUrl: '/images/lvl1/SubLvl3/3.jpg' },
    { label: 'Видео 3.4', command: 'Video3_4', imageUrl: '/images/lvl1/SubLvl3/4.jpg' },
    { label: 'Видео 3.5', command: 'Video3_5', imageUrl: '/images/lvl1/SubLvl3/5.jpg' },
  ],
  Category4: [
    { label: 'Видео 4.1', command: 'Video4_1', imageUrl: '/images/lvl1/SubLvl4/1.jpg' },
    { label: 'Видео 4.2', command: 'Video4_2', imageUrl: '/images/lvl1/SubLvl4/2.jpg' },
    { label: 'Видео 4.3', command: 'Video4_3', imageUrl: '/images/lvl1/SubLvl4/3.jpg' },
    { label: 'Видео 4.4', command: 'Video4_4', imageUrl: '/images/lvl1/SubLvl4/4.jpg' },
    { label: 'Видео 4.5', command: 'Video4_5', imageUrl: '/images/lvl1/SubLvl4/5.jpg' },
  ],
  Category5: [
    { label: 'Видео 5.1', command: 'Video5_1', imageUrl: '/images/lvl1/SubLvl5/1.jpg' },
    { label: 'Видео 5.2', command: 'Video5_2', imageUrl: '/images/lvl1/SubLvl5/3.jpg' },
    { label: 'Видео 5.3', command: 'Video5_3', imageUrl: '/images/lvl1/SubLvl5/4.jpg' },
    { label: 'Видео 5.4', command: 'Video5_4', imageUrl: '/images/lvl1/SubLvl5/5.jpg' },
    { label: 'Видео 5.5', command: 'Video5_5', imageUrl: '/images/lvl1/SubLvl5/1.jpg' },
  ],
}

// Восстанавливаем состояние из localStorage
function loadState() {
  try {
    const saved = localStorage.getItem('pixelStreamingState')
    if (saved) {
      const state = JSON.parse(saved)
      return {
        level: state.level ?? 0,
        category: state.category ?? null,
        videoIndex: state.videoIndex ?? 0,
      }
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage', e)
  }
  return { level: 0, category: null, videoIndex: 0 }
}

const savedState = loadState()

const videoContainer = ref(null)
const currentLevel = ref(savedState.level) // 0 = старт, 1 = уровень 2, 2 = режим видео
const selectedCategory = ref(savedState.category)
const currentVideoIndex = ref(savedState.videoIndex)
const showExitModal = ref(false)
const showVideoUI = ref(true)
const isSleepMode = ref(false)
let mouseMoveTimer = null
let lastMouseMoveTime = 0

// Сохраняем состояние в localStorage с debounce
let saveStateTimer = null
function saveState() {
  if (saveStateTimer) {
    clearTimeout(saveStateTimer)
  }
  saveStateTimer = setTimeout(() => {
    try {
      const state = {
        level: currentLevel.value,
        category: selectedCategory.value,
        videoIndex: currentVideoIndex.value,
      }
      localStorage.setItem('pixelStreamingState', JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save state to localStorage', e)
    }
  }, 300) // Debounce 300ms
}

// Отслеживаем изменения состояния с debounce
// Убрали deep: true - он не нужен для примитивов и вызывает лишние срабатывания
watch([currentLevel, () => selectedCategory.value?.command, currentVideoIndex], () => {
  saveState()
})

const {
  init,
  emitUIInteraction,
  isConnected,
  isConnecting,
  error,
} = usePixelStreaming(null, {
  useUrlParams: true, // Можно переопределить через URL параметр ?ss=...
  signallingServerUrl: 'ws://localhost:80', // Дефолтный адрес сервера
})

// Текущие карточки для отображения (максимально оптимизировано)
const currentCards = computed(() => {
  if (currentLevel.value === 0) return LEVEL1_CARDS
  if (currentLevel.value >= 1) {
    const categoryCommand = selectedCategory.value?.command
    return categoryCommand ? (LEVEL2_CARDS_BY_CATEGORY[categoryCommand] || []) : []
  }
  return []
})

// В режиме видео?
const isVideoMode = computed(() => currentLevel.value === 2)

function handleCardClick(event) {
  const { card, level } = event
  
  // Пока что только навигация, без отправки команд в UE
  if (level === 1) {
    // Клик на карточку первого уровня -> переходим на второй уровень
    selectedCategory.value = card
    currentLevel.value = 1
    
    // Принудительная загрузка изображений второго уровня в кеш
    const categoryCards = LEVEL2_CARDS_BY_CATEGORY[card.command] || []
    categoryCards.forEach(cardItem => {
      // Используем Image объект для мгновенной загрузки в кеш
      const img = new Image()
      img.src = cardItem.imageUrl
    })
  } else if (level === 2) {
    // Клик на карточку второго уровня -> переходим в режим видео
    const cards = currentCards.value
    currentVideoIndex.value = cards.findIndex(c => c.command === card.command)
    if (currentVideoIndex.value === -1) currentVideoIndex.value = 0
    currentLevel.value = 2
    
    // Отправляем команду в UE в формате строк: "project:project1" и "selection:selection1"
    const projectCommand = selectedCategory.value?.command || ''
    const selectionCommand = card.command || ''
    
    if (projectCommand && selectionCommand) {
      // Извлекаем номер проекта из команды (Category1 -> 1, Category2 -> 2, и т.д.)
      const projectMatch = projectCommand.match(/Category(\d+)/)
      const projectNumber = projectMatch ? projectMatch[1] : '1'
      
      // Извлекаем номер селекции из команды (Video1_1 -> 1, Video1_2 -> 2, и т.д.)
      const selectionMatch = selectionCommand.match(/Video\d+_(\d+)/)
      const selectionNumber = selectionMatch ? selectionMatch[1] : '1'
      
      // Отправляем две отдельные команды в формате строк
      emitUIInteraction(`project:project${projectNumber}`)
      emitUIInteraction(`selection:selection${selectionNumber}`)
    }
    
    // Показываем интерфейс при переходе в режим видео
    showVideoUI.value = true
    // Запускаем таймер скрытия
    if (mouseMoveTimer) {
      clearTimeout(mouseMoveTimer)
    }
    mouseMoveTimer = setTimeout(() => {
      showVideoUI.value = false
    }, 1000)
  }
}

function handleBack() {
  if (currentLevel.value === 1) {
    currentLevel.value = 0
    selectedCategory.value = null
  } else if (currentLevel.value === 2) {
    currentLevel.value = 1
  }
}

function handleVideoPrev() {
  const cards = currentCards.value
  if (cards.length === 0) return
  currentVideoIndex.value = (currentVideoIndex.value - 1 + cards.length) % cards.length
  
  // Отправляем команду в UE
  emitUIInteraction('prev')
}

function handleVideoNext() {
  const cards = currentCards.value
  if (cards.length === 0) return
  currentVideoIndex.value = (currentVideoIndex.value + 1) % cards.length
  
  // Отправляем команду в UE
  emitUIInteraction('next')
}

function handleSleepMode() {
  // Отправляем команду в UE
  emitUIInteraction('sleep')
  // Включаем режим сна
  isSleepMode.value = true
}

function handleNoSleep() {
  // Отправляем команду в UE
  emitUIInteraction('nosleep')
  // Выключаем режим сна и показываем интерфейс
  isSleepMode.value = false
  showVideoUI.value = true
}

function handleCloseClick() {
  showExitModal.value = true
}

function handleExitConfirm() {
  // Отправляем команду в UE
  emitUIInteraction('exit')
  
  // Закрываем сессию
  showExitModal.value = false
  // Можно закрыть окно или отправить команду в UE
  window.close()
  // Если окно не закрывается (например, не было открыто через window.open), можно использовать:
  // window.location.href = 'about:blank'
}

function handleExitCancel() {
  showExitModal.value = false
}

function handleMouseMove(event) {
  // Throttling: обрабатываем не чаще чем раз в 200ms для лучшей производительности
  const now = Date.now()
  if (now - lastMouseMoveTime < 200) {
    return
  }
  lastMouseMoveTime = now
  
  if (!isVideoMode.value) {
    return
  }
  
  // Кешируем проверку для лучшей производительности
  const target = event.target
  const isOnUI = target.closest('.video-ui') || 
                 target.closest('.top-back-btn') || 
                 target.closest('.top-close-btn') ||
                 target.closest('.sleep-mode-btn')
  
  // Если курсор на элементе интерфейса, показываем и не скрываем
  if (isOnUI) {
    if (!showVideoUI.value) {
      showVideoUI.value = true
    }
    if (mouseMoveTimer) {
      clearTimeout(mouseMoveTimer)
      mouseMoveTimer = null
    }
    return
  }
  
  // Если курсор на видео, показываем интерфейс и запускаем таймер
  if (!showVideoUI.value) {
    showVideoUI.value = true
  }
  
  // Сбрасываем таймер
  if (mouseMoveTimer) {
    clearTimeout(mouseMoveTimer)
  }
  
  // Устанавливаем таймер на скрытие через 1 секунду
  mouseMoveTimer = setTimeout(() => {
    if (isVideoMode.value) {
      showVideoUI.value = false
    }
  }, 1000)
}

function handleUIClick() {
  if (!isVideoMode.value) return
  
  // При клике на интерфейс показываем и не скрываем
  showVideoUI.value = true
  if (mouseMoveTimer) {
    clearTimeout(mouseMoveTimer)
    mouseMoveTimer = null
  }
}

function handleUIMouseEnter() {
  if (!isVideoMode.value) return
  
  // При наведении на интерфейс показываем и не скрываем
  showVideoUI.value = true
  if (mouseMoveTimer) {
    clearTimeout(mouseMoveTimer)
    mouseMoveTimer = null
  }
}

onMounted(() => {
  init(videoContainer.value)
  
  // Агрессивная предзагрузка ВСЕХ изображений первого уровня
  LEVEL1_CARDS.forEach((card, idx) => {
    setTimeout(() => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = card.imageUrl
      link.fetchPriority = 'high'
      document.head.appendChild(link)
      
      // Также создаем Image объект для принудительной загрузки в кеш
      const img = new Image()
      img.src = card.imageUrl
    }, idx * 10) // Небольшая задержка чтобы не блокировать
  })
  
  // Предзагружаем изображения всех категорий второго уровня заранее
  Object.values(LEVEL2_CARDS_BY_CATEGORY).forEach((cards, catIdx) => {
    setTimeout(() => {
      cards.forEach((card, cardIdx) => {
        const img = new Image()
        img.src = card.imageUrl
      })
    }, 100 + catIdx * 50)
  })
  
  // Восстанавливаем состояние интерфейса для режима видео
  if (currentLevel.value === 2) {
    showVideoUI.value = true
    // Запускаем таймер скрытия
    if (mouseMoveTimer) {
      clearTimeout(mouseMoveTimer)
    }
    mouseMoveTimer = setTimeout(() => {
      if (isVideoMode.value) {
        showVideoUI.value = false
      }
    }, 1000)
  }
  
  // Добавляем обработчик движения мыши
  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (mouseMoveTimer) {
    clearTimeout(mouseMoveTimer)
  }
  if (saveStateTimer) {
    clearTimeout(saveStateTimer)
  }
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div class="stream-view">
    <!-- Видео контейнер (всегда на фоне) -->
    <div ref="videoContainer" class="stream-video" />
    
    <!-- Навигационные экраны (поверх видео) -->
    <Transition name="fade" mode="out-in">
      <div v-if="currentLevel < 2 && !isSleepMode" key="nav" class="navigation-overlay">
        <NavigationScreen
          :level="currentLevel === 0 ? 1 : 2"
          :cards="currentCards"
          :video-mode="false"
          @card-click="handleCardClick"
          @back="handleBack"
        />
      </div>
    </Transition>
    
    <!-- Режим видео: карточки внизу + стрелки -->
    <Transition name="fade" mode="out-in">
      <div v-if="isVideoMode && !isSleepMode" key="video" class="video-mode-overlay">
        <Transition name="fade">
          <div v-if="showVideoUI" class="video-ui" @click="handleUIClick" @mouseenter="handleUIMouseEnter">
            <button class="nav-arrow nav-arrow-side nav-arrow-side-left" @click="handleVideoPrev">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button class="nav-arrow nav-arrow-side nav-arrow-side-right" @click="handleVideoNext">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div class="video-bottom-panel">
              <div class="cards-row">
                <div class="cards-row-background"></div>
                <div
                  v-for="(card, index) in currentCards"
                  :key="`video-${card.command}-${index}`"
                  class="card-wrapper-small"
                  :class="{ active: index === currentVideoIndex, inactive: index !== currentVideoIndex }"
                  @click="handleCardClick({ card, level: 2 })"
                >
                  <Card 
                    :key="`video-card-${index}-${card.command}`"
                    :label="card.label" 
                    :index="index" 
                    :image-url="card.imageUrl"
                    :is-priority="index === currentVideoIndex"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
    
    <!-- Кнопка "Назад" (слева вверху, видна когда не на начальном экране) -->
    <Transition name="fade">
      <button 
        v-if="currentLevel > 0 && (!isVideoMode || showVideoUI) && !isSleepMode"
        class="top-back-btn"
        @click="handleBack"
        @mouseenter="handleUIMouseEnter"
        title="Назад"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
    </Transition>
    
    <!-- Кнопка закрытия (справа вверху) -->
    <Transition name="fade">
      <button 
        v-if="(!isVideoMode || showVideoUI) && !isSleepMode"
        class="top-close-btn"
        @click="handleCloseClick"
        @mouseenter="handleUIMouseEnter"
        title="Закрыть"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </Transition>
    
    <!-- Кнопка спящего режима (только на начальном экране) -->
    <Transition name="fade">
      <button 
        v-if="currentLevel === 0 && !isSleepMode" 
        class="sleep-mode-btn"
        @click="handleSleepMode"
        title="Спящий режим"
      >
        <img src="/images/icons/moon.png" alt="Спящий режим" width="36" height="36" />
      </button>
    </Transition>
    
    <!-- Модальное окно подтверждения выхода -->
    <Transition name="modal-fade">
      <div v-if="showExitModal" class="modal-overlay" @click="handleExitCancel">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Вы точно уверены?</h3>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-confirm" @click="handleExitConfirm">
              Да
            </button>
            <button class="modal-btn modal-btn-cancel" @click="handleExitCancel">
              Нет
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Режим сна - полноэкранный overlay -->
    <Transition name="fade">
      <div v-if="isSleepMode" class="sleep-overlay" @click="handleNoSleep">
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.stream-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0f0f12;
}
.stream-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: 
    linear-gradient(135deg, #0f0f12 0%, #1a1a20 50%, #0f0f12 100%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.15)" stroke-width="2"/></pattern></defs><rect width="200" height="200" fill="url(%23grid)"/></svg>');
  background-size: cover, cover, 200px 200px;
}
.stream-video :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.navigation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: 
    linear-gradient(135deg, rgba(15, 15, 18, 0.9) 0%, rgba(26, 26, 32, 0.9) 100%),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59,130,246,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  backdrop-filter: blur(4px);
}
.video-mode-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  /* Убрали затемнение - теперь прозрачный */
}
.video-ui {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.video-ui > * {
  pointer-events: all;
}
.video-bottom-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}
.cards-row {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  width: 100%;
}
.cards-row-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 128, 128, 0.5);
  border-radius: 16px;
  z-index: 0;
  pointer-events: none;
}
.card-wrapper-small {
  position: relative;
  cursor: pointer;
  /* Убираем transition из базового стиля для лучшей производительности */
}
.card-wrapper-small.active {
  transform: scale(1.1);
  z-index: 1;
  opacity: 1;
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}
.card-wrapper-small.inactive {
  opacity: 0.5;
  transition: opacity 0.2s ease-out;
}
.card-wrapper-small:hover:not(.active) {
  transform: scale(1.05);
  opacity: 0.8;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}
.card-wrapper-small.active:hover {
  opacity: 1;
}
.card-wrapper-small {
  position: relative;
  z-index: 1;
}
.card-wrapper-small :deep(.card) {
  aspect-ratio: 16/9;
  min-height: 80px;
  max-width: 220px;
  margin: 0 auto;
}
.card-wrapper-small :deep(.card-label) {
  font-size: 0.85rem;
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
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}
.nav-arrow-side {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 11;
}
.nav-arrow-side-left {
  left: 1.25rem;
}
.nav-arrow-side-right {
  right: 1.25rem;
}
.nav-arrow:hover {
  background: rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
}
/* Кнопка спящего режима */
.sleep-mode-btn {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 10;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(8px);
}
.sleep-mode-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}
.sleep-mode-btn:active {
  transform: scale(0.95);
}
.sleep-mode-btn img {
  width: 36px;
  height: 36px;
}
/* Кнопка "Назад" вверху слева */
.top-back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(8px);
}
.top-back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}
.top-back-btn:active {
  transform: scale(0.95);
}
.top-back-btn svg {
  width: 32px;
  height: 32px;
}
/* Кнопка закрытия вверху справа */
.top-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(8px);
}
.top-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  transform: scale(1.05);
}
.top-close-btn:active {
  transform: scale(0.95);
}
.top-close-btn svg {
  width: 32px;
  height: 32px;
}
/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: rgba(22, 22, 28, 0.95);
  border-radius: 16px;
  padding: 2rem;
  min-width: 320px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}
.modal-title {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
}
.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.modal-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.modal-btn-confirm {
  background: #ef4444;
  color: #fff;
}
.modal-btn-confirm:hover {
  background: #dc2626;
  transform: scale(1.05);
}
.modal-btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.modal-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9);
  opacity: 0;
}
/* Плавные переходы между уровнями - оптимизированы */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
  /* Убираем transform для лучшей производительности */
}
.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
/* Режим сна - полноэкранный overlay */
.sleep-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 9999;
  cursor: pointer;
}
</style>
