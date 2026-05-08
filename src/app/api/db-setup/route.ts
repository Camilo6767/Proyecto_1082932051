import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Limpiar datos existentes
    await supabase.from('check_outs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('check_ins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insertar admin inicial
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { error: adminError } = await supabase.from('users').insert({
      email: 'admin@hostdesk.com',
      password_hash: hashedPassword,
      role: 'admin',
      name: 'Administrador',
    });

    if (adminError) throw adminError;

    // Insertar habitaciones
    const rooms = [
      { number: '101', type: 'sencilla', price_per_night: 80000 },
      { number: '102', type: 'sencilla', price_per_night: 80000 },
      { number: '201', type: 'doble', price_per_night: 120000 },
      { number: '202', type: 'doble', price_per_night: 120000 },
      { number: '301', type: 'suite', price_per_night: 200000 },
    ];

    const { error: roomsError } = await supabase.from('rooms').insert(rooms);

    if (roomsError) throw roomsError;

    return Response.json(
      {
        success: true,
        message: 'Seed inicial insertado exitosamente. Asegúrate de que las tablas ya existen en Supabase.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en db-setup:', error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
