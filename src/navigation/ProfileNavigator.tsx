import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from './types';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// 임시 화면 컴포넌트들 (나중에 실제 화면으로 교체)
const EditProfileScreen = () => null;
const NotificationsScreen = () => null;
const PrivacyScreen = () => null;
const AboutScreen = () => null;
const HelpScreen = () => null;

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
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
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{
          title: '프로필',
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: '프로필 수정',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: '설정',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: '알림 설정',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{
          title: '개인정보',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{
          title: '앱 정보',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{
          title: '도움말',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator; 