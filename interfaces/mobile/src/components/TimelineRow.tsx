import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from './Icons';
import { palette } from '../theme/palette';

interface TimelineRowProps {
  title: string;
  value: string;
}

export function TimelineRow({ title, value }: TimelineRowProps) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineCheck}>
          <Check color={palette.accent} size={14} strokeWidth={2.4} />
        </View>
        <Text style={styles.timelineTitle}>{title}</Text>
      </View>
      <Text style={styles.timelineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(24, 36, 54, 0.08)',
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  timelineCheck: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: palette.accentTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  timelineTitle: {
    fontSize: 14,
    color: palette.ink,
    fontWeight: '600',
  },
  timelineValue: {
    fontSize: 13,
    color: palette.accent,
    fontWeight: '700',
  },
});
