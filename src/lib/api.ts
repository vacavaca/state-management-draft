import produce from "immer"
import { useEffect, useMemo } from "react"
import { createEvent, createStore } from "effector"
import { useStore as effectorUseStore } from "effector-react"
import { createPromiseWithResolvers, Resolvers } from "./async"
import { createCommonEffect } from "./hooks"
import { createKeyStore } from "./state"

// state

export interface RequestState<T> {
    promise: Promise<T>
    isLoading: boolean
    error: any
    updatedAt: number
    data: any
}

interface InternalRequestState<T> extends RequestState<T> {
    resolvers: Resolvers<T>
    isUpdating: boolean | null
}

const setUpdating = createEvent()
const resolve = createEvent<any>()
const reject = createEvent<any>()
export const refresh = createEvent<void>()

const useRequestStore = createKeyStore(() => createStore<InternalRequestState<any>>({
    ...createPromiseWithResolvers<any>(),
    isUpdating: false,
    isLoading: true,
    updatedAt: 0,
    error: null,
    data: null,
}).on(setUpdating, (initialState, _) => produce(initialState, recipe => {
    recipe.isUpdating = true
    recipe.isLoading = true
})).on(resolve, (initialState, v) => produce(initialState, recipe => {
    recipe.data = v
    recipe.error = null
    recipe.updatedAt = Date.now()
    recipe.isLoading = false
    recipe.isUpdating = false
    recipe.resolvers[0](v)
})).on(reject, (initialState, e) => produce(initialState, recipe => {
    recipe.data = null
    recipe.error = e
    recipe.isLoading = false
    recipe.isUpdating = false
    recipe.resolvers[1](e)
})).on(refresh, (initialState) => produce(initialState, recipe => {
    if (recipe.isUpdating) return

    const { promise, resolvers } = createPromiseWithResolvers<any>()

    recipe.isLoading = true
    recipe.isUpdating = false
    recipe.promise = promise
    recipe.resolvers = resolvers
})))

// interface hook

type RequestFn<T, K extends any[]> = (...args: K) => Promise<T>

function isFreshState(state: RequestState<any>, revalidateInterval: number) {
    const sinceUpdate = Date.now() - state.updatedAt
    return !revalidateInterval || sinceUpdate < revalidateInterval
}

const useApiRevalidateEffect = createCommonEffect(1e3)

/**
 * Similar to useSWR but with zustand as a store 
 * 
 * This is to demostrate how to work with zustand stores and custom hooks in complex use-cases
 * in real apps we can use the swr itself if we wish
 */
export function useAPI<T, K extends any[]>(keys: K, fn: RequestFn<T, K>, revalidateInterval: number = 0): RequestState<T> {
    const key = useMemo(() => JSON.stringify(keys), keys)
    const useStore = useRequestStore(key)

    // initializing update check on render
    useEffect(() => useStore.subscribe(state => {
        // mutex
        // only one component is performing the update at a time
        if (state.isUpdating) return

        const isFresh = isFreshState(state, revalidateInterval)
        if (!state.isLoading && isFresh) return

        setUpdating()

        async function load() {
            try {
                // DELAY FOR DEMONSTRATION PURPOSES
                await new Promise(resolve => setTimeout(resolve, 700))

                const data = await fn(...keys)
                resolve(data)
            } catch (error) {
                reject(error)
            }
        }

        load()
    }), [key])

    useApiRevalidateEffect([key], () => {
        const timer = setInterval(() => {
            const state = useStore.getState()
            if (!isFreshState(state, revalidateInterval)) {
                refresh()
            }
        }, 500)
        return () => clearInterval(timer)
    })

    return effectorUseStore(useStore)
}