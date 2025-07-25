import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { theme } from '../../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  required?: boolean;
  value?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  required,
  value,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}{required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.text.disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value?.toString() || ''}
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText,
          helperStyle,
          error && errorStyle,
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
  },
  
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.background.primary,
    minHeight: 48,
  },
  
  focused: {
    borderColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  
  error: {
    borderColor: theme.colors.error,
  },
  
  leftIcon: {
    paddingLeft: theme.spacing[3],
    paddingRight: theme.spacing[2],
  },
  
  rightIcon: {
    paddingLeft: theme.spacing[2],
    paddingRight: theme.spacing[3],
  },
  
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
  
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  
  inputWithRightIcon: {
    paddingRight: 0,
  },
  
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  
  errorText: {
    color: theme.colors.error,
  },
  required: {
    color: theme.colors.error,
  },
});

export default Input; 