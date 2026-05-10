import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/palette';

interface SignalRowProps {
  label: string;
  value: string;
}

export function SignalRow({ label, value }: SignalRowProps) {
  return (
    <View style={styles.signalRow}>
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  signalLabel: {
    fontSize: 14,
    color: 'rgba(243, 238, 223, 0.76)',
    flex: 1,
    paddingRight: 12,
  },
  signalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.background,
  },
});
