import { getSupabaseClient } from './supabase';
import { appendAudit } from './blobAudit';
import { getSeedUserByEmail, getSeedRooms, getSeedUsers } from './seedReader';
import { getAppliedMigrationNames } from './pgMigrate';
import { hashPassword } from './auth';
import { type AuditEntry, type SystemMode, type User, type SeedUser, type SeedRoom, type UserWithPassword, type Room, type RoomWithActiveGuest, type CreateRoomRequest, type UpdateRoomRequest, type Guest, type Booking, type BookingWithGuest, type BookingWithTotal, type CheckInRequest, type Role } from './types';
import { createRoomSchema, updateRoomSchema } from './roomSchemas';
import { checkInSchema } from './checkinSchemas';

function mapSeedUser(seedUser: SeedUser): User {
  return {
    id: `seed:${seedUser.email}`,
    email: seedUser.email,
    name: seedUser.name,
    role: seedUser.role,
    must_change_password: false,
    disabled: false,
  };
}

export async function getSystemMode(): Promise<SystemMode> {
  if (!process.env.DATABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 'seed';
  }

  try {
    const applied = await getAppliedMigrationNames();
    return applied.includes('0001_init_users.sql') ? 'live' : 'seed';
  } catch {
    return 'seed';
  }
}

export async function getUserCredentialsByEmail(email: string): Promise<UserWithPassword | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const seedUser = await getSeedUserByEmail(email);
    return seedUser
      ? {
          ...mapSeedUser(seedUser),
          password_hash: seedUser.password_hash,
        }
      : null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, must_change_password, disabled, password_hash')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Supabase getUserCredentialsByEmail error:', error.message);
    return null;
  }

  return data as UserWithPassword | null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userWithPassword = await getUserCredentialsByEmail(email);
  if (!userWithPassword) return null;
  const { password_hash, ...user } = userWithPassword;
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const seedUser = await getSeedUserByEmail(id.replace(/^seed:/, ''));
    return seedUser ? mapSeedUser(seedUser) : null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, must_change_password, disabled')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase getUserById error:', error.message);
    return null;
  }

  return data as User | null;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  await appendAudit(entry);
}

export async function changePassword(userId: string, newPassword: string): Promise<User> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const hashedPassword = await hashPassword(newPassword);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword, must_change_password: false })
    .eq('id', userId)
    .select('id, email, name, role, must_change_password, disabled')
    .maybeSingle();

  if (error || !data) {
    throw new Error('No se pudo actualizar la contraseña.');
  }

  return data as User;
}

function mapSeedRoom(seedRoom: SeedRoom): RoomWithActiveGuest {
  return {
    id: `seed:${seedRoom.number}`,
    number: seedRoom.number,
    type: seedRoom.type,
    price_per_night: seedRoom.price_per_night,
    status: 'disponible',
    is_active: true,
    activeGuestName: null,
    expectedCheckoutDate: null,
  };
}

export async function getRooms(): Promise<RoomWithActiveGuest[]> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const seedRooms = await getSeedRooms();
    return seedRooms.map(mapSeedRoom).sort((a, b) => a.number.localeCompare(b.number));
  }

  const supabase = getSupabaseClient();
  const [roomsResponse, bookingsResponse] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('number', { ascending: true }),
    supabase
      .from('bookings')
      .select('id, room_id, guest_name, checkout_at, status')
      .eq('status', 'activa'),
  ]);

  if (roomsResponse.error) {
    console.error('Supabase getRooms error:', roomsResponse.error.message);
    return [];
  }

  const activeBookings = (bookingsResponse.data ?? []) as Booking[];
  const rooms = roomsResponse.data as Room[];

  return rooms.map((room) => {
    const activeBooking = activeBookings.find((booking) => booking.room_id === room.id);
    return {
      ...room,
      activeBookingId: activeBooking?.id ?? null,
      activeGuestName: activeBooking?.guest_name ?? null,
      expectedCheckoutDate: activeBooking?.checkout_at ?? null,
    };
  });
}

export async function getRoomById(id: string): Promise<RoomWithActiveGuest | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const seedRooms = await getSeedRooms();
    const number = id.replace(/^seed:/, '');
    const seedRoom = seedRooms.find((room) => room.number === number);
    return seedRoom ? mapSeedRoom(seedRoom) : null;
  }

  const supabase = getSupabaseClient();
  const [{ data: roomData, error: roomError }, { data: bookingData, error: bookingError }] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('bookings')
      .select('id, room_id, guest_name, checkout_at, status')
      .eq('room_id', id)
      .eq('status', 'activa')
      .maybeSingle(),
  ]);

  if (roomError) {
    console.error('Supabase getRoomById error:', roomError.message);
    return null;
  }

  if (bookingError) {
    console.error('Supabase getRoomById booking error:', bookingError.message);
  }

  if (!roomData) {
    return null;
  }

  const activeBooking = bookingData as Booking | null;
  return {
    ...roomData,
    activeBookingId: activeBooking?.id ?? null,
    activeGuestName: activeBooking?.guest_name ?? null,
    expectedCheckoutDate: activeBooking?.checkout_at ?? null,
  } as RoomWithActiveGuest;
}

