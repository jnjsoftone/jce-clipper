import { BaseExtractor, ExtractorResult } from './_base';

export class NaverBlogExtractor extends BaseExtractor {
  private mainContent: Element | null = null;

  constructor(document: Document, url: string) {
    super(document, url);
    console.log('Original URL:', url);
    
    // iframe의 src URL 가져오기
    const mainFrame = document.querySelector('#mainFrame') as HTMLIFrameElement;
    if (mainFrame?.src) {
      const iframeUrl = mainFrame.src;
      console.log('iframe URL:', iframeUrl);
      
      try {
        // 동기식 XMLHttpRequest로 iframe 페이지 가져오기
        const xhr = new XMLHttpRequest();
        xhr.open('GET', iframeUrl, false); // 동기식 요청
        xhr.setRequestHeader('Accept', 'text/html');
        xhr.send();
        
        if (xhr.status === 200) {
          console.log('Received blog content');
          const parser = new DOMParser();
          const doc = parser.parseFromString(xhr.responseText, 'text/html');
          
          this.mainContent = doc.querySelector('.se-main-container') || 
                            doc.querySelector('#post_content') ||
                            doc.querySelector('.post-content');
          
          console.log('Found content:', !!this.mainContent);
        } else {
          console.error('Failed to fetch blog content:', xhr.status);
        }
      } catch (e) {
        console.error('Error fetching blog content:', e);
      }
    } else {
      console.error('No iframe or src found');
    }
  }

  canExtract(): boolean {
    const result = !!this.mainContent;
    console.log('canExtract:', result);
    return result;
  }

  extract(): ExtractorResult {
    if (!this.mainContent) {
      throw new Error('메인 콘텐츠를 찾을 수 없습니다.');
    }

    const content = this.extractContent();
    console.log('Extracted content:', content.substring(0, 100) + '...');
    
    return {
      content: content,
      contentHtml: content,
      extractedContent: {
        author: this.getAuthor(),
        date: this.getDate(),
        category: this.getCategory()
      },
      variables: {
        title: this.getTitle(),
        author: this.getAuthor(),
        site: 'Naver Blog',
        description: this.getDescription()
      }
    };
  }

  private getTitle(): string {
    return this.mainContent?.querySelector('.se-title-text')?.textContent?.trim() || '';
  }

  private getAuthor(): string {
    return this.mainContent?.querySelector('.blog-name')?.textContent?.trim() || '';
  }

  private getDate(): string {
    return this.mainContent?.querySelector('.se_publishDate')?.textContent?.trim() || '';
  }

  private getCategory(): string {
    return this.mainContent?.querySelector('.category')?.textContent?.trim() || '';
  }

  private getDescription(): string {
    // 첫 번째 문단이나 적절한 요약 텍스트를 찾아 반환
    return this.mainContent?.querySelector('.se-main-container p')?.textContent?.trim() || '';
  }

  private extractContent(): string {
    if (!this.mainContent) return '';

    // 이미지 처리
    const images = Array.from(this.mainContent.querySelectorAll('img'));
    images.forEach(img => {
      // 이미지 소스 절대 경로로 변환
      if (img.src) {
        img.src = new URL(img.src, this.url).href;
      }
    });

    // 본문 내용 추출
    return this.mainContent.innerHTML;
  }
} 