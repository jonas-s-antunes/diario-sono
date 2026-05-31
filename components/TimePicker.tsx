import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Props = {
  label: string;
  value: string; // "HH:mm"
  onChange: (value: string) => void;
};

function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function TimePicker({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    setShow(Platform.OS === 'ios');
    if (event.type === 'set' && date) {
      onChange(dateToTimeString(date));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.value}>{value}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={timeStringToDate(value)}
          mode="time"
          is24Hour
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  button: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  value: { fontSize: 16 },
});
