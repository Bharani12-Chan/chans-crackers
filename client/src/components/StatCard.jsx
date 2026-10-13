import React from "react";
import { LayoutDashboard } from "lucide-react";

export default function StatCard({
  icon: Icon = LayoutDashboard, title, value
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}