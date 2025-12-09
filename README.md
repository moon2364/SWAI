# IntervMate (AI 모의면접 플랫폼)

## 📖 프로젝트 소개
**IntervMate**는 사용자가 실제 면접 환경과 유사한 분위기에서 AI 면접관과 대화하며 면접 실력을 키울 수 있는 **AI 기반 모의면접 서비스**입니다.

단순한 질문-답변 연습을 넘어, AI가 사용자의 답변 내용을 분석하여 꼬리물기 질문을 던지고, 면접 중의 시선 처리, 표정, 말하기 속도 등을 실시간으로 분석하여 피드백을 제공합니다.

### ✨ 주요 기능
- **AI 면접관**: 중립(Neutral), 압박(Strict), 친근(Friendly) 등 다양한 성향의 면접관을 선택하여 연습할 수 있습니다.
- **맞춤형 질문**: 지원 직무와 자기소개서를 기반으로 AI가 실제 면접처럼 꼬리물기 질문을 생성합니다.
- **실시간 피드백**: 면접 진행 중 조명 밝기와 말하기 속도를 실시간으로 분석하여 화면에 피드백을 제공합니다.
- **음성 대화**: STT(Speech-to-Text) 및 TTS(Text-to-Speech) 기술을 활용하여 실제 사람과 대화하듯 음성으로 면접을 진행합니다.
- **면접 분석**: 면접이 끝난 후 답변 내용과 태도에 대한 종합적인 피드백을 제공합니다.

---

## 🛠 기술 스택
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS, jQuery)
- **Backend**: Google Apps Script (Serverless)
- **AI**: OpenAI GPT-4o-mini (Chat), OpenAI TTS (Voice)
- **Database**: Google Sheets (데이터 저장용)

---

## 🚀 로컬 실행 방법 (How to Run Locally)

이 프로젝트는 **Frontend(HTML/JS)** 와 **Backend(Google Apps Script)** 로 나뉘어 있습니다.
정상적인 실행을 위해서는 **Backend를 먼저 배포**하고, 그 URL을 **Frontend 코드에 연결**해야 합니다.

### 1. 프로젝트 클론 (Clone)
터미널(Git Bash, PowerShell, CMD 등)을 열고 아래 명령어를 입력하여 프로젝트를 내려받습니다.
```bash
git clone [<레포지토리 주소>](https://github.com/moon2364/SWAI)
cd SWAI
```

### 2. Backend 설정 (Google Apps Script)
이 프로젝트는 별도의 서버 구축 없이 Google Apps Script를 백엔드로 사용합니다. 직접 배포하여 본인의 환경에서 테스트할 수 있습니다.

