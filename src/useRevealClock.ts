import { onMounted, onUnmounted, ref } from 'vue'
export function useRevealClock() {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 250) })
  onUnmounted(() => { if (timer) clearInterval(timer) })
  return now
}
