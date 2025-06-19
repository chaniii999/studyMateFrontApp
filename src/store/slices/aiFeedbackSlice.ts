import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiFeedbackService } from '../../services';
import { 
  AIFeedback, 
  DailyAIFeedback, 
  WeeklyAIFeedback, 
  MonthlyAIFeedback,
  GenerateAIFeedbackRequest,
  AIFeedbackFilter,
  AIFeedbackStatistics,
  AIFeedbackSettings 
} from '../../types';

// AI 피드백 상태 타입
interface AIFeedbackState {
  feedbacks: AIFeedback[];
  dailyFeedback: DailyAIFeedback | null;
  weeklyFeedback: WeeklyAIFeedback | null;
  monthlyFeedback: MonthlyAIFeedback | null;
  currentFeedback: AIFeedback | null;
  statistics: AIFeedbackStatistics | null;
  settings: AIFeedbackSettings | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 초기 상태
const initialState: AIFeedbackState = {
  feedbacks: [],
  dailyFeedback: null,
  weeklyFeedback: null,
  monthlyFeedback: null,
  currentFeedback: null,
  statistics: null,
  settings: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
};

// Async Thunks
export const getAIFeedbacks = createAsyncThunk(
  'aiFeedback/getFeedbacks',
  async (filter: AIFeedbackFilter | undefined, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getAIFeedbacks(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 목록 조회에 실패했습니다.');
    }
  }
);

export const getDailyFeedback = createAsyncThunk(
  'aiFeedback/getDailyFeedback',
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getDailyFeedback(date);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '일간 AI 피드백 조회에 실패했습니다.');
    }
  }
);

export const getWeeklyFeedback = createAsyncThunk(
  'aiFeedback/getWeeklyFeedback',
  async (weekStart: string, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getWeeklyFeedback(weekStart);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '주간 AI 피드백 조회에 실패했습니다.');
    }
  }
);

export const getMonthlyFeedback = createAsyncThunk(
  'aiFeedback/getMonthlyFeedback',
  async (month: string, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getMonthlyFeedback(month);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '월간 AI 피드백 조회에 실패했습니다.');
    }
  }
);

export const generateAIFeedback = createAsyncThunk(
  'aiFeedback/generateFeedback',
  async (request: GenerateAIFeedbackRequest, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.generateAIFeedback(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 생성에 실패했습니다.');
    }
  }
);

export const getAIFeedbackById = createAsyncThunk(
  'aiFeedback/getFeedbackById',
  async (feedbackId: string, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getAIFeedbackById(feedbackId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 조회에 실패했습니다.');
    }
  }
);

export const deleteAIFeedback = createAsyncThunk(
  'aiFeedback/deleteFeedback',
  async (feedbackId: string, { rejectWithValue }) => {
    try {
      await aiFeedbackService.deleteAIFeedback(feedbackId);
      return feedbackId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 삭제에 실패했습니다.');
    }
  }
);

export const getAIFeedbackStatistics = createAsyncThunk(
  'aiFeedback/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getAIFeedbackStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 통계 조회에 실패했습니다.');
    }
  }
);

export const getAIFeedbackSettings = createAsyncThunk(
  'aiFeedback/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.getAIFeedbackSettings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 설정 조회에 실패했습니다.');
    }
  }
);

export const updateAIFeedbackSettings = createAsyncThunk(
  'aiFeedback/updateSettings',
  async (settings: Partial<AIFeedbackSettings>, { rejectWithValue }) => {
    try {
      const response = await aiFeedbackService.updateAIFeedbackSettings(settings);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI 피드백 설정 업데이트에 실패했습니다.');
    }
  }
);

