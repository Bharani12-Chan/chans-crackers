import React, {
  createContext, useContext, useEffect, useMemo, useState
} from "react";

const StoreContext = createContext(null);

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be inside StoreProvider");
  return store;
};

export const money = value =>
  "₹" + Number(value || 0).toLocaleString("en-IN");

export const FALLBACK_IMAGE =
  "https://placehold.co/800x800/21163c/ffd78a?text=Chan%27s+Crackers";

export const IMAGES = {
  hero1: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=85",
  hero2: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=1600&q=85",
  hero3: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=85",
  sparkler: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=800&q=80",
  celebration: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&q=80"
};

export const categories = ["All", "Sparklers", "Gift Boxes", "Combos"];

const initialProducts = [
  {
    id: "p1", name: "Golden Sparklers", category: "Sparklers",
    price: 149, oldPrice: 220, stock: 50, rating: 4.8,
    badge: "Bestseller", image: IMAGES.sparkler,
    description: "A beautiful festive sparkler collection."
  },
  {
    id: "p2", name: "Celebration Gift Box", category: "Gift Boxes",
    price: 999, oldPrice: 1499, stock: 25, rating: 4.9,
    badge: "Popular", image: IMAGES.celebration,
    description: "A curated festive gift collection."
  },
  {
    id: "p3", name: "Festival Sparkle Pack", category: "Sparklers",
    price: 299, oldPrice: 399, stock: 45, rating: 4.7,
    badge: "New", image: IMAGES.hero3,
    description: "A colorful collection for festive occasions."
  },
  {
    id: "p4", name: "Premium Celebration Kit", category: "Gift Boxes",
    price: 1899, oldPrice: 2499, stock: 18, rating: 4.9,
    badge: "Premium", image: IMAGES.hero2,
    description: "Our premium celebration-themed collection."
  },
  {
    id: "p5", name: "Golden Moments Combo", category: "Combos",
    price: 749, oldPrice: 1099, stock: 32, rating: 4.8,
    badge: "Offer", image: IMAGES.hero1,
    description: "A festive combo for memorable moments."
  },
  {
    id: "p6", name: "Family Festival Box", category: "Combos",
    price: 1299, oldPrice: 1799, stock: 20, rating: 4.6,
    badge: "Family Pick", image: IMAGES.celebration,
    description: "A family celebration collection."
  }
];

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const createId = () =>
  crypto.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() =>
    read("cc_products", initialProducts)
  );
  const [cart, setCart] = useState(() => read("cc_cart", []));
  const [orders, setOrders] = useState(() => read("cc_orders", []));
  const [users, setUsers] = useState(() => read("cc_users", []));
  const [session, setSession] = useState(() => read("cc_session", null));
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("cc_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("cc_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("cc_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("cc_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (session) {
      localStorage.setItem("cc_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("cc_session");
    }
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = message => setToast(message);

  const cartItems = useMemo(() =>
    cart.map(item => ({
      ...item,
      product: products.find(p => p.id === item.id)
    })).filter(item => item.product),
    [cart, products]
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  const addCart = (id, amount = 1) => {
    const product = products.find(p => p.id === id);
    if (!product || product.stock < 1) {
      notify("Product is unavailable");
      return;
    }

    setCart(previous => {
      const existing = previous.find(item => item.id === id);
      if (existing) {
        return previous.map(item =>
          item.id === id
            ? {
                ...item,
                quantity: Math.min(
                  product.stock, item.quantity + amount
                )
              }
            : item
        );
      }
      return [...previous, {
        id, quantity: Math.min(amount, product.stock)
      }];
    });

    notify("Product added to cart");
  };

  const updateCart = (id, quantity) => {
    const product = products.find(p => p.id === id);
    setCart(previous =>
      quantity <= 0
        ? previous.filter(item => item.id !== id)
        : previous.map(item =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.min(quantity, product?.stock || 0)
                }
              : item
          ).filter(item => item.quantity > 0)
    );
  };

  const register = (name, email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(user => user.email === cleanEmail)) {
      notify("This demo email is already registered");
      return false;
    }

    const account = {
      id: createId(), name: name.trim(),
      email: cleanEmail, role: "customer"
    };
    setUsers(previous => [...previous, account]);
    setSession(account);
    notify("Demo account created");
    return true;
  };

  const login = (email, role = "customer") => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(user => user.email === cleanEmail);
    const account = {
      id: existing?.id || createId(),
      name: existing?.name || cleanEmail.split("@")[0],
      email: cleanEmail,
      role
    };
    setSession(account);
    notify("Welcome to Chan's Crackers");
    return account;
  };

  const logout = () => {
    setSession(null);
    notify("Logged out");
  };

  const placeOrder = address => {
    if (!session || !cartItems.length) return null;

    if (cartItems.some(item =>
      item.quantity > item.product.stock
    )) {
      notify("Some items exceed available stock");
      return null;
    }

    const order = {
      id: `CC-${Date.now()}`,
      userId: session.id,
      email: session.email,
      customer: session.name,
      address,
      items: cartItems.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity
      })),
      total: subtotal,
      status: "Placed",
      paymentStatus: "Demo Success",
      createdAt: new Date().toISOString()
    };

    setOrders(previous => [order, ...previous]);
    setProducts(previous => previous.map(product => {
      const ordered = cartItems.find(
        item => item.id === product.id
      );
      return ordered
        ? {
            ...product,
            stock: Math.max(
              0, product.stock - ordered.quantity
            )
          }
        : product;
    }));
    setCart([]);
    notify("Demo order placed successfully");
    return order;
  };

  const saveProduct = data => {
    if (data.id) {
      setProducts(previous =>
        previous.map(product =>
          product.id === data.id ? { ...product, ...data } : product
        )
      );
      notify("Product updated");
    } else {
      setProducts(previous => [{
        ...data,
        id: createId(),
        rating: 4.5
      }, ...previous]);
      notify("Product added");
    }
  };

  const deleteProduct = id => {
    setProducts(previous =>
      previous.filter(product => product.id !== id)
    );
    setCart(previous =>
      previous.filter(item => item.id !== id)
    );
    notify("Product deleted");
  };

  const updateOrder = (id, status) => {
    setOrders(previous =>
      previous.map(order =>
        order.id === id ? { ...order, status } : order
      )
    );
    notify("Order status updated");
  };

  const addAdmin = (name, email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(user => user.email === cleanEmail)) {
      notify("Email already exists");
      return false;
    }

    setUsers(previous => [...previous, {
      id: createId(),
      name: name.trim(),
      email: cleanEmail,
      role: "admin"
    }]);
    notify("Demo admin record added");
    return true;
  };

  return (
    <StoreContext.Provider value={{
      products, cartItems, cartCount, subtotal,
      orders, users, session, toast, notify,
      addCart, updateCart, register, login, logout,
      placeOrder, saveProduct, deleteProduct,
      updateOrder, addAdmin
    }}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>✓</span> {toast}
        </div>
      )}
    </StoreContext.Provider>
  );
}