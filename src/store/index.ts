import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import timerReducer from './slices/timerSlice';
import topicsReducer from './slices/topicsSlice';
import aiFeedbackReducer from './slices/aiFeedbackSlice';
import appReducer from './slices/appSlice';

// 스토어 설정
export const store = configureStore({
  reducer: {
    auth: authReducer,
    timer: timerReducer,
    topics: topicsReducer,
    aiFeedback: aiFeedbackReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Toolkit의 createAsyncThunk에서 사용하는 non-serializable 값들을 무시
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
      },
    }),
  devTools: __DEV__, // 개발 환경에서만 Redux DevTools 활성화
});

// 타입 안전한 훅들
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 모든 슬라이스 export
// export * from './slices';
export * from './hooks'; 