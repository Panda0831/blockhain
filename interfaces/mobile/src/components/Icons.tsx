import React from 'react';
import { View, Text } from 'react-native';

const MockIcon = ({ name, color, size }: any) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: 10 }}>{name[0]}</Text>
  </View>
);

export const Activity = (props: any) => <MockIcon name="Activity" {...props} />;
export const ArrowRight = (props: any) => <MockIcon name="ArrowRight" {...props} />;
export const Clock3 = (props: any) => <MockIcon name="Clock3" {...props} />;
export const Database = (props: any) => <MockIcon name="Database" {...props} />;
export const Map = (props: any) => <MockIcon name="Map" {...props} />;
export const MapPin = (props: any) => <MockIcon name="MapPin" {...props} />;
export const Shield = (props: any) => <MockIcon name="Shield" {...props} />;
export const RefreshCw = (props: any) => <MockIcon name="RefreshCw" {...props} />;
export const Brain = (props: any) => <MockIcon name="Brain" {...props} />;
export const Check = (props: any) => <MockIcon name="Check" {...props} />;
export const Search = (props: any) => <MockIcon name="Search" {...props} />;
export const PlusCircle = (props: any) => <MockIcon name="PlusCircle" {...props} />;
export const ArrowLeftRight = (props: any) => <MockIcon name="ArrowLeftRight" {...props} />;
export const ShieldCheck = (props: any) => <MockIcon name="ShieldCheck" {...props} />;
export const Navigation = (props: any) => <MockIcon name="Navigation" {...props} />;
export const Leaf = (props: any) => <MockIcon name="Leaf" {...props} />;
export const Award = (props: any) => <MockIcon name="Award" {...props} />;
