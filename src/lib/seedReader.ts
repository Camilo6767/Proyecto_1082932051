import { readFile } from 'fs/promises';
import { SeedData, SeedUser, SeedRoom } from './types';

const seedPath = new URL('../../data/seed.json', import.meta.url);

async function readSeedData(): Promise<SeedData> {
  const content = await readFile(seedPath, 'utf-8');
  return JSON.parse(content) as SeedData;
}

export async function getSeedUsers(): Promise<SeedUser[]> {
  const seed = await readSeedData();
  return seed.users || [];
}

export async function getSeedUserByEmail(email: string): Promise<SeedUser | null> {
  const users = await getSeedUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getSeedRooms(): Promise<SeedRoom[]> {
  const seed = await readSeedData();
  return seed.rooms || [];
}

export async function getSeedRoomByNumber(number: string): Promise<SeedRoom | null> {
  const rooms = await getSeedRooms();
  return rooms.find((room) => room.number === number) ?? null;
}
