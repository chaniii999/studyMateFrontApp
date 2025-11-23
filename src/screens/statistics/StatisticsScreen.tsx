import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, StatusBar, ScrollView } from 'react-native';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DreamyNightBackground from '../../components/common/DreamyNightBackground';
import { theme } from '../../theme';
import apiClient from '../../services/apiClient';
import { aiFeedbackService } from '../../services/aiFeedbackService';
import { studyGoalService } from '../../services';
import { StudySessionSummary, AiFeedbackRequest } from '../../types/aiFeedback';
import { StudyGoalResponse } from '../../types';
import AiFeedbackSurvey, { AiFeedbackSurveyData } from '../../components/AiFeedbackSurvey';
import { useFocusEffect } from '@react-navigation/native';
import { timerService } from '../../services';

interface TimerRecord {
  id: number;
  startTime: string;
  endTime: string;
  studyTime: number;  // 백엔드 필드명과 일치
  restTime: number;   // 백엔드 필드명과 일치
  mode: string;
  summary: string;
  aiFeedback?: string;
  aiSuggestions?: string;
  aiMotivation?: string;
  sessionSummary?: StudySessionSummary; // 새로운 세션 요약 정보
}

const StatisticsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TimerRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TimerRecord[]>([]);
  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [surveyVisible, setSurveyVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimerRecord | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<Set<number>>(new Set());
  
  // 학습목표 필터링 관련 상태
  const [activeGoals, setActiveGoals] = useState<StudyGoalResponse[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showGoalFilter, setShowGoalFilter] = useState(false);

  // 학습목표 로드
  const loadActiveGoals = async () => {
    try {
      const response = await studyGoalService.getActiveStudyGoals();
      if (response.success && response.data) {
        setActiveGoals(response.data);
      }
    } catch (error) {
      console.error('학습목표 로드 에러:', error);
      setActiveGoals([]);
    }
  };

  // 필터링 적용
  const applyFilter = (goalId: number | null, recordsList: TimerRecord[]) => {
    if (goalId === null) {
      setFilteredRecords(recordsList);
    } else {
      // TODO: 백엔드에서 학습목표별 타이머 기록 조회 API 구현 후 사용
      // 현재는 전체 기록 표시
      setFilteredRecords(recordsList);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      loadActiveGoals(); // 학습목표 로드
      
      console.log('[통계] 타이머 기록 조회 시작');
      apiClient.get('/timer/history')
        .then(data => {
          console.log('[통계] 타이머 기록 조회 응답:', {
            success: data.success,
            message: data.message,
            dataLength: data.data?.length || 0,
            rawData: data.data
          });
          
          if (data.success && data.data) {
            // 각 기록의 상세 정보 로그
            console.log('[통계] 기록 상세 정보:');
            data.data.forEach((record: TimerRecord, index: number) => {
              console.log(`[통계] 기록 ${index + 1}:`, {
                id: record.id,
                startTime: record.startTime,
                endTime: record.endTime,
                studyTime: record.studyTime,
                restTime: record.restTime,
                studyTimeType: typeof record.studyTime,
                restTimeType: typeof record.restTime,
                mode: record.mode,
                summary: record.summary,
                전체객체: record
              });
            });
            
            setRecords(data.data);
            applyFilter(selectedGoalId, data.data);
            
            // 기존 AI 피드백이 있는 기록들의 세션 요약 정보 로드
            const recordsWithAiFeedback = data.data.filter((record: TimerRecord) => record.aiFeedback);
            recordsWithAiFeedback.forEach(async (record: TimerRecord) => {
              try {
                const existingFeedback = await aiFeedbackService.getExistingFeedback(record.id);
                setRecords(prev => {
                  return prev.map(item => 
                    item.id === record.id 
                    ? { ...item, sessionSummary: existingFeedback.sessionSummary }
                    : item
                  );
                });
              } catch (error) {
                // 세션 요약 로드 실패 시 조용히 처리
              }
            });
          } else {
            console.warn('[통계] 타이머 기록 조회 실패 또는 데이터 없음:', data);
          }
        })
        .catch((err) => {
          console.error('[통계] 기록 조회 에러:', err);
        })
        .finally(() => setLoading(false));
    }, [selectedGoalId])
  );

  // 학습목표 필터 변경 시 필터링 적용
  useEffect(() => {
    applyFilter(selectedGoalId, records);
  }, [selectedGoalId, records]);

  const formatTime = (sec: number) => {
    // 비정상적으로 큰 값 처리 (예: 9000초 = 2.5시간이면 150초 = 2.5분으로 변환)
    let adjustedSec = sec;
    if (sec > 3600) { // 1시간 이상이면 의심스러운 값
      // 만약 실제로는 분 단위였다면 60으로 나누어 변환
      if (sec % 60 === 0) {
        adjustedSec = Math.floor(sec / 60);
      }
    }
    
    const hours = Math.floor(adjustedSec / 3600);
    const minutes = Math.floor((adjustedSec % 3600) / 60);
    const seconds = adjustedSec % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    } else {
      return `${seconds}초`;
    }
  };

  const renderItem = ({ item }: { item: TimerRecord }) => {
    // item이 undefined인 경우 처리
    if (!item) {
      console.warn('[통계] renderItem: item이 undefined입니다.');
      return null;
    }
    
    // 백엔드에서 받은 studyTime, restTime은 이제 초 단위로 저장됨
    const studySeconds = item.studyTime ?? 0;
    const restSeconds = item.restTime ?? 0;
    const totalSeconds = studySeconds + restSeconds;
    

    return (
      <Card style={styles.card} elevation="md" borderRadius="md">
        <Text style={styles.dateText}>{formatDate(item.startTime)}</Text>
        <View style={styles.row}>
          <Text style={styles.modeText}>모드: {item.mode}</Text>
        </View>
        <Text style={styles.timeText}>
          공부 {formatTime(studySeconds)}
        </Text>
        <Text style={styles.timeText}>
          휴식 {formatTime(restSeconds)}
        </Text>
        <Text style={styles.timeText}>
          총 합계 {formatTime(totalSeconds)}
        </Text>
        <Text style={styles.summaryText}>{item.summary || '요약 없음'}</Text>
        
        {/* 삭제 버튼 - 우상단 */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecord(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
        
        {/* AI 피드백 토글 버튼 */}
        {item.aiFeedback && (
          <TouchableOpacity
            style={styles.feedbackToggleButton}
            onPress={() => toggleFeedback(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.feedbackToggleText}>
              {expandedFeedback.has(item.id) ? '📖 AI 피드백 접기' : '🤖 AI 피드백 보기'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* AI 피드백 섹션 (접었다 펼 수 있음) */}
        {item.aiFeedback && expandedFeedback.has(item.id) && (
          <View style={styles.aiSection}>
            {/* 세션 요약 정보 표시 */}
            {item.sessionSummary && item.sessionSummary.sessionInfo && (
              <View style={styles.sessionSummarySection}>
                <Text style={styles.aiTitle}>📊 세션 요약</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>공부 시간</Text>
                    <Text style={styles.summaryValue}>{item.sessionSummary.sessionInfo.studyTime || '정보 없음'}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>휴식 시간</Text>
                    <Text style={styles.summaryValue}>{item.sessionSummary.sessionInfo.restTime || '정보 없음'}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>총 시간</Text>
                    <Text style={styles.summaryValue}>{item.sessionSummary.sessionInfo.totalTime || '정보 없음'}</Text>
                  </View>
                </View>
                
                {/* 학습 세부 정보 */}
                {item.sessionSummary.studyDetails && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>📚 학습 세부사항</Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>주제</Text>
                        <Text style={styles.detailValue}>{item.sessionSummary.studyDetails.topic || '정보 없음'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>목표</Text>
                        <Text style={styles.detailValue}>{item.sessionSummary.studyDetails.goal || '정보 없음'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>난이도</Text>
                        <Text style={styles.detailValue}>{item.sessionSummary.studyDetails.difficulty || '정보 없음'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>집중도</Text>
                        <Text style={styles.detailValue}>{item.sessionSummary.studyDetails.concentration || '정보 없음'}</Text>
                      </View>
                    </View>
                  </View>
                )}
                
                <Text style={styles.summaryText}>{item.sessionSummary.summary || '요약 정보가 없습니다.'}</Text>
              </View>
            )}
            
            <Text style={styles.aiTitle}>🤖 AI 피드백</Text>
            <Text style={styles.aiText}>{item.aiFeedback}</Text>
            <Text style={styles.aiTitle}>💡 개선 제안</Text>
            <Text style={styles.aiText}>{item.aiSuggestions}</Text>
            <Text style={styles.aiTitle}>💪 동기부여</Text>
            <Text style={styles.aiText}>{item.aiMotivation}</Text>
          </View>
        )}
        
        {/* AI 피드백 생성 버튼 */}
        <Button
          title={aiLoading === item.id ? "AI 분석 중..." : (item.aiFeedback ? "AI 피드백 다시 받기" : "AI 피드백 받기")}
          onPress={() => handleAiFeedback(item)}
          disabled={aiLoading === item.id}
          size="sm"
          variant={item.aiFeedback ? "primary" : "secondary"}
          style={item.aiFeedback ? styles.aiButtonRetry : styles.aiButton}
        />
      </Card>
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleAiFeedback = async (record: TimerRecord) => {
    setSelectedRecord(record);
    setSurveyVisible(true);
  };

  // 타이머 기록 삭제 함수
  const handleDeleteRecord = async (record: TimerRecord) => {
    Alert.alert(
      '기록 삭제',
      `${formatDate(record.startTime)} 기록을 삭제하시겠습니까?\n\n공부 시간: ${formatTime(record.studyTime)}\n휴식 시간: ${formatTime(record.restTime)}`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await timerService.deleteTimer(record.id);
              
              // 로컬 상태에서 삭제된 기록 제거
              setRecords(prev => prev.filter(item => item.id !== record.id));
              
              Alert.alert('삭제 완료', '타이머 기록이 삭제되었습니다.');
            } catch (error) {
              console.error('타이머 기록 삭제 에러:', error);
              Alert.alert('삭제 실패', '타이머 기록 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const toggleFeedback = (recordId: number) => {
    setExpandedFeedback(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleSurveySubmit = async (surveyData: AiFeedbackSurveyData) => {
    if (!selectedRecord) return;

    try {
      // 백엔드 요구사항: 최소 3분(180초) 이상의 학습 시간 필요
      const studyTimeSeconds = selectedRecord.studyTime || 0;
      if (studyTimeSeconds < 180) {
        const studyMinutes = Math.floor(studyTimeSeconds / 60);
        const studySeconds = studyTimeSeconds % 60;
        Alert.alert(
          'AI 피드백 요청 불가',
          `학습 시간이 너무 짧습니다.\n\n현재 학습 시간: ${studyMinutes}분 ${studySeconds}초\n최소 필요 시간: 3분 이상\n\n최소 3분 이상 학습한 후 AI 피드백을 요청해주세요.`
        );
        return;
      }

      setAiLoading(selectedRecord.id);
      setSurveyVisible(false);
      
      console.log('[통계] AI 피드백 요청 시작:', {
        recordId: selectedRecord.id,
        studyTime: selectedRecord.studyTime,
        restTime: selectedRecord.restTime,
        studyTimeMinutes: Math.floor(studyTimeSeconds / 60),
        surveyData
      });
      
      const request: AiFeedbackRequest = {
        timerId: selectedRecord.id,
        studySummary: selectedRecord.summary || '학습 기록',
        studyTime: studyTimeSeconds, // 초 단위로 직접 전송
        restTime: selectedRecord.restTime || 0,   // 초 단위로 직접 전송
        mode: selectedRecord.mode || '25/5',
        // 설문조사 데이터 추가
        ...surveyData
      };

      console.log('[통계] AI 피드백 요청 데이터:', request);

      const feedback = await aiFeedbackService.createFeedback(request);
      
      console.log('[통계] AI 피드백 응답 수신:', feedback);
      
      // 기록 목록 업데이트 (새로운 응답 구조 반영)
      setRecords(prev => prev.map(item => 
        item.id === selectedRecord.id 
          ? { 
              ...item, 
              aiFeedback: feedback.feedback, 
              aiSuggestions: feedback.suggestions, 
              aiMotivation: feedback.motivation,
              sessionSummary: feedback.sessionSummary // 새로운 세션 요약 정보 추가
            }
          : item
      ));

      Alert.alert('AI 피드백 완료', 'AI 피드백이 생성되었습니다!');
    } catch (error: any) {
      console.error('[통계] AI 피드백 생성 에러:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        response: error?.response,
        request: error?.request,
        stack: error?.stack
      });
      
      // 네트워크 에러나 타임아웃인 경우, 백엔드에서 이미 처리되었을 수 있으므로
      // 기존 피드백이 있는지 확인
      if (error?.code === 'NETWORK_ERROR' || error?.code === 'REQUEST_ERROR' || error?.message?.includes('timeout')) {
        console.log('[통계] 네트워크/타임아웃 에러 - 기존 피드백 확인 시도');
        try {
          const existingFeedback = await aiFeedbackService.getExistingFeedback(selectedRecord.id);
          console.log('[통계] 기존 피드백 발견, 기록 업데이트');
          
          // 기록 목록 업데이트
          setRecords(prev => prev.map(item => 
            item.id === selectedRecord.id 
              ? { 
                  ...item, 
                  aiFeedback: existingFeedback.feedback, 
                  aiSuggestions: existingFeedback.suggestions, 
                  aiMotivation: existingFeedback.motivation,
                  sessionSummary: existingFeedback.sessionSummary
                }
              : item
          ));
          
          Alert.alert('AI 피드백 완료', 'AI 피드백이 생성되었습니다!');
          return; // 성공적으로 처리되었으므로 종료
        } catch (checkError) {
          console.log('[통계] 기존 피드백 없음:', checkError);
          // 기존 피드백이 없으면 원래 에러 메시지 표시
        }
      }
      
      // 에러 메시지 추출
      let errorMessage = 'AI 피드백 생성에 실패했습니다.';
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.code) {
          switch (error.code) {
            case 'NETWORK_ERROR':
              errorMessage = '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.';
              break;
            case 'BAD_REQUEST':
              errorMessage = error.message || '잘못된 요청입니다.';
              break;
            case 'UNAUTHORIZED':
              errorMessage = '인증이 필요합니다.';
              break;
            case 'FORBIDDEN':
              errorMessage = '권한이 없습니다.';
              break;
            case 'NOT_FOUND':
              errorMessage = '타이머 기록을 찾을 수 없습니다.';
              break;
            case 'SERVER_ERROR':
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
              break;
            default:
              errorMessage = error.message || 'AI 피드백 생성에 실패했습니다.';
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // 백엔드 에러 메시지 확인 (특정 에러 케이스)
      if (errorMessage.includes('학습 시간이 3분 미만')) {
        errorMessage = '학습 시간이 너무 짧습니다. 최소 3분 이상 학습한 후 AI 피드백을 요청해주세요.';
      } else if (errorMessage.includes('사용량이 초과')) {
        errorMessage = 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setAiLoading(null);
      setSelectedRecord(null);
    }
  };

  return (
    <View style={styles.safeArea}>
      {/* StatusBar 설정 */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 야경 배경 추가 */}
      <DreamyNightBackground />
      
      <View style={styles.container}>
        <Text style={styles.title}>타이머 기록 통계</Text>
        
        {/* 학습목표 필터 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowGoalFilter(!showGoalFilter)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterLabel}>📊 필터</Text>
            <Text style={styles.filterValue} numberOfLines={1}>
              {selectedGoalId 
                ? activeGoals.find(g => g.id === selectedGoalId)?.title || '선택됨'
                : '전체 기록'
              }
            </Text>
            <Text style={styles.filterArrow}>
              {showGoalFilter ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          
          {showGoalFilter && (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={[styles.filterOption, selectedGoalId === null && styles.selectedFilterOption]}
                onPress={() => {
                  setSelectedGoalId(null);
                  setShowGoalFilter(false);
                }}
              >
                <Text style={styles.filterOptionText}>전체 기록 보기</Text>
              </TouchableOpacity>
              {activeGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.filterOption, selectedGoalId === goal.id && styles.selectedFilterOption]}
                  onPress={() => {
                    setSelectedGoalId(goal.id);
                    setShowGoalFilter(false);
                  }}
                >
                  <View style={styles.filterOptionContent}>
                    <View style={[styles.goalColorDot, { backgroundColor: goal.color || '#3B82F6' }]} />
                    <View style={styles.filterOptionTextContainer}>
                      <Text style={styles.filterOptionTitle} numberOfLines={1}>{goal.title}</Text>
                      <Text style={styles.filterOptionSubject}>{goal.subject}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
        ) : filteredRecords.length === 0 ? (
          <Text style={styles.emptyText}>
            {selectedGoalId ? '해당 학습목표의 기록이 없습니다.' : '아직 기록이 없습니다.'}
          </Text>
        ) : (
          <FlatList
            data={filteredRecords}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* AI 피드백 설문조사 모달 */}
      <AiFeedbackSurvey
        visible={surveyVisible}
        onClose={() => {
          setSurveyVisible(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleSurveySubmit}
        loading={aiLoading !== null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // 배경을 투명하게 하여 DreamyNightBackground가 보이도록
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60, // StatusBar 영역을 고려한 상단 패딩
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // 흰색 텍스트
    marginBottom: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  listContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: 120, // 네비게이션 바 영역을 고려한 하단 패딩
  },
  card: {
    position: 'relative', // 삭제 버튼 absolute 위치를 위해 추가
    marginBottom: theme.spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // 반투명 글래스모피즘
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    padding: theme.spacing[4],
  },
  dateText: {
    fontSize: 16,
    color: '#A8E6CF', // 밝은 초록색
    fontWeight: '600',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modeText: {
    fontSize: 15,
    color: '#A8D8EA', // 밝은 파란색
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeText: {
    fontSize: 15,
    color: '#FFB6B6', // 밝은 분홍색
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryText: {
    fontSize: 15,
    color: '#FFFFFF', // 흰색
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)', // 반투명한 흰색
    fontSize: 16,
    marginTop: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aiSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // 흰색으로 변경
    marginBottom: 8,
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  aiText: {
    fontSize: 14,
    color: '#FFFFFF', // 흰색으로 변경
    lineHeight: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  aiButton: {
    marginTop: 16,
  },
  aiButtonRetry: {
    marginTop: 16,
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  feedbackToggleButton: {
    backgroundColor: '#E0F7FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#6EC1E4',
  },
  feedbackToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6EC1E4',
    textAlign: 'center',
  },
  sessionSummarySection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#E0E0E0', // 밝은 회색으로 변경
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // 흰색으로 변경
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary[500],
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  // 학습목표 필터 관련 스타일
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  filterValue: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  filterArrow: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginLeft: 8,
  },
  filterDropdown: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    maxHeight: 200,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFilterOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  filterOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  filterOptionTextContainer: {
    flex: 1,
  },
  filterOptionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  filterOptionSubject: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default StatisticsScreen; 