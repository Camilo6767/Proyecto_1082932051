import { z } from 'zod';

export const checkInSchema = z
  .object({
    roomId: z.string().min(1),
    guestName: z.string().min(3, 'El nombre del huésped es obligatorio.'),
    guestIdentification: z.string().min(3, 'La identificación del huésped es obligatoria.'),
    guestPhone: z.string().min(7, 'El teléfono del huésped es obligatorio.'),
    checkInAt: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Fecha de check-in inválida.',
    }),
    checkOutAt: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Fecha de check-out inválida.',
    }),
  })
  .superRefine(({ checkInAt, checkOutAt }, ctx) => {
    const checkInDate = new Date(checkInAt).getTime();
    const checkOutDate = new Date(checkOutAt).getTime();

    if (checkInDate >= checkOutDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de check-out debe ser posterior a la fecha de check-in.',
      });
    }
  });
