# Firebase 연동 빠른 시작 가이드

## 🚀 5분 만에 Firebase 연동하기

### 1. Firebase 프로젝트 생성 (2분)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 만들기" 클릭
3. 프로젝트 이름: `meeteasy-app`
4. "프로젝트 만들기" 클릭
5. "웹 앱에 Firebase 추가" 클릭
6. 앱 닉네임: `meeteasy-web`
7. "앱 등록" 클릭

### 2. 설정 정보 복사 (30초)

앱 등록 후 제공되는 설정 정보를 복사:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "meeteasy-app.firebaseapp.com",
  projectId: "meeteasy-app",
  storageBucket: "meeteasy-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};
```

### 3. 코드에 설정 적용 (30초)

`config/firebase.ts` 파일에서 설정 정보 교체:

```typescript
const firebaseConfig = {
  apiKey: "실제_API_키_입력",
  authDomain: "실제_도메인_입력",
  projectId: "실제_프로젝트_ID_입력",
  storageBucket: "실제_스토리지_버킷_입력",
  messagingSenderId: "실제_발신자_ID_입력",
  appId: "실제_앱_ID_입력",
};
```

### 4. Firebase 서비스 활성화 (1분)

#### Authentication 활성화

- Firebase Console → Authentication → "시작하기"
- "이메일/비밀번호" 활성화

#### Firestore Database 활성화

- Firebase Console → Firestore Database → "데이터베이스 만들기"
- "테스트 모드에서 시작" 선택
- 위치: `asia-northeast3 (서울)`

#### Storage 활성화

- Firebase Console → Storage → "시작하기"
- "테스트 모드에서 시작" 선택
- 위치: `asia-northeast3 (서울)`

### 5. 앱 테스트 (1분)

```bash
npx expo start
```

앱에서 Firebase 연결 상태 확인:

- 연결 상태: 초록색 원 = 성공
- 인증 테스트 버튼으로 기능 확인

## 🔧 고급 설정 (선택사항)

### 환경 변수 설정

1. 프로젝트 루트에 `.env` 파일 생성
2. Firebase 설정 정보 입력
3. `config/firebase.ts`에서 환경 변수 사용

### 보안 규칙 설정

Firestore Database → 규칙 탭에서 보안 규칙 설정

## 📱 테스트 방법

### FirebaseTest 컴포넌트 사용

```typescript
import FirebaseTest from "../components/FirebaseTest";

// 앱에서 FirebaseTest 컴포넌트 렌더링
<FirebaseTest />;
```

### 수동 테스트

1. 앱 실행
2. Firebase 연결 상태 확인
3. 테스트 로그인 버튼 클릭
4. Firebase Console에서 사용자 확인

## 🚨 문제 해결

### 일반적인 오류

- **API 키 오류**: 설정 정보가 정확한지 확인
- **권한 오류**: 보안 규칙 확인
- **네트워크 오류**: 인터넷 연결 확인

### 디버깅

```typescript
// Firebase 초기화 확인
import { getApps } from "firebase/app";
console.log("Firebase apps:", getApps());

// 인증 상태 확인
import { auth } from "../config/firebase";
console.log("Current user:", auth.currentUser);
```

## ✅ 완료 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] 웹 앱 등록
- [ ] 설정 정보 복사
- [ ] config/firebase.ts 업데이트
- [ ] Authentication 활성화 (이메일/비밀번호만)
- [ ] Firestore Database 활성화
- [ ] Storage 활성화
- [ ] 앱 테스트 실행
- [ ] 연결 상태 확인

## 🎯 다음 단계

Firebase 연동이 완료되면:

1. 기존 화면과 Firebase 연동
2. 실시간 기능 구현
3. 푸시 알림 설정
4. 성능 최적화

---

**이제 MeetEasy 앱에서 Firebase를 완전히 사용할 수 있습니다! 🎉**
