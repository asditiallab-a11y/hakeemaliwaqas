import { FaYoutube, FaWhatsapp } from "react-icons/fa";
import { DEFAULT_WHATSAPP as WHATSAPP_NUMBER } from "../lib/whatsapp"; // number badalna ho to lib/whatsapp.js mein
import "./FloatingContact.css";

// Right side par fixed 2 buttons (YouTube + WhatsApp). Hover par expand hokar label dikhate hain.
// Sab pages par dikhte hain (App.jsx mein SocialSidebar ke saath lagaya hai).
const YOUTUBE_URL = "https://www.youtube.com/@hakeemaliwaqas3335?sub_confirmation=1";
const WA_MESSAGE = "Assalam o Alaikum, I would like to consult Prof Hakeem Ali Waqas.";

export default function FloatingContact() {
  return (
    <div className="fc-wrap">
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fc-btn fc-yt"
        aria-label="YouTube Channel"
      >
        <span className="fc-icon"><FaYoutube /></span>
        <span className="fc-label">YOUTUBE</span>
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fc-btn fc-wa"
        aria-label="Chat on WhatsApp"
      >
        <span className="fc-icon"><FaWhatsapp /></span>
        <span className="fc-label">WHATSAPP</span>
      </a>
    </div>
  );
}
