import { Store } from "effector";

type UseKeyStore<C> = (key: string) => C

// TODO LRU behavior might be usefull
export function createKeyStore<C extends Store<any>>(fn: (key: string) => C): UseKeyStore<C> {
    const stores: Record<string, C> = {}

    return key => {
        if (!(key in stores)) {
            stores[key] = fn(key)
        }

        return stores[key]
    }
}