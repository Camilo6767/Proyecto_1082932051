export type SystemMode = 'seed' | 'live';
export type Role = 'admin' | 'recepcionista';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  must_change_password?: boolean;
  disabled?: boolean;
}

export interface SeedUser {
  email: string;
  password_hash: string;
  role: Role;
  name: string;
}

export interface SeedRoom {
  number: string;
  type: string;
  price_per_night: number;
}

export interface SeedData {
  users: SeedUser[];
  rooms: SeedRoom[];
}

export interface Room {
  id: string;
  number: string;
  type: string;
  price_per_night: number;
  status: 'disponible' | 'ocupada';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoomWithActiveGuest extends Room {
  activeBookingId?: string | null;
  activeGuestName?: string | null;
  expectedCheckoutDate?: string | null;
}

export interface CreateRoomRequest {
  number: string;
  type: string;
  price_per_night: number;
}

export interface UpdateRoomRequest {
  type?: string;
  price_per_night?: number;
}

export interface Guest {
  id: string;
  name: string;
  identification: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  room_id: string;
  guest_id: string;
  guest_name: string;
  guest_identification: string;
  guest_phone: string;
  check_in_at: string;
  checkout_at: string;
  price_per_night: number;
  nights: number;
  total_amount?: number | null;
  status: 'activa' | 'completada';
  actual_checkout_at?: string | null;
  checked_out_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BookingWithGuest extends Booking {
  guest?: Guest;
}

export interface BookingWithTotal extends Booking {
  total_amount: number;
}

export interface CheckInRequest {
  roomId: string;
  guestName: string;
  guestIdentification: string;
  guestPhone: string;
  checkInAt: string;
  checkOutAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
  must_change_password?: boolean;
}

export interface UserWithPassword extends User {
  password_hash: string;
}
