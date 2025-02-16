// 팝업의 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CAFE_CONTENT') {
    // iframe 내용 가져오기
    const mainFrame = document.querySelector('#down');
    if (mainFrame instanceof HTMLIFrameElement && mainFrame.contentDocument) {
      const content = mainFrame.contentDocument.documentElement.outerHTML;
      sendResponse({ content });
    } else {
      sendResponse({ error: 'iframe not found or not accessible' });
    }
    return true;
  }
}); 