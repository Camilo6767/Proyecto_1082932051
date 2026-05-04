-- Create booking records for check-in, stay tracking, and checkout
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
  guest_name text NOT NULL,
  guest_identification text NOT NULL,
  guest_phone text NOT NULL,
  check_in_at timestamptz NOT NULL,
  checkout_at timestamptz NOT NULL,
  price_per_night numeric(10,2) NOT NULL,
  nights integer NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('activa', 'completada')) DEFAULT 'activa',
  actual_checkout_at timestamptz,
  checked_out_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_room_id_idx ON public.bookings (room_id);
CREATE INDEX IF NOT EXISTS bookings_guest_id_idx ON public.bookings (guest_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
