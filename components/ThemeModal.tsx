import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function ThemeModal() {
  const { theme, toggleTheme, showThemeModal, setShowThemeModal } = useTheme();

  const handleThemeSelect = (selectedTheme: 'light' | 'dark') => {
    if (selectedTheme !== theme) {
      toggleTheme();
    }
    setShowThemeModal(false);
  };

  return (
    <Modal
      visible={showThemeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, theme === 'dark' ? styles.darkModal : styles.lightModal]}>
          <Text style={[styles.title, theme === 'dark' ? styles.darkText : styles.lightText]}>
            Choose Your Theme
          </Text>
          <Text style={[styles.subtitle, theme === 'dark' ? styles.darkSubtext : styles.lightSubtext]}>
            Select your preferred appearance for the app
          </Text>

          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'light' && styles.selectedOption,
                styles.lightOption,
              ]}
              onPress={() => handleThemeSelect('light')}
            >
              <Sun size={32} color="#F59E0B" />
              <Text style={[styles.optionText, styles.lightOptionText]}>Light</Text>
              <Text style={[styles.optionDescription, styles.lightOptionText]}>
                Clean and bright
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'dark' && styles.selectedOption,
                styles.darkOption,
              ]}
              onPress={() => handleThemeSelect('dark')}
            >
              <Moon size={32} color="#6366F1" />
              <Text style={[styles.optionText, styles.darkOptionText]}>Dark</Text>
              <Text style={[styles.optionDescription, styles.darkOptionText]}>
                Easy on the eyes
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => setShowThemeModal(false)}
          >
            <Text style={[styles.skipText, theme === 'dark' ? styles.darkSubtext : styles.lightSubtext]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  lightModal: {
    backgroundColor: '#FFFFFF',
  },
  darkModal: {
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#1F2937',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  lightSubtext: {
    color: '#6B7280',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  themeOption: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#667eea',
  },
  lightOption: {
    backgroundColor: '#F9FAFB',
  },
  darkOption: {
    backgroundColor: '#374151',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  lightOptionText: {
    color: '#1F2937',
  },
  darkOptionText: {
    color: '#FFFFFF',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
  },
});