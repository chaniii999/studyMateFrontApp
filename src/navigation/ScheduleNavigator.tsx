import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScheduleStackParamList } from './types';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import ScheduleCreateScreen from '../screens/schedule/ScheduleCreateScreen';
import ScheduleDetailScreen from '../screens/schedule/ScheduleDetailScreen';
import ScheduleEditScreen from '../screens/schedule/ScheduleEditScreen';

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
          title: '스케줄',
        }}
      />
      <Stack.Screen
        name="ScheduleCreate"
        component={ScheduleCreateScreen}
        options={{
          title: '새 스케줄',
        }}
      />
      <Stack.Screen
        name="ScheduleDetail"
        component={ScheduleDetailScreen}
        options={{
          title: '스케줄 상세',
        }}
      />
      <Stack.Screen
        name="ScheduleEdit"
        component={ScheduleEditScreen}
        options={{
          title: '스케줄 수정',
        }}
      />
    </Stack.Navigator>
  );
};

export default ScheduleNavigator; 