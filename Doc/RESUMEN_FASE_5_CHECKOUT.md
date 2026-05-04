# Resumen Fase 5 — Check-out y Cálculo de Total

## Objetivo
Implementar el flujo de salida de huéspedes, cálculo automático de totales y liberación de habitaciones.

## Cambios realizados
- Extendido `src/lib/types.ts` con `BookingWithTotal`.
- Ampliado `src/lib/dataService.ts` con:
  - `getActiveBooking(roomId)`: obtiene reserva activa con datos del huésped.
  - `getBookingById(id)`: obtiene reserva por ID con huésped.
  - `checkOut(userId, bookingId)`: calcula total, actualiza reserva, libera habitación, registra auditoría.
- Creado endpoint `src/app/api/checkout/[bookingId]/route.ts` para confirmar check-out.
- Añadido endpoint `src/app/api/bookings/[id]/route.ts` para obtener reserva por ID.
- Implementada página `src/app/checkout/page.tsx`: lista habitaciones ocupadas para check-out.
- Creada página `src/app/checkout/[bookingId]/page.tsx`: resumen de check-out con total a cobrar y confirmación.

## Estado
- **Fase 5**: Completada.
- El flujo de check-out está operativo y calcula totales correctamente.
- Falta implementar el historial mensual y resumen financiero.
