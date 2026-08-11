import { configureStore } from "@reduxjs/toolkit"
import cartReducer, { hydrateCart } from "./cartSlice"

export const store = configureStore({
    reducer: {
        cart: cartReducer,
    },
})

// Hydrate from localStorage once on client side
if (typeof window !== "undefined") {
    try {
        const saved = localStorage.getItem("cart")
        if (saved) {
            store.dispatch(hydrateCart(JSON.parse(saved)))
        }
    } catch { /* ignore */ }

    // Persist on every change
    store.subscribe(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(store.getState().cart.items))
        } catch { /* ignore */ }
    })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch