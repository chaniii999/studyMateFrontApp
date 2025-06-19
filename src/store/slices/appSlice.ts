import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings, Notification } from '../../types';

// 앱 상태 타입
interface AppState {
  settings: AppSettings;
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  currentTheme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  isFirstLaunch: boolean;
  lastSyncTime: string | null;
  pendingActions: string[];
}

// 기본 설정
const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'ko',
  notifications: {
    enabled: true,
    timerComplete: true,
    dailyReminder: true,
    weeklyReport: true,
  },
  timer: {
    defaultStudyMinutes: 25,
    defaultBreakMinutes: 5,
    autoStartBreak: false,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  privacy: {
    dataSharing: false,
    analytics: true,
  },
};

// 초기 상태
const initialState: AppState = {
  settings: defaultSettings,
  notifications: [],
  isLoading: false,
  error: null,
  isOnline: true,
  currentTheme: 'auto',
  language: 'ko',
  isFirstLaunch: true,
  lastSyncTime: null,
  pendingActions: [],
};

// Async Thunks
export const loadAppSettings = createAsyncThunk(
  'app/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      // AsyncStorage에서 설정 로드 (나중에 구현)
      // const settings = await AsyncStorage.getItem('app_settings');
      // return settings ? JSON.parse(settings) : defaultSettings;
      return defaultSettings;
    } catch (error: any) {
      return rejectWithValue(error.message || '설정 로드에 실패했습니다.');
    }
  }
);

export const saveAppSettings = createAsyncThunk(
  'app/saveSettings',
  async (settings: Partial<AppSettings>, { rejectWithValue }): Promise<Partial<AppSettings>> => {
    try {
      // AsyncStorage에 설정 저장 (나중에 구현)
      // await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || '설정 저장에 실패했습니다.');
    }
  }
);

export const syncData = createAsyncThunk(
  'app/syncData',
  async (_, { rejectWithValue }) => {
    try {
      // 데이터 동기화 로직 (나중에 구현)
      const syncTime = new Date().toISOString();
      return syncTime;
    } catch (error: any) {
      return rejectWithValue(error.message || '데이터 동기화에 실패했습니다.');
    }
  }
);

// App Slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.currentTheme = action.payload;
      state.settings.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'ko' | 'en'>) => {
      state.language = action.payload;
      state.settings.language = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      // 최대 100개까지만 유지
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateTimerSettings: (state, action: PayloadAction<Partial<AppSettings['timer']>>) => {
      state.settings.timer = { ...state.settings.timer, ...action.payload };
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppSettings['notifications']>>) => {
      state.settings.notifications = { ...state.settings.notifications, ...action.payload };
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<AppSettings['privacy']>>) => {
      state.settings.privacy = { ...state.settings.privacy, ...action.payload };
    },
    addPendingAction: (state, action: PayloadAction<string>) => {
      if (!state.pendingActions.includes(action.payload)) {
        state.pendingActions.push(action.payload);
      }
    },
    removePendingAction: (state, action: PayloadAction<string>) => {
      state.pendingActions = state.pendingActions.filter(action => action !== action.payload);
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
    resetApp: (state) => {
      state.settings = defaultSettings;
      state.notifications = [];
      state.isFirstLaunch = true;
      state.lastSyncTime = null;
      state.pendingActions = [];
    },
  },
  extraReducers: (builder) => {
    // loadAppSettings
    builder
      .addCase(loadAppSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAppSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.currentTheme = action.payload.theme;
        state.language = action.payload.language;
        state.error = null;
      })
      .addCase(loadAppSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // saveAppSettings
    builder
      .addCase(saveAppSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveAppSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.settings = { ...state.settings, ...action.payload };
        }
        state.error = null;
      })
      .addCase(saveAppSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // syncData
    builder
      .addCase(syncData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastSyncTime = action.payload;
        state.pendingActions = [];
        state.error = null;
      })
      .addCase(syncData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  clearError,
  setOnlineStatus,
  setTheme,
  setLanguage,
  setFirstLaunch,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
  updateTimerSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  addPendingAction,
  removePendingAction,
  clearPendingActions,
  resetApp,
} = appSlice.actions;

// Selectors
export const selectApp = (state: { app: AppState }) => state.app;
export const selectAppSettings = (state: { app: AppState }) => state.app.settings;
export const selectTimerSettings = (state: { app: AppState }) => state.app.settings.timer;
export const selectNotificationSettings = (state: { app: AppState }) => state.app.settings.notifications;
export const selectPrivacySettings = (state: { app: AppState }) => state.app.settings.privacy;
export const selectNotifications = (state: { app: AppState }) => state.app.notifications;
export const selectUnreadNotifications = (state: { app: AppState }) => 
  state.app.notifications.filter(n => !n.read);
export const selectIsAppLoading = (state: { app: AppState }) => state.app.isLoading;
export const selectAppError = (state: { app: AppState }) => state.app.error;
export const selectIsOnline = (state: { app: AppState }) => state.app.isOnline;
export const selectCurrentTheme = (state: { app: AppState }) => state.app.currentTheme;
export const selectLanguage = (state: { app: AppState }) => state.app.language;
export const selectIsFirstLaunch = (state: { app: AppState }) => state.app.isFirstLaunch;
export const selectLastSyncTime = (state: { app: AppState }) => state.app.lastSyncTime;
export const selectPendingActions = (state: { app: AppState }) => state.app.pendingActions;

export default appSlice.reducer; 