import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/palette';

interface DashboardCardProps {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}

export function DashboardCard({ title, value, detail, icon }: DashboardCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: palette.lightGray,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.accentTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(24, 36, 54, 0.58)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '800',
    color: palette.ink,
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.gray,
  },
});
