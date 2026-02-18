import { ref, shallowRef, onUnmounted } from 'vue'
import { Config, PixelStreaming, MessageDirection } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4'

/**
 * @param {HTMLElement} [videoParent] - element for video (optional, can be set later)
 * @param {{ useUrlParams?: boolean, signallingServerUrl?: string, streamerId?: string }} [options]
 */
export function usePixelStreaming(videoParent = null, options = {}) {
  const stream = shallowRef(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)

  // Проверяем, есть ли параметр ss в URL
  const urlParams = new URLSearchParams(window.location.search)
  const urlSignallingUrl = urlParams.get('ss')
  
  // Используем URL параметр, если есть, иначе дефолтный адрес из options
  const defaultSignallingUrl = options.signallingServerUrl || 'ws://localhost:80'
  const signallingServerUrl = urlSignallingUrl || defaultSignallingUrl

  const config = new Config({
    useUrlParams: options.useUrlParams ?? true,
    initialSettings: {
      ss: signallingServerUrl,
      ...(options.streamerId && { StreamerId: options.streamerId }),
    },
  })

  function init(parentEl) {
    const el = parentEl || videoParent
    if (!el) return
    if (stream.value) return
    const s = new PixelStreaming(config, { videoElementParent: el })
    stream.value = s

    s.addEventListener('webRtcConnecting', () => {
      isConnecting.value = true
      error.value = null
    })
    s.addEventListener('webRtcConnected', () => {
      isConnected.value = true
      isConnecting.value = false
      error.value = null
    })
    s.addEventListener('webRtcDisconnected', () => {
      isConnected.value = false
      isConnecting.value = false
    })
    s.addEventListener('webRtcFailed', (e) => {
      isConnecting.value = false
      isConnected.value = false
      error.value = e.detail ?? 'Connection failed'
    })

    // Регистрируем обработчики для сообщений Pixel Streaming, чтобы убрать ошибки в консоли
    try {
      // Обработчики для сообщений от стримера (FromStreamer)
      s.registerMessageHandler('Multiplexed', MessageDirection.FromStreamer, () => {
        // Игнорируем Multiplexed сообщения
      })
      
      // Обработчики для сообщений к стримеру (ToStreamer)
      s.registerMessageHandler('ChannelRelayStatus', MessageDirection.ToStreamer, () => {
        // Игнорируем ChannelRelayStatus сообщения
      })
      
      s.registerMessageHandler('Multiplexed', MessageDirection.ToStreamer, () => {
        // Игнорируем Multiplexed сообщения
      })
    } catch (err) {
      // Игнорируем ошибки регистрации обработчика
    }

    s.connect()
  }

  function connect() {
    if (stream.value) stream.value.connect()
  }

  function disconnect() {
    if (stream.value) stream.value.disconnect()
  }

  /** Send string or object to UE (Bind Event to On Input Event in Blueprint) */
  function emitUIInteraction(descriptor) {
    if (!stream.value) return false
    return stream.value.emitUIInteraction(descriptor)
  }

  /** Send console command (UE must be launched with -AllowPixelStreamingCommands) */
  function emitConsoleCommand(command) {
    if (!stream.value) return false
    return stream.value.emitConsoleCommand(command)
  }

  /** Send arbitrary JSON command (e.g. { ConsoleCommand: 'stat fps' }) */
  function emitCommand(descriptor) {
    if (!stream.value) return false
    return stream.value.emitCommand(descriptor)
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    stream,
    config,
    isConnected,
    isConnecting,
    error,
    init,
    connect,
    disconnect,
    emitUIInteraction,
    emitConsoleCommand,
    emitCommand,
  }
}
