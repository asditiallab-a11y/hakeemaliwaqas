import { FaShieldAlt } from "react-icons/fa";
import LegalPage from "./LegalPage";
import { PRIVACY_DEFAULTS } from "../data/legal";

// Admin > Pages > Privacy Policy  ->  /api/site/privacy
export default function PrivacyPolicy() {
  return <LegalPage apiName="privacy" defaults={PRIVACY_DEFAULTS} icon={FaShieldAlt} imageSide="right" />;
}
