import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { timerService } from '../../services';
import { Timer, TimerRequest, TimerResponse, TimerStatistics, TimerHistoryFilter, TimerSettings } from '../../types';

// 타이머 상태 타입
interface TimerState {
  currentTimer: TimerResponse | null;
  timerHistory: Timer[];
  statistics: TimerStatistics | null;
  settings: TimerSettings | null;
  isLoading: boolean;
  error: string | null;
  isRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  totalTime: number;
  currentTopicId: string | null;
}

// 초기 상태
const initialState: TimerState = {
  currentTimer: null,
  timerHistory: [],
  statistics: null,
  settings: null,
  isLoading: false,
  error: null,
  isRunning: false,
  isPaused: false,
  remainingTime: 0,
  totalTime: 0,
  currentTopicId: null,
};

// Async Thunks
export const startTimer = createAsyncThunk(
  'timer/start',
  async (timerData: TimerRequest, { rejectWithValue }) => {
    try {
      const response = await timerService.startTimer(timerData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 시작에 실패했습니다.');
    }
  }
);

export const stopTimer = createAsyncThunk(
  'timer/stop',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timerService.stopTimer();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 정지에 실패했습니다.');
    }
  }
);

export const pauseTimer = createAsyncThunk(
  'timer/pause',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timerService.pauseTimer();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 일시정지에 실패했습니다.');
    }
  }
);

export const resumeTimer = createAsyncThunk(
  'timer/resume',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timerService.resumeTimer();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 재개에 실패했습니다.');
    }
  }
);

export const getCurrentTimer = createAsyncThunk(
  'timer/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timerService.getCurrentTimer();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '현재 타이머 조회에 실패했습니다.');
    }
  }
);

export const getTimerHistory = createAsyncThunk(
  'timer/getHistory',
  async (filter: TimerHistoryFilter | undefined, { rejectWithValue }) => {
    try {
      const response = await timerService.getTimerHistory(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 히스토리 조회에 실패했습니다.');
    }
  }
);

export const getTimerStatistics = createAsyncThunk(
  'timer/getStatistics',
  async (dateRange: { startDate: string; endDate: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await timerService.getTimerStatistics(dateRange);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 통계 조회에 실패했습니다.');
    }
  }
);

export const getTimerSettings = createAsyncThunk(
  'timer/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timerService.getTimerSettings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 설정 조회에 실패했습니다.');
    }
  }
);

export const updateTimerSettings = createAsyncThunk(
  'timer/updateSettings',
  async (settings: Partial<TimerSettings>, { rejectWithValue }) => {
    try {
      const response = await timerService.updateTimerSettings(settings);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '타이머 설정 업데이트에 실패했습니다.');
    }
  }
);

// Timer Slice
const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
    },
    updateRemainingTime: (state, action: PayloadAction<number>) => {
      state.remainingTime = action.payload;
    },
    setTotalTime: (state, action: PayloadAction<number>) => {
      state.totalTime = action.payload;
    },
    setCurrentTopicId: (state, action: PayloadAction<string | null>) => {
      state.currentTopicId = action.payload;
    },
    resetTimer: (state) => {
      state.isRunning = false;
      state.isPaused = false;
      state.remainingTime = 0;
      state.totalTime = 0;
      state.currentTopicId = null;
    },
    addToHistory: (state, action: PayloadAction<Timer>) => {
      state.timerHistory.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // startTimer
    builder
      .addCase(startTimer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimer = action.payload;
        state.isRunning = true;
        state.isPaused = false;
        state.error = null;
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // stopTimer
    builder
      .addCase(stopTimer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimer = action.payload;
        state.isRunning = false;
        state.isPaused = false;
        state.error = null;
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // pauseTimer
    builder
      .addCase(pauseTimer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(pauseTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimer = action.payload;
        state.isPaused = true;
        state.error = null;
      })
      .addCase(pauseTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // resumeTimer
    builder
      .addCase(resumeTimer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resumeTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimer = action.payload;
        state.isPaused = false;
        state.error = null;
      })
      .addCase(resumeTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getCurrentTimer
    builder
      .addCase(getCurrentTimer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimer = action.payload;
        state.error = null;
      })
      .addCase(getCurrentTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getTimerHistory
    builder
      .addCase(getTimerHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTimerHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timerHistory = action.payload.content || [];
        state.error = null;
      })
      .addCase(getTimerHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getTimerStatistics
    builder
      .addCase(getTimerStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTimerStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(getTimerStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getTimerSettings
    builder
      .addCase(getTimerSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTimerSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(getTimerSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateTimerSettings
    builder
      .addCase(updateTimerSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTimerSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateTimerSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  clearError,
  setRunning,
  setPaused,
  updateRemainingTime,
  setTotalTime,
  setCurrentTopicId,
  resetTimer,
  addToHistory,
} = timerSlice.actions;

// Selectors
export const selectTimer = (state: { timer: TimerState }) => state.timer;
export const selectCurrentTimer = (state: { timer: TimerState }) => state.timer.currentTimer;
export const selectTimerHistory = (state: { timer: TimerState }) => state.timer.timerHistory;
export const selectTimerStatistics = (state: { timer: TimerState }) => state.timer.statistics;
export const selectTimerSettings = (state: { timer: TimerState }) => state.timer.settings;
export const selectIsTimerLoading = (state: { timer: TimerState }) => state.timer.isLoading;
export const selectTimerError = (state: { timer: TimerState }) => state.timer.error;
export const selectIsTimerRunning = (state: { timer: TimerState }) => state.timer.isRunning;
export const selectIsTimerPaused = (state: { timer: TimerState }) => state.timer.isPaused;
export const selectRemainingTime = (state: { timer: TimerState }) => state.timer.remainingTime;
export const selectTotalTime = (state: { timer: TimerState }) => state.timer.totalTime;
export const selectCurrentTopicId = (state: { timer: TimerState }) => state.timer.currentTopicId;

export default timerSlice.reducer; 