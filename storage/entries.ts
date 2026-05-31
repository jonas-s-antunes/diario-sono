import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry } from '../types/sleep';

const STORAGE_KEY = 'sleep_entries';

export async function getEntries(): Promise<SleepEntry[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveEntry(entry: SleepEntry): Promise<void> {
  const entries = await getEntries();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, entry]));
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries();
  const filtered = entries.filter(e => e.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function getEntryById(id: string): Promise<SleepEntry | undefined> {
  const entries = await getEntries();
  return entries.find(e => e.id === id);
}

export async function entryExistsForDate(date: string): Promise<boolean> {
  const entries = await getEntries();
  return entries.some(e => e.date === date);
}

export async function replaceEntryByDate(date: string, entry: SleepEntry): Promise<void> {
  const entries = await getEntries();
  const filtered = entries.filter(e => e.date !== date);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, entry]));
}

export async function entryExistsForDateExcept(date: string, id: string): Promise<boolean> {
  const entries = await getEntries();
  return entries.some(e => e.date === date && e.id !== id);
}
