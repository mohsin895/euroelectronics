'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    image: string
    stock: number
    // Needed to build the storeOrder payload (see lib/order-payload.ts).
    // Populate these when adding an item to the cart from the product data;
    // they default to safe fallbacks if omitted.
    categoryId?: number
    parentCategoryId?: number | string
    vat?: number
}

export interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
    totalPrice: number
    totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Initialize from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (error) {
                console.error('[v0] Failed to restore cart:', error)
                localStorage.removeItem('cart')
            }
        }
    }, [])

    // Save to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addItem = (item: CartItem) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id)
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                )
            }
            return [...prevItems, item]
        })
    }

    const removeItem = (id: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id)
            return
        }
        setItems((prevItems) =>
            prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalPrice,
                totalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}