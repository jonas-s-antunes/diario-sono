import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getEntryById, deleteEntry } from '../../storage/entries';
import { SleepEntry } from '../../types/sleep';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function calcStats(entry: SleepEntry) {
  let sleepMin = timeToMinutes(entry.sleepTime);
  let wakeMin = timeToMinutes(entry.wakeTime);
  let bedMin = timeToMinutes(entry.bedTime);
  let outMin = timeToMinutes(entry.outOfBedTime);

  if (sleepMin < bedMin) sleepMin += 1440;
  if (wakeMin <= sleepMin) wakeMin += 1440;
  if (outMin <= wakeMin) outMin += 1440;

  const tst = Math.max(0, wakeMin - sleepMin - entry.awakeningMinutes);
  const tib = Math.max(0, outMin - bedMin);
  const efficiency = tib > 0 ? Math.round((tst / tib) * 100) : 0;

  const hours = Math.floor(tst / 60);
  const minutes = tst % 60;

  return { tst: `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`, efficiency };
}

export default function DetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<SleepEntry | null>(null);

  useEffect(() => {
    if (id) getEntryById(id).then(e => setEntry(e ?? null));
  }, [id]);

  async function handleDelete() {
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(id);
          router.back();
        },
      },
    ]);
  }

  if (!entry) return <View style={styles.container}><Text>Carregando...</Text></View>;

  const { tst, efficiency } = calcStats(entry);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{entry.date}</Text>

      <Text style={styles.sectionTitle}>Horários</Text>
      <View style={styles.card}>
        <Row label="Deitou" value={entry.bedTime} />
        <Row label="Adormeceu" value={entry.sleepTime} />
        <Row label="Acordou" value={entry.wakeTime} />
        <Row label="Levantou" value={entry.outOfBedTime} />
      </View>

      <Text style={styles.sectionTitle}>Análise</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tempo de sono</Text>
          <Text style={styles.statValue}>{tst}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Eficiência</Text>
          <Text style={styles.statValue}>{efficiency}%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Despertares</Text>
      <View style={styles.card}>
        <Row label="Vezes" value={String(entry.awakenings)} />
        <Row label="Minutos acordado" value={String(entry.awakeningMinutes)} />
      </View>

      <Text style={styles.sectionTitle}>Bem-estar</Text>
      <View style={styles.card}>
        <Row label="Qualidade do sono" value={`${entry.sleepQuality}/10`} />
        <Row label="Disposição" value={`${entry.morningMood}/10`} />
        <Row label="Ansiedade ao deitar" value={`${entry.anxiety}/10`} />
        <Row label="Cafeína após 14h" value={entry.caffeine ? 'Sim' : 'Não'} />
        <Row label="Exercício" value={{ none: 'Não', morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[entry.exercise]} />
      </View>

      {entry.notes ? (
        <>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.card}>
            <Text style={styles.notes}>{entry.notes}</Text>
          </View>
        </>
      ) : null}

      <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/registro/editar/${entry.id}`)} >
        <Text style={styles.editText}>Editar registro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Excluir registro</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowLabel: { fontSize: 15, color: '#666' },
  rowValue: { fontSize: 15, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  notes: { fontSize: 15, color: '#444', lineHeight: 22, paddingVertical: 12 },
  deleteButton: { marginTop: 24, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ff4444', alignItems: 'center' },
  deleteText: { color: '#ff4444', fontSize: 15 },
  editButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D9E75',
    alignItems: 'center',
  },
  editText: {
    color: '#1D9E75',
    fontSize: 15,
  },
});
