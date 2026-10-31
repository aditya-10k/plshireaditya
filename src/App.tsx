import React, { useEffect } from 'react';
import { ChatPage } from './pages/ChatPage';

export const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#202124] text-slate-100 overflow-x-hidden font-sans">
      <ChatPage />
    </div>
  );
};

export default App;
