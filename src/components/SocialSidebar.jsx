import { FaFacebookF, FaWhatsapp, FaTwitter, FaLinkedinIn, FaTelegramPlane, FaShareAlt } from "react-icons/fa";
import "./SocialSidebar.css";

// Sab pages par left side par fixed rehta hai (App.jsx mein ek baar lagaya hai)
const items = [
  { cls: "fb", icon: <FaFacebookF />, label: "Facebook", href: "#" },
  { cls: "wa", icon: <FaWhatsapp />, label: "WhatsApp", href: "#" },
  { cls: "tw", icon: <FaTwitter />, label: "Twitter", href: "#" },
  { cls: "li", icon: <FaLinkedinIn />, label: "LinkedIn", href: "#" },
  { cls: "tg", icon: <FaTelegramPlane />, label: "Telegram", href: "#" },
  { cls: "sh", icon: <FaShareAlt />, label: "Share", href: "#" },
];

export default function SocialSidebar() {
  return (
    <div className="social-icons-fixed">
      {items.map((i) => (
        <a key={i.label} href={i.href} className={`social-icon ${i.cls}`} data-tooltip={i.label} aria-label={i.label}>
          {i.icon}
        </a>
      ))}
    </div>
  );
}
