
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() => {
        document
          .getElementById(hash.substring(1))
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      });

      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo(0, 0);

    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, search, hash]);

  return null;
}
