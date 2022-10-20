import { useCallback, useEffect, useRef } from "react"

/**
 * Dan Abramov's naive useEvent implementation
 * 
 * @param fn event fn
 * @returns callback fn
 */
export function useEvent<A extends any[], T>(fn: (...args: A) => T): (...args: A) => T {
    const ref = useRef(fn)
    ref.current = fn
    return useCallback((...args) => ref.current(...args), [])
}

/**
 * Simple periodic useEffect
 */
export function useInterval(fn: (...args: any[]) => unknown, timeout: number) {
    const event = useEvent(fn)
    useEffect(() => {
        const timer = setInterval(event, timeout)
        return () => clearInterval(timer)
    }, [timeout])
}

type KeyedEffectFn<K extends any[]> = (...keys: K) => ((() => unknown) |  unknown)

/**
 * Calls the specified effect buy only once app-wide for each key
 *
 * similar to how useSWR's keys work
 * 
 * @param unmountTimeout timeout to "debounce" unmount handlers and wait for new subscribers
 * @returns hook function to call with keys and the effect
 */
export function createCommonEffect<K extends any[]>(unmountTimeout: number = 50) {
    let clientCount: Record<string, number> = {}
    let cleanup: Record<string, unknown | null | (() => void)> = {}
    let unmountTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

    return (keys: K, effect: KeyedEffectFn<K>) => {
        const key = JSON.stringify(keys)
        useEffect(() => {
            if (!(key in clientCount)) {
                clientCount[key] = 0
            }

            const timer = unmountTimers[key]
            if (timer != null) clearTimeout(timer)

            clientCount[key] += 1
            if (timer == null && clientCount[key] === 1)
                cleanup[key] = effect(...keys)

            return () => {
                clientCount[key] -= 1
                if (clientCount[key] !== 0) return

                if (unmountTimers[key] != null) return
                unmountTimers[key] = setTimeout(() => {
                    delete unmountTimers[key]
                    if (clientCount[key] !== 0) return

                    const fn = cleanup[key]
                    if (fn instanceof Function)
                        fn()
                }, unmountTimeout)
            }
        }, keys)  // fn is based on keys
    }
}

/**
 * Like useMemo but keyed, usefull for creating repeating callbacks with different arguments
 */
export function useKeyMemo<T, D extends any[]>(get: (key: string) => T, deps: D): (key: string) => T {
    const state = useRef<{[key: string]: T}>({})

    useEffect(() => {
        state.current = {}
    }, deps)

    return useCallback(index => {
        if (index in state.current) {
            return state.current[index]
        }

        const value = get(index)
        state.current[index] = value
        return value
    }, deps)
}