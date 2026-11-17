import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { availability } from "@/lib/data/bookings";
import { currentUser } from "@/lib/auth";
import { localeMeta } from "@/lib/i18n/config";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { PageHero } from "@/components/sections/PageHero";
import { BookingForm } from "@/components/booking/BookingForm";
import { Container } from "@/components/ui/misc";
import { requestBooking } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.booking.title, description: d.booking.lead };
}

export default async function Booking({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ topic?: string }> }) {
  const { locale, d } = await pageContext(params);
  const [{ config, days }, user, sp] = await Promise.all([availability(), currentUser(), searchParams]);
  return (
    <>
      <PageHero label={d.nav.booking} title={d.booking.title} lead={d.booking.lead} />
      <Container className="pb-24">
        <div className="rounded-[6px] border border-line bg-night-2/50 p-6 backdrop-blur-sm md:p-12">
          <BookingForm
            action={requestBooking}
            d={d}
            locale={locale}
            intl={localeMeta[locale].intl}
            timeZone={config.timeZone}
            days={days}
            slotMinutes={config.slotMinutes}
            topics={TOPIC_KEYS.map((k) => ({ key: k, label: topicLabel(k, locale) }))}
            initialTopic={sp.topic}
            defaults={{ name: user?.name, email: user?.email, phone: user?.phone ?? undefined }}
          />
        </div>
      </Container>
    </>
  );
}