// AI Feedback Slice
const aiFeedbackSlice = createSlice({
  name: 'aiFeedback',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFeedback: (state, action: PayloadAction<AIFeedback | null>) => {
      state.currentFeedback = action.payload;
    },
    clearCurrentFeedback: (state) => {
      state.currentFeedback = null;
    },
    addFeedback: (state, action: PayloadAction<AIFeedback>) => {
      state.feedbacks.unshift(action.payload);
    },
    updateFeedbackInList: (state, action: PayloadAction<AIFeedback>) => {
      const index = state.feedbacks.findIndex(feedback => feedback.id === action.payload.id);
      if (index !== -1) {
        state.feedbacks[index] = action.payload;
      }
    },
    removeFeedbackFromList: (state, action: PayloadAction<string>) => {
      state.feedbacks = state.feedbacks.filter(feedback => feedback.id !== action.payload);
    },
    clearFeedbacks: (state) => {
      state.feedbacks = [];
      state.dailyFeedback = null;
      state.weeklyFeedback = null;
      state.monthlyFeedback = null;
      state.currentFeedback = null;
    },
  },
  extraReducers: (builder) => {
    // getAIFeedbacks
    builder
      .addCase(getAIFeedbacks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAIFeedbacks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedbacks = action.payload.content || [];
        state.totalCount = action.payload.totalElements || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.hasNext = action.payload.hasNext || false;
        state.hasPrevious = action.payload.hasPrevious || false;
        state.error = null;
      })
      .addCase(getAIFeedbacks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getDailyFeedback
    builder
      .addCase(getDailyFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDailyFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyFeedback = action.payload;
        state.error = null;
      })
      .addCase(getDailyFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getWeeklyFeedback
    builder
      .addCase(getWeeklyFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWeeklyFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklyFeedback = action.payload;
        state.error = null;
      })
      .addCase(getWeeklyFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getMonthlyFeedback
    builder
      .addCase(getMonthlyFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMonthlyFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyFeedback = action.payload;
        state.error = null;
      })
      .addCase(getMonthlyFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // generateAIFeedback
    builder
      .addCase(generateAIFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateAIFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload;
        state.feedbacks.unshift(action.payload);
        state.error = null;
      })
      .addCase(generateAIFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getAIFeedbackById
    builder
      .addCase(getAIFeedbackById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAIFeedbackById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload;
        state.error = null;
      })
      .addCase(getAIFeedbackById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteAIFeedback
    builder
      .addCase(deleteAIFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAIFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedbacks = state.feedbacks.filter(feedback => feedback.id !== action.payload);
        if (state.currentFeedback?.id === action.payload) {
          state.currentFeedback = null;
        }
        state.error = null;
      })
      .addCase(deleteAIFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getAIFeedbackStatistics
    builder
      .addCase(getAIFeedbackStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAIFeedbackStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(getAIFeedbackStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getAIFeedbackSettings
    builder
      .addCase(getAIFeedbackSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAIFeedbackSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(getAIFeedbackSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateAIFeedbackSettings
    builder
      .addCase(updateAIFeedbackSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAIFeedbackSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateAIFeedbackSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  clearError,
  setCurrentFeedback,
  clearCurrentFeedback,
  addFeedback,
  updateFeedbackInList,
  removeFeedbackFromList,
  clearFeedbacks,
} = aiFeedbackSlice.actions;

// Selectors
export const selectAIFeedback = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback;
export const selectAIFeedbacksList = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.feedbacks;
export const selectDailyFeedback = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.dailyFeedback;
export const selectWeeklyFeedback = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.weeklyFeedback;
export const selectMonthlyFeedback = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.monthlyFeedback;
export const selectCurrentAIFeedback = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.currentFeedback;
export const selectAIFeedbackStatistics = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.statistics;
export const selectAIFeedbackSettings = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.settings;
export const selectIsAIFeedbackLoading = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.isLoading;
export const selectAIFeedbackError = (state: { aiFeedback: AIFeedbackState }) => state.aiFeedback.error;
export const selectAIFeedbackPagination = (state: { aiFeedback: AIFeedbackState }) => ({
  totalCount: state.aiFeedback.totalCount,
  currentPage: state.aiFeedback.currentPage,
  hasNext: state.aiFeedback.hasNext,
  hasPrevious: state.aiFeedback.hasPrevious,
});

export default aiFeedbackSlice.reducer; 