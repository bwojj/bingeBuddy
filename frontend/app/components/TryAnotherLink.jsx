import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';


export default function TryAnotherLink({ onPress, onLongPress }) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.6}>
      <Ionicons name="shuffle-outline" size={14} color={Colors.plumSoft} />
      <Text style={styles.text}>Try another</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  text: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.secondarySm,
    color: Colors.plumSoft,
  },
});
