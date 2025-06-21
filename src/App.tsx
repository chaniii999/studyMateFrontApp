import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import RootNavigator from './navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  useEffect(() => {
    // AsyncStorage 초기화 확인
    const initAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem('test', 'test');
        await AsyncStorage.removeItem('test');
        console.log('AsyncStorage 초기화 성공');
      } catch (error) {
        console.error('AsyncStorage 초기화 실패:', error);
      }
    };
    
    initAsyncStorage();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App; 