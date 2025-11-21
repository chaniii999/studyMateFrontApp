import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StudyGoalResponse } from '../../types';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface StudyGoalCardProps {
  goal: StudyGoalResponse;
  onPress?: () => void;
}

const StudyGoalCard: React.FC<StudyGoalCardProps> = ({ goal, onPress }) => {
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  const daysLeft = differenceInDays(targetDate, today);
  
  const getStatusColor = () => {
    if (goal.status === 'COMPLETED') return '#10B981';
    if (goal.status === 'PAUSED') return '#F59E0B';
    if (goal.status === 'CANCELLED') return '#EF4444';
    return goal.color || '#3B82F6';
  };

  const getStatusText = () => {
    switch (goal.status) {
      case 'COMPLETED': return '완료';
      case 'PAUSED': return '일시정지';
      case 'CANCELLED': return '취소';
      default: return '진행중';
    }
  };

  const getDDayText = () => {
    if (goal.status === 'COMPLETED') return '완료됨';
    if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
    if (daysLeft === 0) return 'D-Day';
    return `D-${daysLeft}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: getStatusColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
          <Text style={styles.subject}>{goal.subject}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          <Text style={styles.dDay}>{getDDayText()}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { 
                width: `${Math.min(100, goal.progressRate)}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {goal.currentHours}시간 / {goal.targetHours}시간 ({Math.round(goal.progressRate)}%)
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.sessions}>
          📚 {goal.currentSessions}회 학습
        </Text>
        <Text style={styles.remaining}>
          ⏰ {goal.remainingHours}시간 남음
        </Text>
      </View>

      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dDay: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessions: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  remaining: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    lineHeight: 16,
  },
});

export default StudyGoalCard;