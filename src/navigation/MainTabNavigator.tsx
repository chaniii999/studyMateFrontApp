import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { MainTabParamList } from './types';

// 네비게이터들 import
import HomeNavigator from './HomeNavigator';
import TimerNavigator from './TimerNavigator';
import TopicsNavigator from './TopicsNavigator';
import StatisticsNavigator from './StatisticsNavigator';
import ProfileNavigator from './ProfileNavigator';

// 임시 아이콘 컴포넌트 (나중에 실제 아이콘으로 교체)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  return null; // 임시로 null 반환
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Timer':
              iconName = 'timer';
              break;
            case 'Topics':
              iconName = 'book';
              break;
            case 'Statistics':
              iconName = 'bar-chart';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <TabIcon name={iconName} focused={focused} />;
        },
        tabBarActiveTintColor: '#007AFF', // iOS 블루
        tabBarInactiveTintColor: '#8E8E93', // iOS 그레이
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#C6C6C8',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 88 : 60,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          title: '홈',
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerNavigator}
        options={{
          title: '타이머',
          tabBarLabel: '타이머',
        }}
      />
      <Tab.Screen
        name="Topics"
        component={TopicsNavigator}
        options={{
          title: '주제',
          tabBarLabel: '주제',
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsNavigator}
        options={{
          title: '통계',
          tabBarLabel: '통계',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: '프로필',
          tabBarLabel: '프로필',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
  },
});

export default MainTabNavigator; 