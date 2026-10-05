import {
  LayoutDashboard, Stethoscope, Pill, BookOpen, MessageSquare,
  Calendar, ClipboardCheck, ShoppingBag, MessageSquareText, Video,
} from "lucide-react";

export const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/treatments", label: "Treatments", icon: Stethoscope },
  { to: "/admin/medicines", label: "Medicines", icon: Pill },
  { to: "/admin/articles", label: "Articles", icon: BookOpen },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/appointments", label: "Appointments", icon: Calendar },
  { to: "/admin/consultation-form", label: "Consultation Form", icon: ClipboardCheck },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/review-videos", label: "Review Videos", icon: MessageSquareText },
  { to: "/admin/videos", label: "Videos", icon: Video },
];
