import React from 'react';
import {Chat, Sidebar} from './components';

function App() {
  return (
    <div className="flex sm:flex-row flex-col w-full min-h-screen dark:bg-[#12151c]">
      <Sidebar />
      <Chat />
    </div>
  );
}

export default App;
