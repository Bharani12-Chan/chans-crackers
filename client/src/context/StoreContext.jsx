import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const StoreContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "/api";

export const money = value =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

export const imageFallback =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem("cc_cart_v2"));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState(readCart);
  const [notice, setNotice] = useState("");

  async function refreshProducts() {
    setProductsLoading(true);
    try {
      const data = await request("/products");
      setProducts(data.products || []);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    request("/auth/me")
      .then(data => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    refreshProducts();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("cc_cart_v2", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await request("/auth/logout", { method: "POST" });
    setUser(null);
    setCart([]);
  }

  function addToCart(product, quantity = 1) {
    if (!product || product.stock < 1) {
      setNotice("This product is currently out of stock");
      return;
    }

    const id = product._id;

    setCart(previous => {
      const existing = previous.find(item => item.productId === id);
      const currentQty = existing?.quantity || 0;

      return existing
        ? previous.map(item =>
            item.productId === id
              ? {
                  ...item,
                  quantity: Math.min(
                    product.stock,
                    currentQty + quantity
                  )
                }
              : item
          )
        : [...previous, {
            productId: id,
            quantity: Math.min(product.stock, quantity)
          }];
    });

    setNotice(`${product.name} added to your cart`);
  }

  function updateQuantity(id, quantity) {
    const product = products.find(item => item._id === id);

    if (quantity <= 0) {
      setCart(previous =>
        previous.filter(item => item.productId !== id)
      );
      return;
    }

    setCart(previous =>
      previous.map(item =>
        item.productId === id
          ? {
              ...item,
              quantity: Math.min(
                Math.max(1, quantity),
                product?.stock || 1
              )
            }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart(previous =>
      previous.filter(item => item.productId !== id)
    );
  }

  const cartItems = useMemo(() =>
    cart.map(item => {
      const product = products.find(
        product => product._id === item.productId
      );

      return product
        ? {
            ...product,
            productId: item.productId,
            quantity: item.quantity
          }
        : null;
    }).filter(Boolean),
    [cart, products]
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const value = {
    user,
    authLoading,
    products,
    productsLoading,
    cart,
    cartItems,
    cartCount,
    cartTotal,
    notice,
    setNotice,
    login,
    register,
    logout,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: () => setCart([]),
    refreshProducts,
    api: request
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}