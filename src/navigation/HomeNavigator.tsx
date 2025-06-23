import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';
ㄱimport HomeScreen from '../screens/HomeScreen';

// 임시 화면 컴포넌트들 (나중에 실제 화면으로 교체)
const DashboardScreen = () => null;
const QuickStartScreen = () => null;
const NotificationsScreen = () => null;

const Stack = createStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{
          title: '홈',
        }}
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: '대시보드',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="QuickStart" 
        component={QuickStartScreen}
        options={{
          title: '빠른 시작',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: '알림',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator; 