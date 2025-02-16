import { BaseExtractor, ExtractorResult } from './_base';

export class GenSparkExtractor extends BaseExtractor {
  private mainContent: Element | null = null;

  constructor(document: Document, url: string) {
    super(document, url);
    console.log('GenSparkExtractor constructor called');
    
    // 메인 컨테이너 찾기 (여러 선택자 시도)
    this.mainContent = 
      document.querySelector('div[data-v-d6aa716d]') ||
      document.querySelector('div[class*="agent-page"]') ||
      document.querySelector('div[class*="flex flex-col"]');

    console.log('Found main content:', !!this.mainContent);
    
    // 페이지가 완전히 로드될 때까지 대기
    if (document.readyState !== 'complete') {
      document.addEventListener('load', () => {
        this.findContent(document);
      });
    }
  }

  private findContent(document: Document) {
    // 메인 컨테이너 다시 찾기
    this.mainContent = 
      document.querySelector('div[data-v-d6aa716d]') ||
      document.querySelector('div[class*="agent-page"]') ||
      document.querySelector('div[class*="flex flex-col"]');
    
    console.log('Found main content after load:', !!this.mainContent);
  }

  canExtract(): boolean {
    return !!this.mainContent && this.url.includes('genspark.ai');
  }

  extract(): ExtractorResult {
    if (!this.mainContent) {
      throw new Error('메인 콘텐츠를 찾을 수 없습니다.');
    }

    // 이미지 찾기 (여러 선택자 시도)
    const images = Array.from(document.querySelectorAll('img')).filter(img => {
      const src = img.getAttribute('src');
      return src && (
        src.includes('genspark') || 
        img.closest('.n-image-container') || 
        img.closest('.n-image')
      );
    });

    console.log('Found images:', images.length);

    // 이미지 HTML 생성
    const imageHtml = images.map(img => {
      const imgSrc = new URL(img.getAttribute('src') || '', this.url).href;
      return `<div class="image-container" style="margin: 10px 0;">
        <img src="${imgSrc}" alt="Generated Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      </div>`;
    }).join('\n');

    // 프롬프트 텍스트 찾기 (여러 선택자 시도)
    const textarea = document.querySelector('textarea[name="query"]') as HTMLTextAreaElement;
    const searchInput = document.querySelector('div[class*="search-input"]');
    const inputTextarea = document.querySelector('div[class*="input"] textarea');
    
    let promptText = '프롬프트를 찾을 수 없습니다.';
    if (textarea?.value) promptText = textarea.value;
    else if (searchInput?.textContent) promptText = searchInput.textContent.trim();
    else if (inputTextarea?.textContent) promptText = inputTextarea.textContent.trim();

    console.log('Found prompt:', promptText);

    // HTML 컨텐츠 생성
    const content = `
      <div class="genspark-content" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
        <div class="prompt" style="margin-bottom: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
          <strong style="display: block; margin-bottom: 12px; color: #212529; font-size: 16px;">Prompt:</strong>
          <p style="margin: 0; color: #495057; line-height: 1.5;">${promptText}</p>
        </div>
        <div class="generated-images" style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
          ${imageHtml}
        </div>
      </div>
    `;

    return {
      content: content,
      contentHtml: content,
      extractedContent: {
        author: 'GenSpark User',
        date: new Date().toISOString(),
        category: 'AI Generated Images'
      },
      variables: {
        title: 'GenSpark Generated Images',
        author: 'GenSpark User',
        site: 'GenSpark',
        description: `Generated images for prompt: ${promptText.substring(0, 100)}`
      }
    };
  }
} 