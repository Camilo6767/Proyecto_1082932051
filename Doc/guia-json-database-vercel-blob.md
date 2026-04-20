# JSON Database con Vercel Blob

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
BLOB_READ_WRITE_TOKEN=tu_token_vercel_blob_aqui
```

Para obtener el token:
1. Ve a https://vercel.com/account/tokens
2. Crea un nuevo token con permisos de Blob
3. Ve a tu proyecto en Vercel > Settings > Storage > Blob
4. Copia el token

### 2. Instalación de Dependencias

Las dependencias ya están instaladas:
- `@vercel/blob` - Cliente de Vercel Blob
- `uuid` - Generación de IDs únicos

## Estructura de la Base de Datos

### Tipos de Datos

```typescript
interface DatabaseRecord {
  id: string;              // UUID automático
  [key: string]: any;      // Datos personalizados
  createdAt?: string;      // ISO timestamp automático
  updatedAt?: string;      // ISO timestamp automático
}
```

### Colecciones

Los datos se organizan en colecciones. Cada colección es un archivo JSON en Vercel Blob:
- `db/users.json`
- `db/products.json`
- `db/orders.json`
- etc.

## API Endpoints

### Base URL
```
POST /api/db
GET /api/db?collection=<collection>&id=<id>
```

### Operaciones CRUD

#### 1. CREATE - Crear un nuevo registro

**Endpoint:** `POST /api/db`

```javascript
const response = await fetch('/api/db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'create',
    collection: 'users',
    record: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      age: 30
    }
  })
});

const { data } = await response.json();
// data = {
//   id: 'uuid-xxxx',
//   name: 'Juan Pérez',
//   email: 'juan@example.com',
//   age: 30,
//   createdAt: '2026-04-20T10:30:00.000Z',
//   updatedAt: '2026-04-20T10:30:00.000Z'
// }
```

#### 2. READ - Obtener un registro por ID

**Endpoint:** `GET /api/db?collection=users&id=uuid-xxxx`

O por POST:

```javascript
const response = await fetch('/api/db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'read',
    collection: 'users',
    id: 'uuid-xxxx'
  })
});
```

#### 3. UPDATE - Actualizar un registro

**Endpoint:** `POST /api/db`

```javascript
const response = await fetch('/api/db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'update',
    collection: 'users',
    id: 'uuid-xxxx',
    record: {
      name: 'Juan Carlos Pérez',
      age: 31
    }
  })
});
```

#### 4. DELETE - Eliminar un registro

**Endpoint:** `POST /api/db`

```javascript
const response = await fetch('/api/db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'delete',
    collection: 'users',
    id: 'uuid-xxxx'
  })
});
```

#### 5. LIST - Obtener todos los registros

**Endpoint:** `GET /api/db?collection=users`

O por POST:

```javascript
const response = await fetch('/api/db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'list',
    collection: 'users'
  })
});

const { data } = await response.json();
// data = [{ id, name, email, ... }, ...]
```

#### 6. QUERY - Buscar registros con criterios

**Endpoint:** `POST /api/db`

```javascript
const response = await fetch('/api/db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'query',
    collection: 'users',
    query: {
      age: 30,
      email: 'juan@example.com'
    }
  })
});

const { data } = await response.json();
// Devuelve solo los registros que cumplen TODOS los criterios
```

## Uso desde Componentes React

### Ejemplo: Hook Personalizado

```typescript
// hooks/useDatabase.ts
import { DatabaseRecord } from '@/types/db';

export function useDatabase<T extends DatabaseRecord = DatabaseRecord>(
  collection: string
) {
  const create = async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'create', collection, record: data })
    });
    return res.json();
  };

  const read = async (id: string) => {
    const res = await fetch(`/api/db?collection=${collection}&id=${id}`);
    return res.json();
  };

  const update = async (id: string, data: Partial<T>) => {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'update', collection, id, record: data })
    });
    return res.json();
  };

  const list = async () => {
    const res = await fetch(`/api/db?collection=${collection}`);
    return res.json();
  };

  const query = async (criteria: Record<string, any>) => {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'query', collection, query: criteria })
    });
    return res.json();
  };

  return { create, read, update, list, query };
}
```

### Ejemplo: Componente React

```typescript
'use client';

import { useState } from 'react';
import { useDatabase } from '@/hooks/useDatabase';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export default function UserManager() {
  const db = useDatabase('users');
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const { data } = await db.list();
    setUsers(data || []);
  };

  const addUser = async (name: string, email: string) => {
    const { data } = await db.create({ name, email });
    setUsers([...users, data]);
  };

  const removeUser = async (id: string) => {
    await db.delete(id);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <button onClick={loadUsers}>Cargar Usuarios</button>
      {/* ... rest of component */}
    </div>
  );
}
```

## Despliegue en Vercel

1. **Conecta el repositorio a Vercel**
   - Ve a https://vercel.com
   - Importa tu repositorio de GitHub

2. **Configura el Token de Blob**
   - En Settings > Environment Variables
   - Agrega `BLOB_READ_WRITE_TOKEN` con tu token

3. **Deploy**
   - El proyecto se deploya automáticamente

## Limitaciones y Consideraciones

- **Tamaño máximo:** Vercel Blob tiene límites de tamaño por archivo
- **Rendimiento:** Para grandes volúmenes de datos, considera una base de datos tradicional
- **Concurrencia:** Las escrituras simultáneas pueden causar conflictos
- **Escalabilidad:** Ideal para aplicaciones pequeñas/medianas

## Próximos Pasos

- [ ] Crear hooks personalizados para consultas comunes
- [ ] Implementar validación de datos
- [ ] Agregar autenticación/autorización
- [ ] Crear migraciones de datos
- [ ] Implementar backups

