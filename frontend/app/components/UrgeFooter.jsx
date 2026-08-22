import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TryAnotherLink from './TryAnotherLink';
import { Colors, FontFamily, FontSize, Radii, Shadows } from '@/constants/theme';

export default function UrgeFooter({ onTryAnother, onLongPressTryAnother }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
      <TryAnotherLink onPress={onTryAnother} onLongPress={onLongPressTryAnother} />
      <TouchableOpacity style={styles.victoryBtn} onPress={() => router.push('/log-urge')} activeOpacity={0.85}>
        <MaterialCommunityIcons name="trophy" size={20} color="white" />
        <Text style={styles.victoryText}>I Have Beaten the Urge</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    backgroundColor: Colors.bg,
  },
  victoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.plum,
    borderRadius: Radii.btn,
    paddingVertical: 18,
    ...Shadows.pop,
  },
  victoryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.body,
    color: 'white',
  },
});
