import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TopicsStackParamList } from './types';

// 임시 화면 컴포넌트들 (나중에 실제 화면으로 교체)
const TopicsListScreen = () => null;
const TopicDetailScreen = () => null;
const CreateTopicScreen = () => null;
const EditTopicScreen = () => null;
const TopicStatisticsScreen = () => null;
const TopicFeedbackScreen = () => null;

const Stack = createStackNavigator<TopicsStackParamList>();

const TopicsNavigator: React.FC = () => {
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
        name="TopicsList" 
        component={TopicsListScreen}
        options={{
          title: '학습 주제',
        }}
      />
      <Stack.Screen 
        name="TopicDetail" 
        component={TopicDetailScreen}
        options={{
          title: '주제 상세',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="CreateTopic" 
        component={CreateTopicScreen}
        options={{
          title: '새 주제 만들기',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="EditTopic" 
        component={EditTopicScreen}
        options={{
          title: '주제 수정',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="TopicStatistics" 
        component={TopicStatisticsScreen}
        options={{
          title: '주제 통계',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="TopicFeedback" 
        component={TopicFeedbackScreen}
        options={{
          title: 'AI 피드백',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default TopicsNavigator; 