import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TimerStackParamList } from './types';
import TimerScreen from '../screens/timer/TimerScreen';
// 임시 화면 컴포넌트들 (나중에 실제 화면으로 교체)
// const TimerScreen = () => null;
const TimerSettingsScreen = () => null;
const TimerHistoryScreen = () => null;
const FocusLevelScreen = () => null;
const SessionCompleteScreen = () => null;

const Stack = createStackNavigator<TimerStackParamList>();

const TimerNavigator: React.FC = () => {
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
        name="TimerScreen" 
        component={TimerScreen}
        options={{
          title: '타이머',
        }}
      />
      <Stack.Screen 
        name="TimerSettings" 
        component={TimerSettingsScreen}
        options={{
          title: '타이머 설정',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="TimerHistory" 
        component={TimerHistoryScreen}
        options={{
          title: '타이머 히스토리',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="FocusLevel" 
        component={FocusLevelScreen}
        options={{
          title: '집중도 평가',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="SessionComplete" 
        component={SessionCompleteScreen}
        options={{
          title: '세션 완료',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default TimerNavigator; 