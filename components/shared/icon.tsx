import {
  Award,
  CalendarCheck,
  HeartHandshake,
  MessageCircle,
  Receipt,
  Scan,
  ShieldCheck,
  Sofa,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/** Maps CMS icon keys to Lucide icons (keeps icon choice editable from JSON). */
const ICONS: Record<string, LucideIcon> = {
  award: Award,
  "calendar-check": CalendarCheck,
  "heart-handshake": HeartHandshake,
  "message-circle": MessageCircle,
  receipt: Receipt,
  scan: Scan,
  "shield-check": ShieldCheck,
  sofa: Sofa,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
};

export const ICON_KEYS = Object.keys(ICONS);

export function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
