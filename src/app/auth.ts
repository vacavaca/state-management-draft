import produce from "immer"
import create from "zustand"

interface AuthState {
    user: {} | null
    login(user: {}): void
    logout(): void
}

// simple "auth" store, can be updated externaly
export const useAuthStore = create<AuthState>(set => ({
    user: null,
    login: (user: {}) => set(produce(recipe => {
        recipe.user = user
    })),
    logout: () => set(produce(recipe => {
        recipe.user = null
    }))
}))

export function useAuth(): AuthState {
    return useAuthStore()
}