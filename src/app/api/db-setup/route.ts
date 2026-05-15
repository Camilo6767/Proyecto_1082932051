import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST() {
  try {
    // Crear directorio de datos si no existe
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Datos iniciales con hash de password para admin123 usando bcryptjs
    // Este es el hash pre-calculado para 'admin123'
    const seedData = {
      users: [
        {
          id: 'admin-001',
          email: 'admin@hostdesk.com',
          password_hash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/lLm', // admin123
          role: 'admin',
          name: 'Administrador',
          must_change_password: false,
          disabled: false,
        }
      ],
      rooms: [
        { id: 'room-101', number: '101', type: 'sencilla', price_per_night: 80000 },
        { id: 'room-102', number: '102', type: 'sencilla', price_per_night: 80000 },
        { id: 'room-201', number: '201', type: 'doble', price_per_night: 120000 },
        { id: 'room-202', number: '202', type: 'doble', price_per_night: 120000 },
        { id: 'room-301', number: '301', type: 'suite', price_per_night: 200000 },
      ],
      check_ins: [],
      check_outs: [],
      guests: [],
    };

    // Guardar datos en archivo JSON
    const seedFilePath = join(dataDir, 'seed.json');
    await writeFile(seedFilePath, JSON.stringify(seedData, null, 2));

    // Actualizar config.json
    const configFilePath = join(dataDir, 'config.json');
    const config = {
      version: '1.0',
      database: 'json',
      lastUpdated: new Date().toISOString(),
      seedStatus: 'initialized'
    };
    await writeFile(configFilePath, JSON.stringify(config, null, 2));

    return Response.json(
      {
        success: true,
        message: '✅ Base de datos inicializada correctamente con datos locales (JSON). Usuario: admin@hostdesk.com / Contraseña: admin123',
        data: {
          usersCount: seedData.users.length,
          roomsCount: seedData.rooms.length,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en db-setup:', error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido en el setup',
      },
      { status: 500 }
    );
  }
}
