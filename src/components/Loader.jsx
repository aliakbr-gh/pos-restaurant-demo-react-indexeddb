import { CookingPot } from "lucide-react";

export default function Loader({
  fullscreen = false,
  label = "Preparing your workspace...",
}) {
  return (
    <div
      className={fullscreen ? "app-loader" : "inline-loader"}
      role="status"
      aria-live="polite"
    >
      <div className="food-loader">
        <div className="steam">
          <i />
          <i />
          <i />
        </div>
        <CookingPot size={50} strokeWidth={1.7} />
        <span className="food-dot dot-one" />
        <span className="food-dot dot-two" />
        <span className="food-dot dot-three" />
      </div>
      <p>{label}</p>
    </div>
  );
}
