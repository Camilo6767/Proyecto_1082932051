export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
  return Math.max(diff, 0);
}

export function calculateTotal(pricePerNight: number, nights: number): number {
  return pricePerNight * nights;
}
