import { z } from 'zod';

export const roomStatusSchema = z.enum(['disponible', 'ocupada']);

export const createRoomSchema = z.object({
  number: z.string().min(1, 'Número de habitación requerido'),
  type: z.string().min(1, 'Tipo de habitación requerido'),
  price_per_night: z.number().int().positive('Precio por noche debe ser mayor que 0'),
});

export const updateRoomSchema = z
  .object({
    type: z.string().min(1, 'Tipo de habitación requerido').optional(),
    price_per_night: z.number().int().positive('Precio por noche debe ser mayor que 0').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se requiere al menos un campo para actualizar.',
  });

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;
export type UpdateRoomRequest = z.infer<typeof updateRoomSchema>;
