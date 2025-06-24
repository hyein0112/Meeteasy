# Firebase 연동 설정 가이드

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. Google 계정으로 로그인

### 1.2 새 프로젝트 생성

1. "프로젝트 만들기" 클릭
2. 프로젝트 이름 입력: `meeteasy-app` (또는 원하는 이름)
3. Google Analytics 사용 설정 (선택사항)
4. "프로젝트 만들기" 클릭

### 1.3 앱 등록

1. 프로젝트 대시보드에서 "웹 앱에 Firebase 추가" 클릭
2. 앱 닉네임 입력: `meeteasy-web`
3. "앱 등록" 클릭

## 2. Firebase 설정 정보 가져오기

### 2.1 웹 앱 설정 정보

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

### 2.2 설정 정보 적용

`config/firebase.ts` 파일에 실제 설정 정보를 입력:

```typescript
const firebaseConfig = {
  apiKey: "실제_API_키",
  authDomain: "실제_도메인",
  projectId: "실제_프로젝트_ID",
  storageBucket: "실제_스토리지_버킷",
  messagingSenderId: "실제_발신자_ID",
  appId: "실제_앱_ID",
};
```

## 3. Firebase 서비스 활성화

### 3.1 Authentication 활성화

1. Firebase Console → Authentication → "시작하기"
2. "로그인 방법" 탭에서 다음 활성화:
   - **이메일/비밀번호**: 활성화

### 3.2 Firestore Database 활성화

1. Firebase Console → Firestore Database → "데이터베이스 만들기"
2. 보안 규칙 선택: "테스트 모드에서 시작" (개발용)
3. 위치 선택: `asia-northeast3 (서울)` (한국 사용자용)

### 3.3 Storage 활성화

1. Firebase Console → Storage → "시작하기"
2. 보안 규칙 선택: "테스트 모드에서 시작" (개발용)
3. 위치 선택: `asia-northeast3 (서울)`

## 4. Firestore 보안 규칙 설정

### 4.1 기본 보안 규칙 (개발용)

Firestore Database → 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 모임 문서
    match /meetings/{meetingId} {
      allow read, write: if request.auth != null &&
        (resource.data.creatorId == request.auth.uid ||
         request.auth.uid in resource.data.participants);
    }

    // 메시지 문서
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/meetings/$(resource.data.meetingId)).data.participants;
    }

    // 채팅방 문서
    match /chatRooms/{roomId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }
  }
}
```

### 4.2 Storage 보안 규칙 (개발용)

Storage → 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat/{meetingId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    match /profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. 환경 변수 설정 (권장)

### 5.1 .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```env
FIREBASE_API_KEY=실제_API_키
FIREBASE_AUTH_DOMAIN=실제_도메인
FIREBASE_PROJECT_ID=실제_프로젝트_ID
FIREBASE_STORAGE_BUCKET=실제_스토리지_버킷
FIREBASE_MESSAGING_SENDER_ID=실제_발신자_ID
FIREBASE_APP_ID=실제_앱_ID
```

### 5.2 환경 변수 패키지 설치

```bash
npx expo install react-native-dotenv
```

### 5.3 babel.config.js 설정

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
```

### 5.4 firebase.ts 업데이트

```typescript
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};
```

## 6. 테스트 및 확인

### 6.1 앱 실행

```bash
npx expo start
```

### 6.2 Firebase Console에서 확인

- Authentication → 사용자: 로그인 시 사용자 목록 확인
- Firestore Database → 데이터: 모임/채팅 데이터 확인
- Storage → 파일: 업로드된 이미지 확인

## 7. 문제 해결

### 7.1 일반적인 오류

- **API 키 오류**: 설정 정보가 정확한지 확인
- **권한 오류**: 보안 규칙 확인
- **네트워크 오류**: 인터넷 연결 확인

### 7.2 디버깅

```typescript
// Firebase 초기화 확인
import { getApps } from "firebase/app";
console.log("Firebase apps:", getApps());

// 인증 상태 확인
import { auth } from "../config/firebase";
console.log("Current user:", auth.currentUser);
```

## 8. 프로덕션 배포 시 주의사항

### 8.1 보안 규칙 강화

- 테스트 모드에서 프로덕션 규칙으로 변경
- 더 엄격한 권한 설정

### 8.2 환경 변수 관리

- .env 파일을 .gitignore에 추가
- 프로덕션 환경에서 별도 설정

### 8.3 모니터링 설정

- Firebase Console → 성능 모니터링 활성화
- 오류 보고 설정

---

## 📝 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] 웹 앱 등록 및 설정 정보 복사
- [ ] config/firebase.ts 파일 업데이트
- [ ] Authentication 활성화 (이메일/비밀번호만)
- [ ] Firestore Database 활성화
- [ ] Storage 활성화
- [ ] 보안 규칙 설정
- [ ] 환경 변수 설정 (권장)
- [ ] 앱 테스트 실행
- [ ] 데이터베이스 연결 확인

이 가이드를 따라하면 MeetEasy 앱에서 Firebase를 완전히 사용할 수 있습니다!