export async function createRoom(room: CreateRoomRequest): Promise<Room> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const parsed = createRoomSchema.parse(room);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('rooms').insert({
    number: parsed.number,
    type: parsed.type,
    price_per_night: parsed.price_per_night,
    status: 'disponible',
    is_active: true,
  }).select().maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo crear la habitación.');
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'room.created',
    summary: `Habitación ${parsed.number} creada por admin.`,
    metadata: { roomId: data.id, number: data.number },
  });

  return data as Room;
}

export async function updateRoom(id: string, updates: UpdateRoomRequest): Promise<Room> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const parsed = updateRoomSchema.parse(updates);
  const supabase = getSupabaseClient();

  const { data: currentRoom, error: fetchError } = await supabase
    .from('rooms')
    .select('id, status, number')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!currentRoom) {
    throw new Error('Habitación no encontrada.');
  }

  if (currentRoom.status !== 'disponible') {
    throw new Error('No se puede editar una habitación ocupada. Registra el check-out primero.');
  }

  const { data, error } = await supabase
    .from('rooms')
    .update(parsed)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo actualizar la habitación.');
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'room.updated',
    summary: `Habitación ${currentRoom.number} actualizada por admin.`,
    metadata: { roomId: id, updates: parsed },
  });

  return data as Room;
}

export async function deactivateRoom(id: string): Promise<void> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const supabase = getSupabaseClient();
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, number')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!room) {
    throw new Error('Habitación no encontrada.');
  }

  const { error } = await supabase
    .from('rooms')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'room.deactivated',
    summary: `Habitación ${room.number} desactivada por admin.`,
    metadata: { roomId: id },
  });
}

export async function getGuestByIdentification(identification: string): Promise<Guest | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('identification', identification)
    .maybeSingle();

  if (error) {
    console.error('Supabase getGuestByIdentification error:', error.message);
    return null;
  }

  return data as Guest | null;
}

export async function createGuest(name: string, identification: string, phone: string): Promise<Guest> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('guests')
    .insert({ name, identification, phone })
    .select()
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo crear el huésped.');
  }

  return data as Guest;
}

export async function checkIn(request: CheckInRequest): Promise<Booking> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const parsed = checkInSchema.parse(request);
  const supabase = getSupabaseClient();

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, number, status, price_per_night')
    .eq('id', parsed.roomId)
    .eq('is_active', true)
    .maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!room) {
    throw new Error('Habitación no encontrada.');
  }

  if (room.status !== 'disponible') {
    throw new Error('La habitación no está disponible para check-in.');
  }

  const nights = Math.max(
    Math.ceil((new Date(parsed.checkOutAt).getTime() - new Date(parsed.checkInAt).getTime()) / (1000 * 60 * 60 * 24)),
    1,
  );
  const totalAmount = room.price_per_night * nights;

  let guest = await getGuestByIdentification(parsed.guestIdentification);
  if (!guest) {
    guest = await createGuest(parsed.guestName, parsed.guestIdentification, parsed.guestPhone);
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      room_id: room.id,
      guest_id: guest.id,
      guest_name: parsed.guestName,
      guest_identification: parsed.guestIdentification,
      guest_phone: parsed.guestPhone,
      check_in_at: parsed.checkInAt,
      checkout_at: parsed.checkOutAt,
      price_per_night: room.price_per_night,
      nights,
      total_amount: totalAmount,
      status: 'activa',
    })
    .select()
    .maybeSingle();

  if (bookingError || !booking) {
    throw new Error(bookingError?.message ?? 'No se pudo registrar el check-in.');
  }

  const { error: statusError } = await supabase
    .from('rooms')
    .update({ status: 'ocupada' })
    .eq('id', room.id);

  if (statusError) {
    throw new Error(statusError.message);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'booking.created',
    summary: `Check-in registrado para habitación ${room.number}.`,
    metadata: {
      roomId: room.id,
      bookingId: booking.id,
      guestId: guest.id,
      guestName: guest.name,
      checkoutAt: parsed.checkOutAt,
    },
  });

  return booking as Booking;
}

