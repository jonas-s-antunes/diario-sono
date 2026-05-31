import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SleepEntry } from '../types/sleep';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function calcTST(entry: SleepEntry): number {
  let sleepMin = timeToMinutes(entry.sleepTime);
  let wakeMin = timeToMinutes(entry.wakeTime);
  let bedMin = timeToMinutes(entry.bedTime);

  if (sleepMin < bedMin) sleepMin += 1440;
  if (wakeMin <= sleepMin) wakeMin += 1440;

  return Math.max(0, wakeMin - sleepMin - entry.awakeningMinutes);
}

function calcEfficiency(entry: SleepEntry): number {
  let bedMin = timeToMinutes(entry.bedTime);
  let outMin = timeToMinutes(entry.outOfBedTime);
  if (outMin <= bedMin) outMin += 1440;

  const tib = outMin - bedMin;
  const tst = calcTST(entry);
  return tib > 0 ? Math.round((tst / tib) * 100) : 0;
}

export async function exportCSV(entries: SleepEntry[]): Promise<void> {
  try {
    const header = [
    'Data',
    'Deitou',
    'Adormeceu',
    'Acordou',
    'Levantou',
    'Despertares',
    'Min. Acordado',
    'TST (min)',
    'Eficiência (%)',
    'Qualidade',
    'Disposição',
    'Ansiedade',
    'Cafeína',
    'Exercício',
    'Observações',
  ].join(',');

  const rows = entries.map(e => [
    e.date,
    e.bedTime,
    e.sleepTime,
    e.wakeTime,
    e.outOfBedTime,
    e.awakenings,
    e.awakeningMinutes,
    calcTST(e),
    calcEfficiency(e),
    e.sleepQuality,
    e.morningMood,
    e.anxiety,
    e.caffeine ? 'Sim' : 'Não',
    { none: 'Não', morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[e.exercise],
    `"${e.notes.replace(/"/g, '""')}"`,
  ].join(','));

    const csv = [header, ...rows].join('\n');
    const file = new File(Paths.document, 'diario-sono.csv');

    file.create({ overwrite: true });
    file.write(csv);

    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportar Diário do Sono',
    });
  } catch (error) {
    throw new Error(`Erro ao exportar CSV: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
}
