import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useConsultation } from "./ConsultationContext";
import ConsultationForm from "./ConsultationForm";

// Popup window. Isko band karne se form ka data NAHI mitta -
// state ConsultationContext mein hai, to dobara kholne par wahin se shuru hota hai.
export default function ConsultationModal() {
  const { modalOpen, closeModal } = useConsultation();

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  return createPortal(
    <div className="cf-overlay" role="dialog" aria-modal="true">
      <ConsultationForm variant="modal" onClose={closeModal} />
    </div>,
    document.body
  );
}
