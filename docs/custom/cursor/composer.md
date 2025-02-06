```prompt
@Codebase 의 코드를 잘 살펴보고, 프로젝트의 기능과 사용법(extrator 추가를 중심으로)을 구체적인 예를 들어 설명해주세요.
```

이 프로젝트는 Obsidian Web Clipper의 포크 버전으로, 웹 페이지의 콘텐츠를 Obsidian으로 저장하는 브라우저 확장 프로그램입니다. 주요 기능과 사용법을 설명드리겠습니다.

# 1. 주요 기능

1. **웹 페이지 추출**
- 전체 페이지 또는 선택한 부분을 Markdown으로 변환
- 하이라이트 기능으로 원하는 텍스트 부분만 선택 가능
- 이미지, 링크 등의 미디어 요소도 함께 저장

2. **사이트별 전용 추출기(Extractor)**
- Twitter, Reddit, YouTube 등 주요 사이트별 맞춤형 추출 로직 제공
- 사이트의 특성에 맞는 콘텐츠 구조화 (예: 트윗 스레드, 댓글 등)

3. **템플릿 시스템**
- 저장된 콘텐츠의 형식을 사용자가 커스터마이징 가능
- 변수 시스템으로 동적 콘텐츠 생성

# 2. Extractor 추가 방법

새로운 사이트용 Extractor를 추가하는 방법을 설명하겠습니다.

## 2.1. 기본 구조 생성

```typescript:src/utils/extractors/example.ts
import { BaseExtractor, ExtractorResult } from './_base';

export class ExampleExtractor extends BaseExtractor {
  private mainContent: Element | null = null;

  constructor(document: Document, url: string) {
    super(document, url);
    this.mainContent = document.querySelector('.main-content');
  }

  canExtract(): boolean {
    return !!this.mainContent;
  }

  extract(): ExtractorResult {
    const content = this.extractContent();
    
    return {
      content: content,
      contentHtml: content,
      extractedContent: {
        // 사이트 특정 메타데이터
        author: this.getAuthor(),
        date: this.getDate()
      },
      variables: {
        title: this.getTitle(),
        author: this.getAuthor(),
        site: 'Example Site',
        description: this.getDescription()
      }
    };
  }

  private getTitle(): string {
    return this.document.querySelector('h1')?.textContent?.trim() || '';
  }

  // 기타 필요한 private 메서드들...
}
```

## 2.2. ExtractorRegistry에 등록

```typescript:src/utils/extractor-registry.ts
import { ExampleExtractor } from './extractors/example';

export class ExtractorRegistry {
  static initialize() {
    // 기존 등록된 extractors...

    this.register({
      patterns: [
        'example.com',
        'www.example.com',
        /example\.com\/.*/
      ],
      extractor: ExampleExtractor
    });
  }
}
```

## 2.3. 실제 예시: Twitter Extractor

Twitter Extractor의 주요 기능을 살펴보겠습니다:

```typescript
export class TwitterExtractor extends BaseExtractor {
  private mainTweet: Element | null = null;
  private threadTweets: Element[] = [];

  constructor(document: Document, url: string) {
    super(document, url);
    
    // 트윗 타임라인에서 주요 트윗과 스레드 트윗 추출
    const timeline = document.querySelector('[aria-label="Timeline: Conversation"]');
    if (timeline) {
      const allTweets = Array.from(timeline.querySelectorAll('article[data-testid="tweet"]'));
      this.mainTweet = allTweets[0] || null;
      this.threadTweets = allTweets.slice(1);
    }
  }

  extract(): ExtractorResult {
    // 메인 트윗과 스레드 트윗을 HTML로 변환
    const mainContent = this.extractTweet(this.mainTweet);
    const threadContent = this.threadTweets.map(tweet => 
      this.extractTweet(tweet)).join('\n<hr>\n');

    // 구조화된 HTML 생성
    const contentHtml = `
      <div class="tweet-thread">
        <div class="main-tweet">${mainContent}</div>
        ${threadContent ? `
          <hr>
          <div class="thread-tweets">${threadContent}</div>
        ` : ''}
      </div>
    `.trim();

    return {
      content: contentHtml,
      contentHtml: contentHtml,
      extractedContent: {
        tweetId: this.getTweetId(),
        tweetAuthor: this.getTweetAuthor(),
      },
      variables: {
        title: `Thread by ${this.getTweetAuthor()}`,
        author: this.getTweetAuthor(),
        site: 'X (Twitter)',
        description: this.createDescription(this.mainTweet),
      }
    };
  }
}
```

