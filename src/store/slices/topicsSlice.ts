import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { studyTopicService } from '../../services';
import { 
  StudyTopic, 
  CreateStudyTopicRequest, 
  UpdateStudyTopicRequest, 
  StudyTopicStatistics, 
  StudyTopicFilter,
  StudyTopicFeedback 
} from '../../types';

// 주제 상태 타입
interface TopicsState {
  topics: StudyTopic[];
  currentTopic: StudyTopic | null;
  statistics: StudyTopicStatistics[];
  currentFeedback: StudyTopicFeedback | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 초기 상태
const initialState: TopicsState = {
  topics: [],
  currentTopic: null,
  statistics: [],
  currentFeedback: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
};

// Async Thunks
export const getStudyTopics = createAsyncThunk(
  'topics/getTopics',
  async (filter: StudyTopicFilter | undefined, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.getStudyTopics(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 목록 조회에 실패했습니다.');
    }
  }
);

export const createStudyTopic = createAsyncThunk(
  'topics/createTopic',
  async (topicData: CreateStudyTopicRequest, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.createStudyTopic(topicData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 생성에 실패했습니다.');
    }
  }
);

export const getStudyTopicById = createAsyncThunk(
  'topics/getTopicById',
  async (topicId: string, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.getStudyTopicById(topicId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 조회에 실패했습니다.');
    }
  }
);

export const updateStudyTopic = createAsyncThunk(
  'topics/updateTopic',
  async ({ topicId, updateData }: { topicId: string; updateData: UpdateStudyTopicRequest }, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.updateStudyTopic(topicId, updateData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 업데이트에 실패했습니다.');
    }
  }
);

export const deleteStudyTopic = createAsyncThunk(
  'topics/deleteTopic',
  async (topicId: string, { rejectWithValue }) => {
    try {
      await studyTopicService.deleteStudyTopic(topicId);
      return topicId;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 삭제에 실패했습니다.');
    }
  }
);

export const getStudyTopicStatistics = createAsyncThunk(
  'topics/getStatistics',
  async (topicId: string, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.getStudyTopicStatistics(topicId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 통계 조회에 실패했습니다.');
    }
  }
);

export const getAllStudyTopicStatistics = createAsyncThunk(
  'topics/getAllStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.getAllStudyTopicStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '전체 학습 주제 통계 조회에 실패했습니다.');
    }
  }
);

export const getStudyTopicFeedback = createAsyncThunk(
  'topics/getFeedback',
  async ({ topicId, period }: { topicId: string; period: 'daily' | 'weekly' | 'monthly' }, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.getStudyTopicFeedback(topicId, period);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 AI 피드백 조회에 실패했습니다.');
    }
  }
);

export const generateStudyTopicFeedback = createAsyncThunk(
  'topics/generateFeedback',
  async ({ topicId, period }: { topicId: string; period: 'daily' | 'weekly' | 'monthly' }, { rejectWithValue }) => {
    try {
      const response = await studyTopicService.generateStudyTopicFeedback(topicId, period);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '학습 주제 AI 피드백 생성에 실패했습니다.');
    }
  }
);

// Topics Slice
const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTopic: (state, action: PayloadAction<StudyTopic | null>) => {
      state.currentTopic = action.payload;
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },
    addTopic: (state, action: PayloadAction<StudyTopic>) => {
      state.topics.unshift(action.payload);
    },
    updateTopicInList: (state, action: PayloadAction<StudyTopic>) => {
      const index = state.topics.findIndex(topic => topic.id === action.payload.id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
    },
    removeTopicFromList: (state, action: PayloadAction<string>) => {
      state.topics = state.topics.filter(topic => topic.id !== action.payload);
    },
    clearTopics: (state) => {
      state.topics = [];
      state.currentTopic = null;
      state.statistics = [];
      state.currentFeedback = null;
    },
  },
  extraReducers: (builder) => {
    // getStudyTopics
    builder
      .addCase(getStudyTopics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudyTopics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topics = action.payload.content || [];
        state.totalCount = action.payload.totalElements || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.hasNext = action.payload.hasNext || false;
        state.hasPrevious = action.payload.hasPrevious || false;
        state.error = null;
      })
      .addCase(getStudyTopics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createStudyTopic
    builder
      .addCase(createStudyTopic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStudyTopic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topics.unshift(action.payload);
        state.error = null;
      })
      .addCase(createStudyTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getStudyTopicById
    builder
      .addCase(getStudyTopicById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudyTopicById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTopic = action.payload;
        state.error = null;
      })
      .addCase(getStudyTopicById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateStudyTopic
    builder
      .addCase(updateStudyTopic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStudyTopic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTopic = action.payload;
        // 목록에서도 업데이트
        const index = state.topics.findIndex(topic => topic.id === action.payload.id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateStudyTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteStudyTopic
    builder
      .addCase(deleteStudyTopic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteStudyTopic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topics = state.topics.filter(topic => topic.id !== action.payload);
        if (state.currentTopic?.id === action.payload) {
          state.currentTopic = null;
        }
        state.error = null;
      })
      .addCase(deleteStudyTopic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getStudyTopicStatistics
    builder
      .addCase(getStudyTopicStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudyTopicStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        // 개별 통계는 현재 주제의 통계로 저장
        if (state.currentTopic) {
          const index = state.statistics.findIndex(stat => stat.topicId === action.payload.topicId);
          if (index !== -1) {
            state.statistics[index] = action.payload;
          } else {
            state.statistics.push(action.payload);
          }
        }
        state.error = null;
      })
      .addCase(getStudyTopicStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getAllStudyTopicStatistics
    builder
      .addCase(getAllStudyTopicStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllStudyTopicStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(getAllStudyTopicStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getStudyTopicFeedback
    builder
      .addCase(getStudyTopicFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudyTopicFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload;
        state.error = null;
      })
      .addCase(getStudyTopicFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // generateStudyTopicFeedback
    builder
      .addCase(generateStudyTopicFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateStudyTopicFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload;
        state.error = null;
      })
      .addCase(generateStudyTopicFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  clearError,
  setCurrentTopic,
  clearCurrentTopic,
  addTopic,
  updateTopicInList,
  removeTopicFromList,
  clearTopics,
} = topicsSlice.actions;

// Selectors
export const selectTopics = (state: { topics: TopicsState }) => state.topics;
export const selectTopicsList = (state: { topics: TopicsState }) => state.topics.topics;
export const selectCurrentTopic = (state: { topics: TopicsState }) => state.topics.currentTopic;
export const selectTopicsStatistics = (state: { topics: TopicsState }) => state.topics.statistics;
export const selectCurrentFeedback = (state: { topics: TopicsState }) => state.topics.currentFeedback;
export const selectIsTopicsLoading = (state: { topics: TopicsState }) => state.topics.isLoading;
export const selectTopicsError = (state: { topics: TopicsState }) => state.topics.error;
export const selectTopicsPagination = (state: { topics: TopicsState }) => ({
  totalCount: state.topics.totalCount,
  currentPage: state.topics.currentPage,
  hasNext: state.topics.hasNext,
  hasPrevious: state.topics.hasPrevious,
});

export default topicsSlice.reducer; 