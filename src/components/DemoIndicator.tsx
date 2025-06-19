import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { demoUtils } from '../config/demoConfig';

interface DemoIndicatorProps {
  position?: 'top' | 'bottom';
}

const DemoIndicator: React.FC<DemoIndicatorProps> = ({ position = 'top' }) => {
  if (!demoUtils.shouldShowDemoIndicator()) {
    return null;
  }

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <View style={styles.indicator}>
        <Text style={styles.text}>DEMO</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  indicator: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default DemoIndicator; 