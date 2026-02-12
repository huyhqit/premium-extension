import { useState, useEffect } from 'react';

export default function App() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('enabled').then(({ enabled: stored = true }) => {
      setEnabled(stored);
      setLoaded(true);
    });
  }, []);

  const handleSave = async () => {
    await chrome.storage.sync.set({ enabled });
    setMessage('Options saved.');
    setTimeout(() => setMessage(''), 2000);
  };

  if (!loaded) return <div className="options">Loading…</div>;

  return (
    <div className="options">
      <h1>Options</h1>
      <section>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable extension
        </label>
      </section>
      <button type="button" onClick={handleSave}>
        Save
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
