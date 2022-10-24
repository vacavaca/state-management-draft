import produce from "immer"
import { createEvent, createStore } from "effector"

type User = {} | null

interface AuthStore {
    user: User
}

// Events are different things, that could possibly happen with store
export const login = createEvent<User>()
export const logout = createEvent()

// Store has an initial value and event handlers
// immer is fully optional here
export const $authStore = createStore<AuthStore>({ user: null })
    .on(login, (state, newUser) => produce(state, recipe => {
        recipe.user = newUser;
    }))
    .on(logout, (state) => produce(state, recipe => {
        recipe.user = null;
    }))