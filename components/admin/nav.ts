import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileHeart,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareQuote,
  Pill,
  Receipt,
  Settings,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Inbox,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: { label?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Clinic",
    items: [
      { href: "/admin/appointments", label: "Appointments", icon: ClipboardList },
      { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/admin/patients", label: "Patients", icon: Users },
      { href: "/admin/treatments", label: "Treatments", icon: FileHeart },
      { href: "/admin/prescriptions", label: "Prescriptions", icon: Pill },
      { href: "/admin/billing", label: "Billing", icon: Receipt },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/services", label: "Services", icon: Sparkles },
      { href: "/admin/dentists", label: "Dentists", icon: Stethoscope },
      { href: "/admin/portfolio", label: "Portfolio", icon: UserRound },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
    ],
  },
  { label: "Insights", items: [{ href: "/admin/reports", label: "Reports", icon: BarChart3 }] },
  { items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];
