import { router } from 'expo-router';
import { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getEntries } from '../../storage/entries';
import { SleepEntry } from '../../types/sleep';

export default function HomeScreen() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getEntries().then(setEntries);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diário do Sono</Text>

      {entries.length === 0 ? (
        <Text style={styles.empty}>Nenhum registro ainda.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/registro/${item.id}`)}
            >
              <Text style={styles.cardDate}>
                {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.cardInfo}>
                Qualidade: {item.sleepQuality}/10
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/registro/novo')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  empty: { color: '#999', textAlign: 'center', marginTop: 40 },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  cardDate: { fontSize: 16, fontWeight: 'bold' },
  cardInfo: { fontSize: 14, color: '#667', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D9E75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { fontSize: 28, color: '#fff' },
});
