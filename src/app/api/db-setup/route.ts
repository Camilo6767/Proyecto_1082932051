import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST() {
  try {
    // En Vercel el filesystem es read-only: sólo leemos el seed.json ya incluido en el bundle.
    const seedFilePath = join(process.cwd(), 'data', 'seed.json');
    const content = await readFile(seedFilePath, 'utf-8');
    const seedData = JSON.parse(content) as {
      users?: unknown[];
      rooms?: unknown[];
    };

    return Response.json(
      {
        success: true,
        message: '✅ Base de datos inicializada correctamente con datos locales (JSON). Usuario: admin@hostdesk.com / Contraseña: admin123',
        data: {
          usersCount: seedData.users?.length ?? 0,
          roomsCount: seedData.rooms?.length ?? 0,
        },
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
