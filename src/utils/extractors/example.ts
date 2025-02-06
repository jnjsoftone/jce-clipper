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
        date: this.getDate(),
      },
      variables: {
        title: this.getTitle(),
        author: this.getAuthor(),
        site: 'Example Site',
        description: this.getDescription(),
      },
    };
  }

  private extractContent(): string {
    if (!this.mainContent) return '';
    return this.mainContent.innerHTML;
  }

  private getTitle(): string {
    return this.document.querySelector('h1')?.textContent?.trim() || '';
  }

  private getAuthor(): string {
    return this.document.querySelector('.author')?.textContent?.trim() || '';
  }

  private getDate(): string {
    return this.document.querySelector('.date')?.textContent?.trim() || '';
  }

  private getDescription(): string {
    return this.document.querySelector('.description')?.textContent?.trim() || '';
  }

  // 기타 필요한 private 메서드들...
}
