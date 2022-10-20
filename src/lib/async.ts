import { noop } from "./util"

export type Resolvers<T> = [(v: T) => void, (e: any) => void]

export type PromiseWihResolvers<T> = { promise: Promise<T>, resolvers: Resolvers<T> }

export function createPromiseWithResolvers<T>(): PromiseWihResolvers<T> {
    const resolvers: Resolvers<T> = [noop, noop]
    const promise = new Promise<T>((resolve, reject) => {
        resolvers[0] = resolve
        resolvers[1] = reject
    })

    return { promise, resolvers }
}
