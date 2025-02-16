import { BaseExtractor, ExtractorResult } from './_base';

export class ChatGPTExtractor extends BaseExtractor {
  private mainContent: Element | null = null;

  constructor(document: Document, url: string) {
    super(document, url);
    console.log('ChatGPTExtractor constructor called');
    
    // 대화 컨테이너 찾기
    const scrollContainer = document.querySelector('div[class*="react-scroll-to-bottom"]');
    console.log('Found scroll container:', !!scrollContainer);

    if (scrollContainer) {
      // 실제 대화 내용을 포함하는 컨테이너 찾기
      const conversationContainer = scrollContainer.querySelector('div[class*="flex flex-col"]');
      console.log('Found conversation container:', !!conversationContainer);

      if (conversationContainer) {
        // 대화 내용만 복사
        const container = document.createElement('div');
        container.innerHTML = conversationContainer.innerHTML;

        // 불필요한 요소 제거
        const elementsToRemove = container.querySelectorAll(
          'button, input, textarea, [role="button"], form, ' +
          'div[class*="bottom-0"], div[id*="warning"]'
        );
        elementsToRemove.forEach(el => el.remove());

        this.mainContent = container;
        console.log('Content container created');
      }
    }
  }

  canExtract(): boolean {
    const result = !!this.mainContent;
    console.log('canExtract called, result:', result);
    return result;
  }

  extract(): ExtractorResult {
    console.log('extract method called');
    if (!this.mainContent) {
      console.log('extract: mainContent is null');
      throw new Error('메인 콘텐츠를 찾을 수 없습니다.');
    }

    // 전체 HTML 내용 가져오기
    const content = this.mainContent.innerHTML;
    console.log('Extracted content length:', content.length);
    
    // 텍스트 내용 미리보기
    const textContent = this.mainContent.textContent || '';
    console.log('Text content preview:', textContent.substring(0, 200));

    return {
      content: content,
      contentHtml: content,
      extractedContent: {
        author: 'ChatGPT User',
        date: '',
        category: 'ChatGPT Conversation'
      },
      variables: {
        title: 'ChatGPT Conversation',
        author: 'ChatGPT User',
        site: 'ChatGPT',
        description: textContent.substring(0, 200)
      }
    };
  }
} 