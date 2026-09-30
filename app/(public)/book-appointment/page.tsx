import type { Metadata } from "next";
import { PageHero } from "@/components/public/section";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { catalogService, settingsService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book your dental appointment online at SmileCare, Indore. Choose a treatment, dentist and a real-time available slot.",
  openGraph: { title: "Book an Appointment | SmileCare", description: "Real-time online booking at SmileCare Dental Clinic." },
};

type Props = { searchParams: Promise<{ service?: string; dentist?: string }> };

export default async function BookAppointmentPage({ searchParams }: Props) {
  const [{ service, dentist }, services, dentists, settings] = await Promise.all([
    searchParams,
    catalogService.listServices({ publishedOnly: true }),
    catalogService.listDentists({ activeOnly: true }),
    settingsService.get(),
  ]);

  return (
    <>
      <PageHero
        title="Book an appointment"
        description="Pick a treatment, your preferred dentist and a time that suits you. We'll confirm your booking by phone or SMS."
        crumbs={[{ label: "Book appointment" }]}
      />
      <section className="py-10 sm:py-14">
        <div className="container-page">
          <BookingWizard
            services={services.map(({ id, name, category, duration, price, description }) => ({ id, name, category, duration, price, description }))}
            dentists={dentists.map(({ id, name, photo, specialization, qualification, serviceIds, workingHours, leaves, experienceYears }) => ({
              id,
              name,
              photo,
              specialization,
              qualification,
              serviceIds,
              workingHours,
              leaves,
              experienceYears,
            }))}
            bookingWindowDays={settings.bookingWindowDays}
            clinicPhone={settings.phone}
            initialServiceId={services.some((s) => s.id === service) ? service : undefined}
            initialDentistId={dentists.some((d) => d.id === dentist) ? dentist : undefined}
          />
        </div>
      </section>
    </>
  );
}
