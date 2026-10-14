import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description = "There's nothing to display right now.",
  action = "Explore Products",
  to = "/shop"
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><PackageOpen size={34} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <Link className="btn btn-primary" to={to}>{action}</Link>}
    </div>
  );
}