# 3. 사용 방법

1. **설치 및 빌드**
```bash
npm install
npm run build
```

2. **브라우저에 로드**
- Chrome: `chrome://extensions` → 개발자 모드 → '압축해제된 확장 프로그램을 로드합니다' → `dist` 디렉토리 선택
- Firefox: `about:debugging` → '임시 확장기능 로드' → `dist_firefox/manifest.json` 선택

3. **사용**
- 웹 페이지에서 확장 프로그램 아이콘 클릭
- 원하는 콘텐츠 하이라이트
- 템플릿 선택 후 Obsidian으로 저장

이 프로젝트는 모듈화된 구조로 되어 있어 새로운 사이트용 Extractor를 쉽게 추가할 수 있으며, 각 사이트의 특성에 맞는 최적화된 콘텐츠 추출이 가능합니다.



---

```prompt
@.editorconfig 파일은 어떤 기능을 하나요?
```



아니요, `.editorconfig`, `.vscode/settings.json`, `prettier` 설정은 각각 다른 목적과 역할이 있어서 함께 사용하는 것이 좋습니다.

1. **`.editorconfig`**
   - 에디터에 상관없이 기본적인 코드 스타일 (들여쓰기, 줄바꿈 등) 통일
   - 낮은 수준의 포맷팅만 제어 가능
   - 모든 에디터에서 공통으로 적용되는 기본 규칙 설정

2. **`.vscode/settings.json`**
   - VS Code 전용 설정
   - 에디터의 동작, 확장 기능, 테마 등 VS Code 관련 상세 설정
   - 프로젝트별 VS Code 설정 관리
   - 예: 자동 저장, 파일 관련 설정, 확장 프로그램 설정 등

3. **`prettier`**
   - 더 세밀한 코드 포맷팅 규칙 적용
   - JavaScript/TypeScript 코드의 상세한 스타일링
   - 복잡한 코드 구조의 자동 포맷팅
   - 예시 규칙:
   ```json
   {
     "printWidth": 100,
     "semi": true,
     "singleQuote": true,
     "trailingComma": "all",
     "bracketSpacing": true,
     "arrowParens": "avoid"
   }
   ```

**권장하는 사용 방식**:

1. 세 가지 설정을 함께 사용하되, 각각의 역할을 명확히 구분
   - `.editorconfig`: 기본적인 에디터 설정
   - `.vscode/settings.json`: VS Code 관련 설정
   - `prettier`: 상세한 코드 포맷팅 규칙

2. 설정 간 충돌을 피하기 위한 우선순위 설정
   ```json
   // .vscode/settings.json
   {
   "editor.formatOnSave": true,
   "editor.defaultFormatter": "esbenp.prettier-vscode",
   "prettier.configPath": ".prettierrc",
   "editor.codeActionsOnSave": {
     "source.fixAll.eslint": true
   }
   }
   ```

3. ESLint와의 통합
   ```json
   // .eslintrc.json
   {
   "extends": [
     "prettier"
   ],
   "plugins": [
     "prettier"
   ],
   "rules": {
     "prettier/prettier": "error"
   }
   }
   ```

이렇게 함께 사용하면 각각의 도구가 가진 장점을 최대한 활용할 수 있으며, 더 완벽한 코드 스타일 관리가 가능합니다.
