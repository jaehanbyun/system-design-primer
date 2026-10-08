# System Design Primer 한국어 학습 사이트

[donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer)를 한국어로 옮기고, 원문의 학습 가이드(Study guide)를 중심으로 재구성한 [Astro Starlight](https://starlight.astro.build) 사이트입니다.

## 로컬에서 실행하기

Node.js 22.12 이상이 필요합니다.

```sh
cd site
nvm use          # .nvmrc (Node 22)
npm ci
npm run dev      # http://localhost:4321/system-design-primer/
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (검색은 빌드 후에만 동작) |
| `npm run build` | `dist/`에 정적 사이트 생성. 내부 링크와 앵커 검증이 함께 실행되어 깨진 링크가 있으면 실패합니다. |
| `npm run preview` | 빌드 결과 미리 보기 |
| `npm run check` | Astro/TypeScript 타입 검사 |

## 배포 (GitHub Pages)

`.github/workflows/deploy-site.yml`이 `master`에 푸시될 때 사이트를 빌드해 GitHub Pages에 배포합니다. 풀 리퀘스트에서는 빌드와 링크 검증만 실행합니다.

1. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
2. `master`에 푸시하거나 Actions 탭에서 워크플로를 수동 실행합니다.

사이트 주소와 base 경로는 `actions/configure-pages`가 알려 주는 값으로 정해지므로, 포크나 커스텀 도메인에서도 설정을 고칠 필요가 없습니다. 로컬 빌드는 `https://<owner>.github.io/<repo>/`를 기본값으로 씁니다.

## 구조

```
site/
├── astro.config.mjs          # 사이드바, 플러그인, markdown 설정
├── plugins/base-links.mjs    # 본문의 /topics/... 링크에 base 경로를 붙이는 rehype 플러그인
├── public/                   # favicon, OG 이미지
└── src/
    ├── content/docs/         # 페이지 (Markdown/MDX)
    ├── content/i18n/ko.json  # Starlight UI 문구 재정의
    ├── components/           # 학습 플랜, 계산기, 플래시카드 등
    │   └── overrides/        # Starlight Hero/PageTitle/Footer 재정의
    ├── data/                 # plans.ts(학습 플랜), flashcards.ts, topics.ts, problems.ts
    ├── routeData.ts          # 사이드바 라벨에서 영어 병기 제거
    ├── utils/                # base 경로 링크, 읽기 시간, 플랜 항목 해석
    ├── scripts/progress.ts   # 학습 진행 상황(localStorage)
    └── styles/theme.css
```

원문 이미지와 객체 지향 설계 해설 코드는 복사하지 않고 저장소 루트에서 직접 불러옵니다(`@repo/images/...`, `@repo/solutions/...py?raw`). 원문 파일이 바뀌면 사이트에도 그대로 반영됩니다.

## 콘텐츠 작성 규칙

자세한 규칙(용어집, 페이지 구조, 앵커 목록)은 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)를 참고하세요. 요약하면 다음과 같습니다.

- frontmatter에 `title`, `description`, 원문 위치 `original`을 씁니다.
- 내부 링크는 루트 기준에 끝 슬래시를 붙입니다: `/topics/cache/`. base 경로는 빌드 때 자동으로 붙습니다.
- 학습 플랜 항목은 `src/data/plans.ts`, 플래시카드는 `src/data/flashcards.ts`에서 관리합니다. 플랜이 존재하지 않는 페이지를 가리키면 빌드가 실패합니다.
- `**강조(English)**는`처럼 괄호 뒤에 조사가 붙어도 굵게 표시되도록 `remark-cjk-friendly`를 씁니다.

## 라이선스

원문과 이 사이트의 번역·재구성은 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)을 따릅니다. 원저작자: Donne Martin.
