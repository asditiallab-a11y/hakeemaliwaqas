import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaFacebookF, FaWhatsapp, FaTwitter, FaLinkedinIn, FaTelegramPlane, FaShareAlt, FaCheck } from "react-icons/fa";
import "./SocialSidebar.css";

// Sab pages par left side par fixed rehta hai (App.jsx mein ek baar lagaya hai).
// Har button us waqt khuli hui page ka link share karta hai (Facebook, WhatsApp, X/Twitter, LinkedIn, Telegram).
// Aakhri "Share" button: mobile par phone ka share menu, desktop par link copy.
const SITE_NAME = "Prof Hakeem Ali Waqas";

export default function SocialSidebar() {
  const { pathname, search } = useLocation(); // route badalne par link khud update hota hai
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}${pathname}${search}` : "";
  const title = typeof document !== "undefined" && document.title ? document.title : SITE_NAME;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const items = [
    { cls: "fb", icon: <FaFacebookF />, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { cls: "wa", icon: <FaWhatsapp />, label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { cls: "tw", icon: <FaTwitter />, label: "Twitter", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { cls: "li", icon: <FaLinkedinIn />, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { cls: "tg", icon: <FaTelegramPlane />, label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];

  const nativeShare = async (e) => {
    e.preventDefault();
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* user ne cancel kiya */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="social-icons-fixed">
      {items.map((i) => (
        <a
          key={i.label}
          href={i.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-icon ${i.cls}`}
          data-tooltip={`Share on ${i.label}`}
          aria-label={`Share on ${i.label}`}
        >
          {i.icon}
        </a>
      ))}
      <a
        href={url}
        onClick={nativeShare}
        className="social-icon sh"
        data-tooltip={copied ? "Link copied!" : "Copy / Share link"}
        aria-label="Share this page"
      >
        {copied ? <FaCheck /> : <FaShareAlt />}
      </a>
    </div>
  );
}
