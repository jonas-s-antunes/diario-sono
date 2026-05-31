export type SleepEntry = {
  id: string;
  date: string;           // "YYYY-MM-DD"
  bedTime: string;        // horário que deitou "HH:mm"
  sleepTime: string;      // horário que adormeceu "HH:mm"
  wakeTime: string;       // horário que acordou "HH:mm"
  outOfBedTime: string;   // horário que levantou "HH:mm"
  awakenings: number;     // quantas vezes acordou
  awakeningMinutes: number; // minutos acordado durante a noite
  sleepQuality: number;   // 1-10
  morningMood: number;    // 1-10
  anxiety: number;        // 1-10
  caffeine: boolean;      // cafeína após 14h
  exercise: 'none' | 'morning' | 'afternoon' | 'evening';
  notes: string;
};
