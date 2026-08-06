import type { Router } from 'vue-router'

const historyDepth = ref(0)

export function useAppNavigation(router: Router) {
  function initHistoryTracker() {
    router.afterEach((_to, _from, failure) => {
      if (failure) return

      // window.history.state.position is incremented/decremented by Vue Router 4
      // on every forward/back action.
      const state = window.history.state
      
      if (typeof state?.position === 'number') {
        historyDepth.value = state.position
      }
    })
  }

  // Show button only if depth is greater than the initial entry position (0)
  const canGoBack = computed(() => historyDepth.value > 0)

  function goBack(fallback = '/') {
    if (canGoBack.value) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return {
    canGoBack,
    initHistoryTracker,
    goBack,
  }
}