export async function getActiveBooking(roomId: string): Promise<BookingWithGuest | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guests (*)
    `)
    .eq('room_id', roomId)
    .eq('status', 'activa')
    .maybeSingle();

  if (error) {
    console.error('Supabase getActiveBooking error:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    guest: data.guests as Guest,
  } as BookingWithGuest;
}

export async function getBookingById(id: string): Promise<BookingWithGuest | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guests (*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase getBookingById error:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    guest: data.guests as Guest,
  } as BookingWithGuest;
}

export async function checkOut(userId: string, bookingId: string): Promise<BookingWithTotal> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('El sistema está en modo seed. Ejecuta el bootstrap primero.');
  }

  const supabase = getSupabaseClient();

  // Obtener la reserva activa
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('status', 'activa')
    .maybeSingle();

  if (bookingError) {
    throw new Error(bookingError.message);
  }

  if (!booking) {
    throw new Error('Reserva no encontrada o ya completada.');
  }

  // Calcular el total
  const totalAmount = booking.price_per_night * booking.nights;

  // Actualizar la reserva
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      total_amount: totalAmount,
      actual_checkout_at: new Date().toISOString(),
      status: 'completada',
      checked_out_by: userId,
    })
    .eq('id', bookingId)
    .select()
    .maybeSingle();

  if (updateError || !updatedBooking) {
    throw new Error(updateError?.message ?? 'No se pudo actualizar la reserva.');
  }

  // Liberar la habitación
  const { error: roomError } = await supabase
    .from('rooms')
    .update({ status: 'disponible' })
    .eq('id', booking.room_id);

  if (roomError) {
    throw new Error(roomError.message);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'booking.checkout',
    summary: `Check-out completado para habitación ${booking.room_id}.`,
    metadata: {
      bookingId,
      roomId: booking.room_id,
      guestId: booking.guest_id,
      totalAmount,
      checkedOutBy: userId,
    },
  });

  return {
    ...updatedBooking,
    total_amount: totalAmount,
  } as BookingWithTotal;
}

export async function getCompletedBookingsByMonth(year: number, month: number): Promise<BookingWithTotal[]> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    // En modo seed, no hay reservas completadas
    return [];
  }

  const supabase = getSupabaseClient();
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guests (
        name,
        identification,
        phone
      )
    `)
    .eq('status', 'completada')
    .gte('actual_checkout_at', startDate.toISOString())
    .lt('actual_checkout_at', endDate.toISOString())
    .order('actual_checkout_at', { ascending: false });

  if (error) {
    throw new Error(`Error obteniendo reservas completadas: ${error.message}`);
  }

  return data.map(row => ({
    ...row,
    guest_name: row.guests?.name || '',
    guest_identification: row.guests?.identification || '',
    guest_phone: row.guests?.phone || '',
    total_amount: row.total_amount || 0,
  })) as BookingWithTotal[];
}

export async function getAllUsers(): Promise<User[]> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    // En modo seed, devolver usuarios de seed
    const seedUsers = await getSeedUsers();
    return seedUsers.map(seedUser => ({
      id: `seed:${seedUser.email}`,
      email: seedUser.email,
      name: seedUser.name,
      role: seedUser.role,
    }));
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error obteniendo usuarios: ${error.message}`);
  }

  return data.map(row => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    must_change_password: row.must_change_password,
    disabled: row.disabled,
  }));
}

export async function createUser(email: string, name: string, role: Role, passwordHash: string): Promise<User> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('No se pueden crear usuarios en modo seed');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      name,
      role,
      password_hash: passwordHash,
      must_change_password: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creando usuario: ${error.message}`);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'create_user',
    summary: `Usuario ${email} creado`,
    metadata: { email, name, role },
  });

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    must_change_password: data.must_change_password,
    disabled: data.disabled,
  };
}

export async function updateUser(id: string, updates: Partial<Pick<User, 'name' | 'role' | 'disabled'>>): Promise<User> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('No se pueden actualizar usuarios en modo seed');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error actualizando usuario: ${error.message}`);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'update_user',
    summary: `Usuario ${id} actualizado`,
    metadata: updates,
  });

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    must_change_password: data.must_change_password,
    disabled: data.disabled,
  };
}

export async function deleteUser(id: string): Promise<void> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('No se pueden eliminar usuarios en modo seed');
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error eliminando usuario: ${error.message}`);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'delete_user',
    summary: `Usuario ${id} eliminado`,
    metadata: {},
  });
}

export async function resetUserPassword(id: string, newPasswordHash: string): Promise<void> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('No se pueden resetear contraseñas en modo seed');
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('users')
    .update({
      password_hash: newPasswordHash,
      must_change_password: true,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Error reseteando contraseña: ${error.message}`);
  }

  await recordAudit({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action: 'reset_password',
    summary: `Contraseña de usuario ${id} reseteada`,
    metadata: {},
  });
}
