import { requireSupabaseClient, executeSql } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET — Verifica conexión a Supabase y lista tablas existentes
 */
export async function GET() {
  try {
    const sb = requireSupabaseClient();

    // Listar tablas en el schema public
    const { data, error } = await sb.rpc('get_table_info');

    if (error) {
      // Si el RPC no existe, hacer query manual
      const { data: tables, error: tablesError } = await sb.from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');

      if (tablesError) {
        return NextResponse.json(
          { connected: false, error: 'Error al listar tablas: ' + tablesError.message },
          { status: 500 }
        );
      }

      // Contar filas en cada tabla
      const tableInfo: Record<string, number> = {};
      for (const row of tables || []) {
        const tableName = (row as any).table_name;
        try {
          const { count } = await sb.from(tableName).select('*', { count: 'exact', head: true });
          tableInfo[tableName] = count || 0;
        } catch {
          tableInfo[tableName] = -1; // Error al contar
        }
      }

      return NextResponse.json({ connected: true, tables: tableInfo });
    }

    return NextResponse.json({ connected: true, tables: data || {} });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST — Crea todas las tablas necesarias
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action !== 'create-all') {
      return NextResponse.json({ error: 'Action no válida' }, { status: 400 });
    }

    // Definir tablas en orden (respetando dependencias)
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'recepcionista')),
            name VARCHAR(255) NOT NULL,
            must_change_password BOOLEAN DEFAULT false,
            disabled BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY service_role_all ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `,
      },
      {
        name: 'rooms',
        sql: `
          CREATE TABLE IF NOT EXISTS rooms (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            number VARCHAR(50) UNIQUE NOT NULL,
            type VARCHAR(50) NOT NULL,
            price_per_night DECIMAL(10, 2) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'ocupada')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY service_role_all ON rooms FOR ALL TO service_role USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(number);
          CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
        `,
      },
      {
        name: 'guests',
        sql: `
          CREATE TABLE IF NOT EXISTS guests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            identification VARCHAR(50) UNIQUE NOT NULL,
            phone VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY service_role_all ON guests FOR ALL TO service_role USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_guests_identification ON guests(identification);
        `,
      },
      {
        name: 'check_ins',
        sql: `
          CREATE TABLE IF NOT EXISTS check_ins (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
            guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
            guest_name VARCHAR(255) NOT NULL,
            guest_identification VARCHAR(50) NOT NULL,
            guest_phone VARCHAR(20),
            check_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
            checkout_at TIMESTAMP WITH TIME ZONE NOT NULL,
            price_per_night DECIMAL(10, 2) NOT NULL,
            nights INTEGER NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'completada')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY service_role_all ON check_ins FOR ALL TO service_role USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_check_ins_room_id ON check_ins(room_id);
          CREATE INDEX IF NOT EXISTS idx_check_ins_guest_id ON check_ins(guest_id);
          CREATE INDEX IF NOT EXISTS idx_check_ins_status ON check_ins(status);
        `,
      },
      {
        name: 'check_outs',
        sql: `
          CREATE TABLE IF NOT EXISTS check_outs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            check_in_id UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
            booking_id UUID NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            checked_out_by VARCHAR(255),
            actual_checkout_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          ALTER TABLE check_outs ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY service_role_all ON check_outs FOR ALL TO service_role USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_check_outs_check_in_id ON check_outs(check_in_id);
          CREATE INDEX IF NOT EXISTS idx_check_outs_booking_id ON check_outs(booking_id);
        `,
      },
      {
        name: 'audit_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            user_email VARCHAR(255),
            action VARCHAR(255) NOT NULL,
            summary TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY service_role_all ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
          
          CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
          CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        `,
      },
    ];

    // Stream de respuesta
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];

            try {
              // Ejecutar SQL
              await executeSql(table.sql);

              // Enviar resultado exitoso
              const result = {
                step: i + 1,
                table: table.name,
                status: 'success',
                message: `Tabla creada exitosamente`,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
            } catch (error) {
              // Enviar resultado de error
              const result = {
                step: i + 1,
                table: table.name,
                status: 'error',
                message: error instanceof Error ? error.message : 'Error desconocido',
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
            }

            // Pequeño delay para evitar sobrecargar
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // Notificar a PostgREST que recargue el schema
          try {
            await executeSql(`NOTIFY pgrst, 'reload schema';`);
          } catch (e) {
            // Ignorar errores en NOTIFY
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
