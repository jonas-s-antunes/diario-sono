import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { getEntries } from '../../storage/entries';
import { SleepEntry } from '../../types/sleep';
import { exportCSV } from '../../storage/export';

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

function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min > 0 ? min + 'min' : ''}`;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export default function ResumoScreen() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);

  // Referente à exportação
  const [allEntries, setAllEntries] = useState<SleepEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getEntries().then(data => {
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
        setAllEntries(sorted);
        setEntries(sorted.slice(0, 7));
      });
    }, [])
  );

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhum registro ainda.</Text>
      </View>
    );
  }

  const tsts = entries.map(calcTST);
  const efficiencies = entries.map(calcEfficiency);
  const avgTST = avg(tsts);
  const avgEff = avg(efficiencies);
  const avgQuality = avg(entries.map(e => e.sleepQuality));
  const avgMood = avg(entries.map(e => e.morningMood));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resumo</Text>
      <Text style={styles.subtitle}>Últimos {entries.length} registros</Text>

      <Text style={styles.sectionTitle}>Médias</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tempo de sono</Text>
          <Text style={styles.statValue}>{fmtMinutes(avgTST)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Eficiência</Text>
          <Text style={styles.statValue}>{avgEff}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Qualidade</Text>
          <Text style={styles.statValue}>{avgQuality}/10</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Disposição</Text>
          <Text style={styles.statValue}>{avgMood}/10</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Histórico</Text>
      {entries.map(entry => {
        const tst = calcTST(entry);
        const eff = calcEfficiency(entry);
        const effColor = eff >= 85 ? '#1D9E75' : eff >= 70 ? '#BA7517' : '#A32D2D';
        return (
          <View key={entry.id} style={styles.row}>
            <Text style={styles.rowDate}>{entry.date}</Text>
            <Text style={styles.rowTST}>{fmtMinutes(tst)}</Text>
            <Text style={[styles.rowEff, { color: effColor }]}>{eff}%</Text>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.exportButton}
        onPress={async () => {
          try {
            await exportCSV(allEntries);
          } catch (error) {
            console.error('Erro ao exportar:', error);
          }
        }}
      >
        <Text style={styles.exportText}>Exportar CSV</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#999',
    fontSize: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8
  },
  statCard: {
    width: '47%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  rowDate: {
    fontSize: 14,
    color: '#444',
    flex: 1
  },
  rowTST: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center'
  },
  rowEff: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right'
  },
  exportButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1D9E75',
    alignItems: 'center',
  },
  exportText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
