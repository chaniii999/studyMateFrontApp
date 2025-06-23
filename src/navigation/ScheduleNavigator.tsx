import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScheduleStackParamList } from './types';
import ScheduleScreen from '../screens/schedule/ScheduleScreen'; // 경로 수정

const Stack = createStackNavigator<ScheduleStackParamList>();

const ScheduleNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{
          title: '주간 스케쥴',
        }}
      />
    </Stack.Navigator>
  );
};

export default ScheduleNavigator; 