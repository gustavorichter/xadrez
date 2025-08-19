import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const minutes = ref(0)
  const seconds = ref(0)
  let interval = null

  const startTimer = () => {
    interval = setInterval(() => {
      seconds.value++
      
      if (seconds.value >= 60) {
        seconds.value = 0
        minutes.value++
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  const resetTimer = () => {
    minutes.value = 0
    seconds.value = 0
  }

  const pauseTimer = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  const resumeTimer = () => {
    if (!interval) {
      startTimer()
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer()
  })

  return {
    minutes,
    seconds,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer
  }
}
