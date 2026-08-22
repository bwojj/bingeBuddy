import { Text, View, StyleSheet, TouchableOpacity, Modal, Pressable, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radii } from '@/constants/theme';
import { URGE_SCREEN_OPTIONS } from '@/constants/urgeScreenOptions';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function useSheetAnimation(visible) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible, translateY]);

  return translateY;
}


export default function UrgeToolSheet({ visible, onClose, onSelect, title, subtitle, selectedKey, excludeKey, options: optionsProp }) {
  const insets = useSafeAreaInsets();
  const slide = useSheetAnimation(visible);
  const baseOptions = optionsProp ?? URGE_SCREEN_OPTIONS;
  const options = excludeKey ? baseOptions.filter((opt) => opt.key !== excludeKey) : baseOptions;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: slide }] }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {options.map((opt) => {
            const selected = opt.key === selectedKey;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => onSelect(opt.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                  <Ionicons name={opt.icon} size={20} color={selected ? 'white' : Colors.plum} />
                </View>
                <Text style={styles.label}>{opt.label}</Text>
                {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.plum} />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(37,24,38,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.serifMedium,
    fontSize: FontSize.hTitle,
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.sansRegular,
    fontSize: FontSize.secondarySm,
    color: Colors.inkSoft,
    lineHeight: 19,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.bg,
    borderRadius: Radii.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: Colors.plum,
    backgroundColor: Colors.plumTint,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.plumTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: Colors.plum,
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.sansSemibold,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
});
