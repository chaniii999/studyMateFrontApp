import { CommonActions, StackActions } from '@react-navigation/native';

// 네비게이션 참조를 저장할 변수
let navigationRef: any = null;

// 네비게이션 참조 설정
export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

// 네비게이션 참조 가져오기
export const getNavigationRef = () => {
  return navigationRef;
};

// 루트로 이동
export const navigateToRoot = (routeName: string, params?: any) => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      })
    );
  }
};

// 스택 푸시
export const pushScreen = (routeName: string, params?: any) => {
  if (navigationRef) {
    navigationRef.dispatch(
      StackActions.push(routeName, params)
    );
  }
};

// 스택 팝
export const popScreen = () => {
  if (navigationRef) {
    navigationRef.dispatch(StackActions.pop());
  }
};

// 스택 팝 (여러 개)
export const popScreens = (count: number) => {
  if (navigationRef) {
    navigationRef.dispatch(StackActions.pop(count));
  }
};

// 스택 리셋
export const resetStack = (routeName: string, params?: any) => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  }
};

// 뒤로 가기
export const goBack = () => {
  if (navigationRef && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

// 모달 열기
export const openModal = (type: 'timer' | 'feedback' | 'settings', data?: any) => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'Modal',
        params: { type, data },
      })
    );
  }
};

// 모달 닫기
export const closeModal = () => {
  if (navigationRef) {
    navigationRef.dispatch(StackActions.pop());
  }
};

// 탭 변경
export const switchTab = (tabName: string) => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: tabName,
      })
    );
  }
};

// 인증 완료 후 메인으로 이동
export const navigateToMain = () => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  }
};

// 로그아웃 후 인증으로 이동
export const navigateToAuth = () => {
  if (navigationRef) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      })
    );
  }
}; 