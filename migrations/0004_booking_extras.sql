-- Booking reminders and the client's own time zone.
ALTER TABLE bookings ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE bookings ADD COLUMN client_tz TEXT;
