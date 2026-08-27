import biryani from "../assets/menu/biryani.png";
import beef from "../assets/menu/beef.png";
import fish from "../assets/menu/fish.png";
import samosa from "../assets/menu/samosa.png";
import FoodArt from "./FoodArt";

const images = { biryani, beef, fish, samosa };

export default function MenuImage({ type, className = "" }) {
  return images[type] ? (
    <img className={`food-photo ${className}`} src={images[type]} alt="" />
  ) : (
    <FoodArt type={type} />
  );
}