1.  **Google Apps Script 프로젝트 생성**
    *   [Google Apps Script](https://script.google.com/)에 접속하여 `새 프로젝트`를 생성합니다.
    *   프로젝트 이름을 `IntervMate Backend` 등으로 설정합니다.

2.  **코드 복사 및 붙여넣기**
    *   로컬 프로젝트 폴더 내의 `appscript.js` 파일 내용을 전체 복사합니다.
    *   Google Apps Script 에디터의 `Code.gs` 파일 내용을 모두 지우고, 복사한 코드를 붙여넣습니다.
    *   `Ctrl + S` (또는 `Cmd + S`)를 눌러 저장합니다.

3.  **OpenAI API Key 설정**
    *   좌측 메뉴에서 **⚙️ 프로젝트 설정 (Project Settings)** 아이콘을 클릭합니다.
    *   스크롤을 내려 **스크립트 속성 (Script Properties)** 섹션을 찾습니다.
    *   `스크립트 속성 추가` 버튼을 클릭합니다.
    *   **속성 (Property)**: `OPENAI_API_KEY`
    *   **값 (Value)**: (별도로 전달받은 OpenAI API Key를 입력하세요)
    *   `스크립트 속성 저장`을 클릭합니다.

4.  **웹 앱으로 배포 (Deploy)**
    *   우측 상단의 **배포 (Deploy)** 버튼 -> **새 배포 (New deployment)** 를 클릭합니다.
    *   **유형 선택 (Select type)** 톱니바퀴 아이콘 -> **웹 앱 (Web app)** 을 선택합니다.
    *   설정 내용을 다음과 같이 입력합니다:
        *   **설명 (Description)**: (예: v1 배포)
        *   **다음 사용자 계정으로 실행 (Execute as)**: `나(Me)`
        *   **액세스 권한이 있는 사용자 (Who has access)**: `모든 사용자 (Anyone)` **(중요!)**
    *   **배포 (Deploy)** 버튼을 클릭합니다.
    *   (처음 배포 시) **액세스 승인 (Authorize access)** 창이 뜨면 권한을 허용해줍니다.
    *   배포가 완료되면 **웹 앱 URL (Web app URL)** 을 복사합니다. ( `https://script.google.com/...exec` 형식)

### 3. Frontend 연결 및 실행

1.  **URL 연결**
    *   VS Code 등 에디터에서 `index.html` 파일을 엽니다.
    *   **459번째 줄** 근처의 `addrScript` 변수를 찾습니다.
    *   기존 URL을 지우고, 방금 복사한 **나만의 웹 앱 URL**을 붙여넣습니다.
    ```javascript
    // index.html (약 459 line)
    addrScript = 'https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec';
    ```
    *   파일을 저장합니다.

2.  **로컬 서버 실행**
    브라우저의 보안 정책(CORS, 카메라/마이크 권한 등)으로 인해 `index.html` 파일을 더블 클릭해서 열면 작동하지 않습니다. 반드시 **로컬 웹 서버**를 통해 실행해주세요.

    **방법 A: VS Code Live Server 확장 프로그램 사용 (권장)**
    1.  Visual Studio Code에서 확장 프로그램 마켓플레이스(Ctrl+Shift+X)로 이동해 `Live Server`를 설치합니다.
    2.  `index.html` 파일에서 마우스 우클릭 후 `Open with Live Server`를 선택합니다.

    **방법 B: Python 사용**
    Python이 설치되어 있다면 터미널에서 아래 명령어를 실행합니다.
    ```bash
    # Python 3.x
    python -m http.server 8000
    ```
    실행 후 브라우저 주소창에 `http://localhost:8000`을 입력하여 접속합니다.

    **방법 C: Node.js (npx) 사용**
    Node.js가 설치되어 있다면 아래 명령어를 실행합니다.
    ```bash
    npx serve .
    ```

### 4. 실행 확인 (Demo)
1.  브라우저에서 페이지가 열리면 **카메라 및 마이크 권한**을 허용해주세요.
2.  **Live Demo** 섹션으로 스크롤을 내립니다.
3.  **지원 직무**와 **자기소개**를 간단히 입력합니다.
4.  원하는 **면접관 성향(Persona)** 을 선택합니다.
5.  `Start Interview` 버튼을 눌러 면접을 시작합니다.
6.  AI 면접관이 인사를 건네면, 마이크를 통해 답변을 해보세요!

---

## 📂 파일 구조
```
SWAI/
├── assets/             # 이미지, CSS, JS 등 정적 리소스
├── vendor/             # 외부 라이브러리 (Bootstrap, jQuery 등)
├── index.html          # 메인 페이지 (Frontend)
├── appscript.js        # Google Apps Script 코드 (Backend - 로컬 실행 X)
└── README.md           # 프로젝트 설명 파일
```

## ⚠️ 주의사항
- **API Key 보안**: `appscript.js` 파일이나 `index.html` 파일에 OpenAI API Key를 직접 하드코딩하지 마세요. 반드시 Google Apps Script의 **스크립트 속성** 기능을 사용해야 안전합니다.
- **브라우저 호환성**: 최신 Chrome, Edge, Safari 브라우저 사용을 권장합니다. (Internet Explorer는 지원하지 않습니다.)
