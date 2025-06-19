import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StatisticsStackParamList } from './types';

// 임시 화면 컴포넌트들 (나중에 실제 화면으로 교체)
const StatisticsOverviewScreen = () => null;
const DailyStatsScreen = () => null;
const WeeklyStatsScreen = () => null;
const MonthlyStatsScreen = () => null;
const AIFeedbackScreen = () => null;
const FeedbackDetailScreen = () => null;

const Stack = createStackNavigator<StatisticsStackParamList>();

const StatisticsNavigator: React.FC = () => {
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
        name="StatisticsOverview" 
        component={StatisticsOverviewScreen}
        options={{
          title: '통계',
        }}
      />
      <Stack.Screen 
        name="DailyStats" 
        component={DailyStatsScreen}
        options={{
          title: '일간 통계',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="WeeklyStats" 
        component={WeeklyStatsScreen}
        options={{
          title: '주간 통계',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="MonthlyStats" 
        component={MonthlyStatsScreen}
        options={{
          title: '월간 통계',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AIFeedback" 
        component={AIFeedbackScreen}
        options={{
          title: 'AI 피드백',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="FeedbackDetail" 
        component={FeedbackDetailScreen}
        options={{
          title: '피드백 상세',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default StatisticsNavigator; 