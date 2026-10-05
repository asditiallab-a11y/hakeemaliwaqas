import {
  LayoutDashboard, Stethoscope, Pill, BookOpen, MessageSquare,
  Calendar, ClipboardCheck, ShoppingBag, MessageSquareText, Video,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/treatments", label: "Treatments", icon: Stethoscope },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/articles", label: "Articles", icon: BookOpen },
  { to: "/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/consultation-form", label: "Consultation Form", icon: ClipboardCheck },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/review-videos", label: "Review Videos", icon: MessageSquareText },
  { to: "/videos", label: "Videos", icon: Video },
];
