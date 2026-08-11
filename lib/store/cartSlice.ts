import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface CartItem {
    id: number | string
    name: string
    price: number
    qty: number
    image?: string
}

interface CartState {
    items: CartItem[]
}

const initialState: CartState = {
    items: [],   // ← always start empty; store.ts hydrates from localStorage
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem(state, action: PayloadAction<Omit<CartItem, "qty">>) {
            const existing = state.items.find(i => i.id === action.payload.id)
            if (existing) {
                existing.qty += 1
            } else {
                state.items.push({ ...action.payload, qty: 1 })
            }
        },
        removeItem(state, action: PayloadAction<CartItem["id"]>) {
            state.items = state.items.filter(i => i.id !== action.payload)
        },
        updateQty(state, action: PayloadAction<{ id: CartItem["id"]; qty: number }>) {
            const { id, qty } = action.payload
            if (qty <= 0) {
                state.items = state.items.filter(i => i.id !== id)
            } else {
                const item = state.items.find(i => i.id === id)
                if (item) item.qty = qty
            }
        },
        clearCart(state) {
            state.items = []
        },
        // ← new: used once on client mount to hydrate from localStorage
        hydrateCart(state, action: PayloadAction<CartItem[]>) {
            state.items = action.payload
        },
    },
})

export const { addItem, removeItem, updateQty, clearCart, hydrateCart } = cartSlice.actions
export default cartSlice.reducer