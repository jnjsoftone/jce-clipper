import { BaseExtractor, ExtractorResult } from './_base';

export class DaumCafeExtractor extends BaseExtractor {
  private mainContent: Element | null = null;

  constructor(document: Document, url: string) {
    super(document, url);
    console.log('Original URL:', url);
    
    const mainFrame = document.querySelector('#down') as HTMLIFrameElement;
    if (mainFrame?.src) {
      const iframeUrl = mainFrame.src;
      console.log('iframe URL:', iframeUrl);
      
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', iframeUrl, false);
        xhr.setRequestHeader('Accept', 'text/html');
        xhr.send();
        
        if (xhr.status === 200) {
          console.log('Received cafe content');
          const parser = new DOMParser();
          const doc = parser.parseFromString(xhr.responseText, 'text/html');
          
          // 본문 컨테이너 찾기
          const articleContainer = doc.querySelector('.article_container');
          if (articleContainer) {
            // 본문 내용 찾기
            const articleView = articleContainer.querySelector('.article_view');
            if (articleView) {
              // 실제 본문 내용만 추출
              const contentElements = Array.from(articleView.children).filter(el => {
                // 본문과 관련없는 요소 제외
                return !el.classList.contains('article_header') && 
                       !el.classList.contains('article_footer') &&
                       !el.classList.contains('article_menu');
              });
              
              if (contentElements.length > 0) {
                const tempDiv = document.createElement('div');
                contentElements.forEach(el => tempDiv.appendChild(el.cloneNode(true)));
                this.mainContent = tempDiv;
                console.log('Found content in article_view');
              }
            }
          }
          
          // 백업: meta description에서 내용 가져오기
          if (!this.mainContent?.textContent?.trim()) {
            const metaDescription = doc.querySelector('meta[property="og:description"]');
            if (metaDescription) {
              const content = metaDescription.getAttribute('content');
              if (content) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                this.mainContent = tempDiv;
                console.log('Found content in meta description');
              }
            }
          }
          
          console.log('Found content:', !!this.mainContent);
          if (this.mainContent) {
            console.log('Content preview:', this.mainContent.textContent?.trim().substring(0, 100));
            console.log('Full content length:', this.mainContent.textContent?.length);
          }
        } else {
          console.error('Failed to fetch cafe content:', xhr.status);
        }
      } catch (e) {
        console.error('Error fetching cafe content:', e);
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
        site: 'Daum Cafe',
        description: this.getDescription()
      }
    };
  }

  private getTitle(): string {
    return document.querySelector('.tit_subject')?.textContent?.trim() || 
           document.querySelector('.title_subject')?.textContent?.trim() || '';
  }

  private getAuthor(): string {
    return document.querySelector('.txt_info')?.textContent?.trim() || 
           document.querySelector('.nick_name')?.textContent?.trim() || '';
  }

  private getDate(): string {
    return document.querySelector('.time')?.textContent?.trim() || 
           document.querySelector('.date')?.textContent?.trim() || '';
  }

  private getCategory(): string {
    return document.querySelector('.cafe_name')?.textContent?.trim() || '';
  }

  private getDescription(): string {
    if (!this.mainContent) return '';
    return this.mainContent.textContent?.trim()?.substring(0, 200) || '';
  }

  private extractContent(): string {
    if (!this.mainContent) return '';

    // 이미지 처리
    const images = Array.from(this.mainContent.querySelectorAll('img'));
    images.forEach(img => {
      if (img.src) {
        img.src = new URL(img.src, this.url).href;
      }
    });

    // 불필요한 스크립트 제거
    const scripts = Array.from(this.mainContent.querySelectorAll('script'));
    scripts.forEach(script => script.remove());

    return this.mainContent.innerHTML;
  }
}
