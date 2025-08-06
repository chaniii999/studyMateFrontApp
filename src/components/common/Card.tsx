import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

export interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
  elevation?: 'sm' | 'md' | 'lg';
  borderRadius?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  elevation = 'sm',
  borderRadius = 'md',
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'sm': return styles.paddingSm;
      case 'lg': return styles.paddingLg;
      default: return styles.paddingMd;
    }
  };

  const getElevationStyle = () => {
    switch (elevation) {
      case 'md': return styles.elevationMd;
      case 'lg': return styles.elevationLg;
      default: return styles.elevationSm;
    }
  };

  const getBorderRadiusStyle = () => {
    switch (borderRadius) {
      case 'sm': return styles.borderRadiusSm;
      case 'lg': return styles.borderRadiusLg;
      default: return styles.borderRadiusMd;
    }
  };

  return (
    <View 
      style={[
        styles.base,
        getPaddingStyle(),
        getElevationStyle(),
        getBorderRadiusStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Padding variants
  paddingSm: {
    padding: theme.spacing[3],
  },
  paddingMd: {
    padding: theme.spacing[4],
  },
  paddingLg: {
    padding: theme.spacing[6],
  },
  
  // Elevation variants
  elevationSm: {
    ...theme.shadows.sm,
  },
  elevationMd: {
    ...theme.shadows.md,
  },
  elevationLg: {
    ...theme.shadows.lg,
  },
  
  // Border radius variants
  borderRadiusSm: {
    borderRadius: theme.borderRadius.sm,
  },
  borderRadiusMd: {
    borderRadius: theme.borderRadius.md,
  },
  borderRadiusLg: {
    borderRadius: theme.borderRadius.lg,
  },
});

export default Card; 