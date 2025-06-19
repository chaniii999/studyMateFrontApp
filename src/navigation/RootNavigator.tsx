import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { RootStackParamList } from './types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStatus, selectIsAuthenticated, selectIsInitialized } from '../store/slices/authSlice';
import { setNavigationRef } from './utils';

// 네비게이터들 import
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// 임시 모달 컴포넌트
const ModalScreen = () => null;

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const onNavigationReady = () => {
    // 네비게이션이 준비되면 참조를 설정
    // 참조는 ref 콜백에서 이미 설정됨
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={(navRef) => {
        // 네비게이션 참조를 설정
        setNavigationRef(navRef);
      }}
      onReady={onNavigationReady}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isAuthenticated ? (
          // 인증된 사용자 - 메인 앱
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              title: 'StudyMate',
            }}
          />
        ) : (
          // 인증되지 않은 사용자 - 인증 화면
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              title: '인증',
            }}
          />
        )}
        
        {/* 모달 화면들 */}
        <Stack.Screen
          name="Modal"
          component={ModalScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            title: '모달',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator; 