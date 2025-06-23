This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# StudyMate Front App

React Native 기반의 스레드형 SNS 웹 애플리케이션입니다.

## 🚀 Figma MCP 통합

이 프로젝트는 Figma MCP(Model Context Protocol)를 통합하여 Figma 디자인을 React Native 컴포넌트로 자동 변환할 수 있습니다.

### 📋 사전 요구사항

1. **Figma API 키**: Figma 개발자 계정에서 API 키를 발급받으세요
2. **Node.js**: v16 이상
3. **React Native 개발 환경**

### 🔧 Figma MCP 설정

#### 1. API 키 설정 (보안 중요!)

**환경 변수 사용 (권장):**
```bash
# .env 파일 생성
echo "FIGMA_API_KEY=your_figma_api_key_here" > .env
```

**또는 설정 파일 사용:**
`figma-config.json` 파일에 Figma API 키를 설정합니다:

```json
{
  "figmaApiKey": "your_figma_api_key_here",
  "projectSettings": {
    "defaultFileId": "",
    "exportFormats": ["svg", "png"],
    "exportScales": [1, 2, 3],
    "componentSync": true
  },
  "mcpSettings": {
    "enabled": true,
    "port": 3001,
    "host": "localhost"
  }
}
```

⚠️ **보안 주의사항:**
- API 키는 절대 Git에 커밋하지 마세요
- `figma-config.json`과 `.env` 파일은 `.gitignore`에 포함되어 있습니다
- 프로덕션 환경에서는 환경 변수를 사용하세요

#### 2. MCP 서버 실행

```bash
# 환경 변수로 API 키 설정
export FIGMA_API_KEY=your_api_key_here
npx figma-developer-mcp --figma-api-key=$FIGMA_API_KEY

# 또는 직접 API 키 전달
npx figma-developer-mcp --figma-api-key=your_api_key_here
```

#### 3. 프로젝트 실행

```bash
# 의존성 설치
npm install

# iOS 시뮬레이터 실행
npm run ios

# Android 에뮬레이터 실행
npm run android
```

### 🎨 Figma 디자인 뷰어 사용법

1. **Figma 파일 ID 입력**: Figma 파일 URL에서 파일 ID를 추출하여 입력
2. **컴포넌트 탐색**: 파일의 모든 컴포넌트를 목록으로 확인
3. **이미지 내보내기**: 선택한 컴포넌트를 PNG/SVG 형식으로 내보내기
4. **React Native 변환**: 컴포넌트를 React Native 코드로 자동 변환

### 🔄 주요 기능

#### Figma API 통합
- **실시간 동기화**: Figma 파일 변경사항을 실시간으로 반영
- **컴포넌트 관리**: 모든 Figma 컴포넌트를 체계적으로 관리
- **이미지 내보내기**: 다양한 형식과 해상도로 이미지 내보내기

#### React Native 변환
- **자동 코드 생성**: Figma 디자인을 React Native 컴포넌트로 변환
- **스타일 매핑**: Figma 스타일을 React Native StyleSheet로 변환
- **레이아웃 지원**: Flexbox 기반 레이아웃 자동 생성

#### 성능 최적화
- **캐싱 시스템**: API 응답을 효율적으로 캐싱
- **지연 로딩**: 필요한 데이터만 요청하여 성능 최적화
- **에러 처리**: 안정적인 에러 처리 및 복구 메커니즘

### 📁 프로젝트 구조

```
src/
├── components/
│   └── FigmaDesignViewer.tsx    # Figma 디자인 뷰어 컴포넌트
├── hooks/
│   └── useFigmaDesign.ts        # Figma API 관리 Hook
├── screens/
│   └── FigmaScreen.tsx          # Figma 통합 예제 화면
├── utils/
│   ├── figmaApi.ts              # Figma API 클라이언트
│   └── figmaToReactNative.ts    # Figma → React Native 변환기
└── ...
```

### 🛠️ 개발 가이드

#### 새로운 Figma 컴포넌트 추가

1. **API 호출**: `figmaAPI.getFile(fileId)`로 파일 정보 가져오기
2. **노드 탐색**: `figmaAPI.findNodesByType()`으로 특정 타입의 노드 찾기
3. **변환**: `figmaConverter.convertToReactNative()`로 코드 생성

#### 커스텀 변환 규칙 추가

```typescript
// figmaToReactNative.ts에서 새로운 변환 로직 추가
private convertCustomNode(node: FigmaNode): ConvertedComponent {
  // 커스텀 변환 로직
  return {
    name: this.generateComponentName(node.name),
    component: 'CustomComponent',
    styles: this.convertStyles(node),
  };
}
```

### 🔒 보안 고려사항

- **API 키 보호**: API 키를 환경 변수나 안전한 설정 파일에 저장
- **요청 제한**: Figma API 요청 제한을 고려한 캐싱 구현
- **에러 처리**: 민감한 정보가 노출되지 않도록 에러 메시지 관리
- **Git 보안**: `.env`, `figma-config.json` 등 민감한 파일은 `.gitignore`에 포함

### 🚀 성능 최적화 팁

1. **배치 처리**: 여러 컴포넌트를 한 번에 처리하여 API 호출 최소화
2. **이미지 최적화**: 적절한 해상도와 형식으로 이미지 내보내기
3. **메모리 관리**: 큰 파일 처리 시 메모리 사용량 모니터링

### 📚 추가 리소스

- [Figma API 문서](https://www.figma.com/developers/api)
- [React Native 스타일링 가이드](https://reactnative.dev/docs/style)
- [MCP 프로토콜 문서](https://modelcontextprotocol.io/)

## 🎯 향후 개선 계획

- [ ] **고급 변환 기능**: 복잡한 Figma 컴포넌트 지원
- [ ] **실시간 협업**: 팀원과 실시간으로 디자인 공유
- [ ] **버전 관리**: Figma 파일 버전 히스토리 관리
- [ ] **테마 시스템**: 다크/라이트 모드 자동 변환
- [ ] **접근성**: WCAG 가이드라인 준수 자동 검사

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
