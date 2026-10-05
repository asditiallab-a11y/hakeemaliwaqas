import { useEffect } from "react";
import ConsultationForm from "../components/consultation/ConsultationForm";

// Alag link: /consultation  - patient ye link kholkar seedha form bhar kar submit kar sakta hai.
// Data wahi context/draft use karta hai, to popup aur ye page ek dusre ka progress share karte hain.
export default function ConsultationPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Consultation Form | Prof Hakeem Ali Waqas";
    return () => { document.title = prev; };
  }, []);

  return (
    <main className="cf-page">
      <ConsultationForm variant="page" />
    </main>
  );
}
