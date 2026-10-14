
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "chans_crackers_cart_final";

export const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const productId = (product) =>
  String(product?._id || product?.id || "");

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart)
    );
  }, [cart]);

  function addItem(product, quantity = 1) {
    const id = productId(product);
    const amount = Number(quantity);

    if (
      !id ||
      !Number.isInteger(amount) ||
      amount < 1
    ) {
      return;
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.min(
                  100,
                  item.quantity + amount
                )
              }
            : item
        );
      }

      return [
        ...previous,
        {
          id,
          product,
          quantity: Math.min(100, amount)
        }
      ];
    });
  }

  function updateQuantity(id, quantity) {
    const amount = Number(quantity);

    if (!Number.isInteger(amount)) return;

    if (amount <= 0) {
      removeItem(id);
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(100, amount)
            }
          : item
      )
    );
  }

  function removeItem(id) {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.product?.price || 0) *
            item.quantity,
        0
      ),
    [cart]
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
