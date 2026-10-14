import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  linkText = "View All"
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {link && (
        <Link className="text-link" to={link}>
          {linkText} <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}