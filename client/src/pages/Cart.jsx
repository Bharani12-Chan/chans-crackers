import { Link } from "react-router-dom";
import {
  Trash2, Minus, Plus, ArrowRight, ShoppingBag
} from "lucide-react";
import {
  useStore, money, imageFallback
} from "../context/StoreContext";
import PageBanner from "../components/PageBanner";
import EmptyState from "../components/EmptyState";

export default function Cart() {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    user
  } = useStore();

  return (
    <>
      <PageBanner
        eyebrow="YOUR SELECTION"
        title="Shopping Cart"
        description="Review your favorite products before placing your demo order."
      />

      <section className="section container">
        {!cartItems.length ? (
          <EmptyState
            title="Your cart is waiting for something special"
            description="Explore the collection and add your favorites."
          />
        ) : (
          <div className="checkout-layout">
            <div className="cart-list">
              <h2>Your Items ({cartItems.length})</h2>

              {cartItems.map(item => (
                <div className="cart-item" key={item.productId}>
                  <img
                    src={item.image || imageFallback}
                    alt={item.name}
                  />

                  <div className="cart-item-info">
                    <span>{item.category}</span>
                    <Link to={`/product/${item.productId}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    <strong>{money(item.price)}</strong>

                    <div className="quantity-picker small">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-end">
                    <strong>{money(item.price * item.quantity)}</strong>
                    <button
                      className="delete-icon"
                      onClick={() => removeFromCart(item.productId)}
                      aria-label="Remove product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <Link to="/shop" className="back-link">
                <ShoppingBag size={17} /> Continue Shopping
              </Link>
            </div>

            <aside className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Demo only</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>

              <Link
                to={user ? "/checkout" : "/login"}
                className="btn btn-primary btn-full"
              >
                {user ? "Proceed to Checkout" : "Login to Checkout"}
                <ArrowRight size={18} />
              </Link>

              <p className="small-note">
                This is a demonstration. No actual payment is charged.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}