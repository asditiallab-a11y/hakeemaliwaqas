import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { startScrollReveal } from "./engine.js";
import "./scrollReveal.css";

// App mein ek baar lagao (website + admin dono ke liye):
//  1) har element scroll par fade-up hota hai
//  2) page badalne par poora page halka sa fade-in hota hai (video jaisa)
export default function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => startScrollReveal("#root"), []);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root || !root.animate) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const a = root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
    return () => a.cancel();
  }, [pathname]);

  return null;
}
