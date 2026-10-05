import { FaScroll } from "react-icons/fa";
import LegalPage from "./LegalPage";
import { TERMS_DEFAULTS } from "../data/legal";

// Admin > Pages > Terms of Service  ->  /api/site/terms
export default function TermsOfService() {
  return <LegalPage apiName="terms" defaults={TERMS_DEFAULTS} icon={FaScroll} imageSide="left" />;
}
