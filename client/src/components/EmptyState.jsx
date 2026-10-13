import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

export default function EmptyState({
  icon: Icon = Package,
  title, text, link, linkText
}) {
  return (
    <div className="empty-state">
      <Icon size={55} />
      <h2>{title}</h2>
      {text && <p>{text}</p>}

      {link && (
        <Link className="btn btn-primary" to={link}>
          {linkText || "Explore Products"}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}