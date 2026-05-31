import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Props = {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
};

function dateStringToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePicker({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    setShow(Platform.OS === 'ios');
    if (event.type === 'set' && date) {
      onChange(dateToDateString(date));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.value}>
          {new Date(value + 'T12:00:00').toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={dateStringToDate(value)}
          mode="date"
          maximumDate={new Date()}
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
