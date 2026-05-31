import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DatePicker from '../../../components/DatePicker';
import TimePicker from '../../../components/TimePicker';
import { deleteEntry, entryExistsForDateExcept, getEntryById, replaceEntryByDate, saveEntry } from '../../../storage/entries';
import { SleepEntry } from '../../../types/sleep';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function validateForm(
  date: string,
  bedTime: string,
  sleepTime: string,
  wakeTime: string,
  outOfBedTime: string,
  awakenings: string,
  awakeningMinutes: string,
  sleepQuality: string,
  morningMood: string,
  anxiety: string,
): string | null {
  let bedMin = timeToMinutes(bedTime);
  let sleepMin = timeToMinutes(sleepTime);
  let wakeMin = timeToMinutes(wakeTime);
  let outMin = timeToMinutes(outOfBedTime);

  // Normalizar horários considerando meia-noite
  if (sleepMin < bedMin) sleepMin += 1440;
  if (wakeMin <= sleepMin) wakeMin += 1440;
  if (outMin <= wakeMin) outMin += 1440;

  // Validar após normalização
  if (sleepMin <= bedMin)
    return 'Horário de adormecer deve ser após deitar.';
  if (wakeMin <= sleepMin)
    return 'Horário de acordar deve ser após adormecer.';
  if (outMin <= wakeMin)
    return 'Horário de levantar deve ser após acordar.';

  const awk = parseInt(awakenings);
  if (isNaN(awk) || awk < 0)
    return 'Número de despertares inválido.';

  const awkMin = parseInt(awakeningMinutes);
  if (isNaN(awkMin) || awkMin < 0)
    return 'Minutos acordado inválido.';

  const quality = parseInt(sleepQuality);
  if (isNaN(quality) || quality < 1 || quality > 10)
    return 'Qualidade do sono deve ser entre 1 e 10.';

  const mood = parseInt(morningMood);
  if (isNaN(mood) || mood < 1 || mood > 10)
    return 'Disposição deve ser entre 1 e 10.';

  const anx = parseInt(anxiety);
  if (isNaN(anx) || anx < 1 || anx > 10)
    return 'Ansiedade deve ser entre 1 e 10.';

  return null;
}

export default function EditarRegistroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [bedTime, setBedTime] = useState('22:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [outOfBedTime, setOutOfBedTime] = useState('07:30');
  const [awakenings, setAwakenings] = useState('0');
  const [awakeningMinutes, setAwakeningMinutes] = useState('0');
  const [sleepQuality, setSleepQuality] = useState('7');
  const [morningMood, setMorningMood] = useState('7');
  const [anxiety, setAnxiety] = useState('3');
  const [caffeine, setCaffeine] = useState(false);
  const [exercise, setExercise] = useState<'none' | 'morning' | 'afternoon' | 'evening'>('none');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getEntryById(id).then(entry => {
      if (entry) {
        setDate(entry.date);
        setBedTime(entry.bedTime);
        setSleepTime(entry.sleepTime);
        setWakeTime(entry.wakeTime);
        setOutOfBedTime(entry.outOfBedTime);
        setAwakenings(String(entry.awakenings));
        setAwakeningMinutes(String(entry.awakeningMinutes));
        setSleepQuality(String(entry.sleepQuality));
        setMorningMood(String(entry.morningMood));
        setAnxiety(String(entry.anxiety));
        setCaffeine(entry.caffeine);
        setExercise(entry.exercise);
        setNotes(entry.notes);
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    const error = validateForm(
      date, bedTime, sleepTime, wakeTime, outOfBedTime,
      awakenings, awakeningMinutes, sleepQuality, morningMood, anxiety
    );

    if (error) {
      Alert.alert('Erro de validação', error);
      return;
    }

    const entry: SleepEntry = {
      id,
      date,
      bedTime,
      sleepTime,
      wakeTime,
      outOfBedTime,
      awakenings: parseInt(awakenings),
      awakeningMinutes: parseInt(awakeningMinutes),
      sleepQuality: parseInt(sleepQuality),
      morningMood: parseInt(morningMood),
      anxiety: parseInt(anxiety),
      caffeine,
      exercise,
      notes,
    };

    const exists = await entryExistsForDateExcept(date, id);
    if (exists) {
      Alert.alert(
        'Data já registrada',
        'Já existe um registro para essa data. Deseja substituí-lo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Substituir',
            style: 'destructive',
            onPress: async () => {
              await replaceEntryByDate(date, entry);
              router.back();
            },
          },
        ]
      );
      return;
    }

    await deleteEntry(id);
    await saveEntry(entry);
    router.back();
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Registro</Text>

      <DatePicker label="Data" value={date} onChange={setDate} />
      <TimePicker label="Deitei às" value={bedTime} onChange={setBedTime} />
      <TimePicker label="Adormeci às" value={sleepTime} onChange={setSleepTime} />
      <TimePicker label="Acordei às" value={wakeTime} onChange={setWakeTime} />
      <TimePicker label="Levantei às" value={outOfBedTime} onChange={setOutOfBedTime} />

      <Text style={styles.label}>Vezes que acordei</Text>
      <TextInput
        style={styles.input}
        value={awakenings}
        onChangeText={setAwakenings}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Minutos acordado</Text>
      <TextInput
        style={styles.input}
        value={awakeningMinutes}
        onChangeText={setAwakeningMinutes}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Qualidade do sono (1-10)</Text>
      <TextInput
        style={styles.input}
        value={sleepQuality}
        onChangeText={setSleepQuality}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Disposição ao acordar (1-10)</Text>
      <TextInput
        style={styles.input}
        value={morningMood}
        onChangeText={setMorningMood}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Ansiedade ao deitar (1-10)</Text>
      <TextInput
        style={styles.input}
        value={anxiety}
        onChangeText={setAnxiety}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Cafeína após 14h?</Text>
      <View style={styles.row}>
        {[true, false].map(value => (
          <TouchableOpacity
            key={String(value)}
            style={[styles.option, caffeine === value && styles.optionSelected]}
            onPress={() => setCaffeine(value)}
          >
            <Text style={[styles.optionText, caffeine === value && styles.optionTextSelected]}>
              {value ? 'Sim' : 'Não'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Exercício hoje?</Text>
      <View style={styles.row}>
        {(['none', 'morning', 'afternoon', 'evening'] as const).map(value => (
          <TouchableOpacity
            key={value}
            style={[styles.option, exercise === value && styles.optionSelected]}
            onPress={() => setExercise(value)}
          >
            <Text style={[styles.optionText, exercise === value && styles.optionTextSelected]}>
              {value === 'none' ? 'Não' : value === 'morning' ? 'Manhã' : value === 'afternoon' ? 'Tarde' : 'Noite'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        placeholder="Pesadelos, pensamentos, tensão..."
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar alterações</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  option: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  optionSelected: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  button: {
    backgroundColor: '#1D9E75',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
