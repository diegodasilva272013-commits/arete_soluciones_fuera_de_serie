import * as React from "react"

export function useUserInterruption(debounceMs = 200) {
  const interruptedRef = React.useRef(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const interrupt = React.useCallback(() => {
    interruptedRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      interruptedRef.current = false
    }, debounceMs)
  }, [debounceMs])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { interruptedRef, interrupt }
}
