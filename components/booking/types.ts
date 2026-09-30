import type { Dentist, Service, TimeSlot } from "@/types";

export type BookingService = Pick<Service, "id" | "name" | "category" | "duration" | "price" | "description">;
export type BookingDentist = Pick<
  Dentist,
  "id" | "name" | "photo" | "specialization" | "qualification" | "serviceIds" | "workingHours" | "leaves" | "experienceYears"
>;

export interface SlotsResponse {
  date: string;
  dentistId: string;
  duration: number;
  working: boolean;
  onLeave: boolean;
  leaveReason?: string;
  slots: TimeSlot[];
}
