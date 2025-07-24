import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { theme } from '../../theme';
import apiClient from '../../services/apiClient';
import { aiFeedbackService, AiFeedbackRequest } from '../../services/aiFeedbackService';
import AiFeedbackSurvey, { AiFeedbackSurveyData } from '../../components/AiFeedbackSurvey';
import { useFocusEffect } from '@react-navigation/native';
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
}

const StatisticsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TimerRecord[]>([]);
  const [aiLoading, setAiLoading] = useState<number | null>(null);
  const [surveyVisible, setSurveyVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimerRecord | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      apiClient.get('/timer/history')
        .then(data => {
          if (data.success) {
            console.log('[통계] 받은 데이터:', JSON.stringify(data.data, null, 2));
            setRecords(data.data);
          }
        })
        .catch((err) => {
          console.error('기록 조회 에러:', err);
        })
        .finally(() => setLoading(false));
    }, [])
  );

  const formatTime = (sec: number) => {
    // 비정상적으로 큰 값 처리 (예: 9000초 = 2.5시간이면 150초 = 2.5분으로 변환)
    let adjustedSec = sec;
    if (sec > 3600) { // 1시간 이상이면 의심스러운 값
      console.warn(`[통계] 비정상적으로 큰 시간값 감지: ${sec}초, 원래값: ${sec}초`);
      // 만약 실제로는 분 단위였다면 60으로 나누어 변환
      if (sec % 60 === 0) {
        adjustedSec = Math.floor(sec / 60);
        console.log(`[통계] 분 단위로 변환: ${sec}초 → ${adjustedSec}초`);
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
    // 백엔드에서 받은 studyTime, restTime은 이제 초 단위로 저장됨
    const studySeconds = item.studyTime ?? 0;
    const restSeconds = item.restTime ?? 0;
    const totalSeconds = studySeconds + restSeconds;
    
    // 디버그: 실제 받은 값 확인
    console.log(`[통계] 기록 ID ${item.id}:`, {
      원본studyTime: item.studyTime,
      원본restTime: item.restTime,
      계산된studySeconds: studySeconds,
      계산된restSeconds: restSeconds,
      의심스러운값: {
        studyTime큰값: studySeconds > 3600 ? 'YES' : 'NO',
        restTime큰값: restSeconds > 3600 ? 'YES' : 'NO',
        studyTime60배수: studySeconds % 60 === 0 ? 'YES' : 'NO',
        restTime60배수: restSeconds % 60 === 0 ? 'YES' : 'NO'
      },
      formatTime결과: {
        공부: formatTime(studySeconds),
        휴식: formatTime(restSeconds),
        총합: formatTime(totalSeconds)
      }
    });
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
        
        {/* AI 피드백 섹션 */}
        {item.aiFeedback && (
          <View style={styles.aiSection}>
            <Text style={styles.aiTitle}>🤖 AI 피드백</Text>
            <Text style={styles.aiText}>{item.aiFeedback}</Text>
            <Text style={styles.aiTitle}>💡 개선 제안</Text>
            <Text style={styles.aiText}>{item.aiSuggestions}</Text>
            <Text style={styles.aiTitle}>💪 동기부여</Text>
            <Text style={styles.aiText}>{item.aiMotivation}</Text>
          </View>
        )}
        
        {/* AI 피드백 버튼 */}
        <Button
          title={aiLoading === item.id ? "AI 분석 중..." : "AI 피드백 받기"}
          onPress={() => handleAiFeedback(item)}
          disabled={aiLoading === item.id}
          size="sm"
          variant="secondary"
          style={styles.aiButton}
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

  const handleSurveySubmit = async (surveyData: AiFeedbackSurveyData) => {
    if (!selectedRecord) return;

    try {
      setAiLoading(selectedRecord.id);
      setSurveyVisible(false);
      
      const request: AiFeedbackRequest = {
        timerId: selectedRecord.id,
        studySummary: selectedRecord.summary || '학습 기록',
        studyTime: Math.round((selectedRecord.studyTime || 0) / 60), // 초를 분으로 변환
        restTime: Math.round((selectedRecord.restTime || 0) / 60),   // 초를 분으로 변환
        mode: selectedRecord.mode || '25/5',
        // 설문조사 데이터 추가
        ...surveyData
      };

      const feedback = await aiFeedbackService.createFeedback(request);
      
      // 기록 목록 업데이트
      setRecords(prev => prev.map(item => 
        item.id === selectedRecord.id 
          ? { ...item, aiFeedback: feedback.feedback, aiSuggestions: feedback.suggestions, aiMotivation: feedback.motivation }
          : item
      ));

      Alert.alert('AI 피드백 완료', 'AI 피드백이 생성되었습니다!');
    } catch (error) {
      console.error('AI 피드백 생성 에러:', error);
      Alert.alert('오류', 'AI 피드백 생성에 실패했습니다.');
    } finally {
      setAiLoading(null);
      setSelectedRecord(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <Text style={styles.title}>타이머 기록 통계</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary[500]} style={{ marginTop: 40 }} />
        ) : records.length === 0 ? (
          <Text style={styles.emptyText}>아직 기록이 없습니다.</Text>
        ) : (
          <FlatList
            data={records}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    // paddingTop: 24, // SafeAreaView가 처리하므로 제거
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary[500],
    marginBottom: 18,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: 32,
  },
  card: {
    marginBottom: theme.spacing[4],
    backgroundColor: '#FFF',
    borderRadius: 18,
    shadowColor: '#AEE6FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
    padding: theme.spacing[4],
  },
  dateText: {
    fontSize: 16,
    color: '#7ED957',
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modeText: {
    fontSize: 15,
    color: '#6EC1E4',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    color: '#FFB6B6',
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginTop: 40,
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
    color: theme.colors.primary[500],
    marginBottom: 8,
    marginTop: 12,
  },
  aiText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  aiButton: {
    marginTop: 16,
  },
});

export default StatisticsScreen; 