-- HostDesk: Script SQL para crear tablas en Supabase
-- Ejecuta esto en el editor SQL de Supabase: https://supabase.com/dashboard/project/[tu-proyecto]/sql/new

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'receptionist',
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(10) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  price_per_night NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla check_ins
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  identification_type VARCHAR(50),
  identification_number VARCHAR(50),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'checked_in',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla check_outs
CREATE TABLE IF NOT EXISTS check_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  check_out_date DATE NOT NULL,
  total_nights INT,
  total_amount NUMERIC(10, 2),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(number);
CREATE INDEX IF NOT EXISTS idx_check_ins_room_id ON check_ins(room_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_by ON check_ins(created_by);
CREATE INDEX IF NOT EXISTS idx_check_outs_check_in_id ON check_outs(check_in_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
