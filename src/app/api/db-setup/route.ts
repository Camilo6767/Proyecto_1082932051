import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const client = await pool.connect();

    try {
      // Crear tabla users
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'receptionist',
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla rooms
      await client.query(`
        CREATE TABLE IF NOT EXISTS rooms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          number VARCHAR(10) UNIQUE NOT NULL,
          type VARCHAR(50) NOT NULL,
          price_per_night NUMERIC(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla check_ins
      await client.query(`
        CREATE TABLE IF NOT EXISTS check_ins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_id UUID NOT NULL REFERENCES rooms(id),
          guest_name VARCHAR(255) NOT NULL,
          guest_email VARCHAR(255),
          guest_phone VARCHAR(20),
          identification_type VARCHAR(50),
          identification_number VARCHAR(50),
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          number_of_guests INT DEFAULT 1,
          status VARCHAR(50) DEFAULT 'checked_in',
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla check_outs
      await client.query(`
        CREATE TABLE IF NOT EXISTS check_outs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          check_in_id UUID NOT NULL REFERENCES check_ins(id),
          room_id UUID NOT NULL REFERENCES rooms(id),
          check_out_date DATE NOT NULL,
          total_nights INT,
          total_amount NUMERIC(10, 2),
          payment_method VARCHAR(50),
          status VARCHAR(50) DEFAULT 'completed',
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Crear tabla audit_log
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          action VARCHAR(255) NOT NULL,
          table_name VARCHAR(50),
          record_id UUID,
          old_values JSONB,
          new_values JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Limpiar datos existentes
      await client.query('DELETE FROM check_outs;');
      await client.query('DELETE FROM check_ins;');
      await client.query('DELETE FROM rooms;');
      await client.query('DELETE FROM users;');

      // Insertar admin initial
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO users (email, password_hash, role, name) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@hostdesk.com', hashedPassword, 'admin', 'Administrador']
      );

      // Insertar habitaciones
      const rooms = [
        { number: '101', type: 'sencilla', price: 80000 },
        { number: '102', type: 'sencilla', price: 80000 },
        { number: '201', type: 'doble', price: 120000 },
        { number: '202', type: 'doble', price: 120000 },
        { number: '301', type: 'suite', price: 200000 },
      ];

      for (const room of rooms) {
        await client.query(
          `INSERT INTO rooms (number, type, price_per_night) 
           VALUES ($1, $2, $3)`,
          [room.number, room.type, room.price]
        );
      }

      return Response.json(
        {
          success: true,
          message: 'Base de datos creada y seed inicial insertado exitosamente',
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
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
