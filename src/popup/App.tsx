import { useState } from 'react';

interface SwapResult {
  ok: boolean;
  siteId: string | null;
  message: string;
  replacedCount?: number;
}

export default function App() {
  const [status, setStatus] = useState('');
  const [swapMessage, setSwapMessage] = useState('');

  const handleSwapLogo = async () => {
    setSwapMessage('');
    setStatus('Đang xử lý…');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus('');
        setSwapMessage('Không có tab nào được chọn.');
        return;
      }
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'SWAP_LOGO' }) as SwapResult;
      setStatus('');
      setSwapMessage(response?.message ?? 'Xong.');
    } catch (e) {
      setStatus('');
      const msg = e instanceof Error ? e.message : String(e);
      setSwapMessage(msg.includes('Receiving end does not exist') ? 'Hãy tải lại trang web rồi thử lại.' : 'Lỗi: ' + msg);
    }
  };

  const openOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="popup">
      <header className="popup-header">
        <h1>Premium Extension</h1>
      </header>
      <main className="popup-body">
        <p className="popup-status">{status}</p>
        {swapMessage && <p className="popup-message">{swapMessage}</p>}
        <button type="button" className="popup-btn popup-btn-primary" onClick={handleSwapLogo}>
          Đổi logo Premium
        </button>
      </main>
      <footer className="popup-footer">
        <a href="#" onClick={openOptions}>
          Options
        </a>
      </footer>
    </div>
  );
}
