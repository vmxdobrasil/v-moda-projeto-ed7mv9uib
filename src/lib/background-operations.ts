let activeCount = 0
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((cb) => cb())
}

export function startBackgroundOperation(): void {
  activeCount++
  notifyListeners()
}

export function endBackgroundOperation(): void {
  activeCount = Math.max(0, activeCount - 1)
  notifyListeners()
}

export function hasActiveBackgroundOperations(): boolean {
  return activeCount > 0
}

export function onBackgroundOperationsChange(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
