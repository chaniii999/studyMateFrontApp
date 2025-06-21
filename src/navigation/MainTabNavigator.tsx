import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from './types';
import { theme } from '../theme';

// 네비게이터들 import
import HomeNavigator from './HomeNavigator';
import TimerNavigator from './TimerNavigator';
import TopicsNavigator from './TopicsNavigator';
import StatisticsNavigator from './StatisticsNavigator';
import ProfileNavigator from './ProfileNavigator';

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
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Timer':
              iconName = focused ? 'timer' : 'timer-outline';
              break;
            case 'Topics':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Statistics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          paddingBottom: Platform.OS === 'ios' ? 34 : 10, // iPhone 16 Safe Area
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 102 : 68, // iPhone 16 높이 조정
          shadowColor: theme.colors.text.primary,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
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

export default MainTabNavigator; 