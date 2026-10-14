
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  CheckCircle2
} from "lucide-react";

import {
  useStore,
  money
} from "../context/StoreContext";

import {
  getProductId,
  getProductImage
} from "../data/categories";

import "../catalog.css";

const FALLBACK_IMAGE =
  "https://placehold.co/900x700/ede9fe/4c1d95?text=Chan%27s+Crackers";

export default function Product() {
  const { id } = useParams();

  const {
    products = [],
    addCart
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(
    (item) => getProductId(item) === String(id)
  );

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [id]);

  if (!product) {
    return (
      <main
        style={{
          minHeight: "75vh",
          display: "grid",
          placeItems: "center",
          padding: "50px 20px",
          background: "#faf8ff"
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 480
          }}
        >
          <Sparkles
            size={52}
            color="#7c3aed"
            style={{ marginBottom: 20 }}
          />

          <h1
            style={{
              color: "#2e1065",
              fontSize: 36,
              fontWeight: 900
            }}
          >
            Product Not Found
          </h1>

          <p
            style={{
              color: "#716b85",
              lineHeight: 1.8,
              margin: "15px 0 25px"
            }}
          >
            This product may be unavailable or the
            product list is still loading.
          </p>

          <Link
            to="/shop"
            className="btn btn-primary"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(current + 1, stock)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const handleAddToCart = () => {
    if (stock <= 0) return;

    addCart(getProductId(product), quantity);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  return (
    <main
      style={{
        background: "#faf8ff",
        minHeight: "100vh",
        paddingBottom: 90
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #ede9fe",
          padding: "20px 0"
        }}
      >
        <div className="container">
          <Link
            to="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              color: "#6d28d9",
              fontWeight: 800,
              fontSize: 14
            }}
          >
            <ArrowLeft size={18} />
            Back to Collection
          </Link>
        </div>
      </div>

      <section
        className="container"
        style={{
          paddingTop: 60
        }}
      >
        <div className="product-detail-grid">
          <div
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid #ede9fe",
              boxShadow:
                "0 15px 45px rgba(76,29,149,0.08)"
            }}
          >
            <img
              src={getProductImage(product)}
              alt={product.name}
              onError={(event) => {
                if (
                  event.currentTarget.src !==
                  FALLBACK_IMAGE
                ) {
                  event.currentTarget.src =
                    FALLBACK_IMAGE;
                }
              }}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 420,
                maxHeight: 570,
                objectFit: "cover",
                display: "block"
              }}
            />

            {product.badge && (
              <span
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: "#6d28d9",
                  color: "#ffffff",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 900,
                  fontSize: 12
                }}
              >
                {product.badge}
              </span>
            )}
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "clamp(24px, 4vw, 45px)",
              borderRadius: 24,
              border: "1px solid #ede9fe",
              boxShadow:
                "0 15px 45px rgba(76,29,149,0.06)"
            }}
          >
            <span
              style={{
                color: "#7c3aed",
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase"
              }}
            >
              {product.category}
            </span>

            <h1
              style={{
                color: "#2e1065",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 900,
                lineHeight: 1.15,
                margin: "15px 0 20px"
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                color: "#716b85",
                fontSize: 15,
                lineHeight: 1.9,
                marginBottom: 25
              }}
            >
              {product.description ||
                "Explore this festive product collection."}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 15,
                marginBottom: 20
              }}
            >
              <strong
                style={{
                  color: "#6d28d9",
                  fontSize: 38,
                  fontWeight: 900
                }}
              >
                {money(price)}
              </strong>

              {oldPrice > price && (
                <del
                  style={{
                    color: "#9990a9",
                    fontSize: 19
                  }}
                >
                  {money(oldPrice)}
                </del>
              )}

              {discount > 0 && (
                <span
                  style={{
                    background: "#ede9fe",
                    color: "#6d28d9",
                    padding: "8px 12px",
                    borderRadius: 9,
                    fontWeight: 900,
                    fontSize: 12
                  }}
                >
                  {discount}% OFF
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color:
                  stock > 0 ? "#15803d" : "#dc2626",
                fontWeight: 800,
                marginBottom: 30
              }}
            >
              <PackageCheck size={21} />

              {stock > 0
                ? `${stock} items available`
                : "Currently out of stock"}
            </div>

            <div
              style={{
                height: 1,
                background: "#ede9fe",
                marginBottom: 30
              }}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 18,
                alignItems: "center",
                marginBottom: 25
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ddd6fe",
                  borderRadius: 12,
                  overflow: "hidden",
                  height: 54
                }}
              >
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  style={{
                    width: 49,
                    height: "100%",
                    border: "none",
                    background: "#f5f3ff",
                    color: "#6d28d9",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer"
                  }}
                >
                  <Minus size={18} />
                </button>

                <strong
                  style={{
                    width: 52,
                    textAlign: "center",
                    color: "#2e1065",
                    fontSize: 18
                  }}
                >
                  {quantity}
                </strong>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= stock}
                  aria-label="Increase quantity"
                  style={{
                    width: 49,
                    height: "100%",
                    border: "none",
                    background: "#f5f3ff",
                    color: "#6d28d9",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock <= 0}
                style={{
                  flex: 1,
                  minWidth: 190,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  border: "none",
                  borderRadius: 12,
                  color: "#ffffff",
                  background:
                    stock > 0
                      ? "linear-gradient(135deg,#8b5cf6,#6d28d9)"
                      : "#a1a1aa",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor:
                    stock > 0
                      ? "pointer"
                      : "not-allowed"
                }}
              >
                {added ? (
                  <>
                    <CheckCircle2 size={21} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={21} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            <div
              style={{
                padding: 20,
                background: "#f5f3ff",
                borderRadius: 14,
                color: "#4c1d95",
                display: "grid",
                gap: 15
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center"
                }}
              >
                <ShieldCheck size={20} />
                <span>
                  Product information and availability
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center"
                }}
              >
                <Truck size={20} />
                <span>
                  Delivery subject to local availability
                  and applicable regulations
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center"
                }}
              >
                <Sparkles size={20} />
                <span>
                  Follow all product safety instructions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 35px;
          align-items: start;
        }

        @media (max-width: 850px) {
          .product-detail-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 550px) {
          .product-detail-grid {
            gap: 18px;
          }

          .product-detail-grid img {
            min-height: 300px !important;
          }
        }
      `}</style>
    </main>
  );
}
