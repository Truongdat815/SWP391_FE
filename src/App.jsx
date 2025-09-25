import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './index.css'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-500">
        Hello TailwindCSS 🎉
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Nếu thấy chữ này màu xanh và căn giữa thì Tailwind đã chạy!
      </p>
    </div>
  );
}

export default App;
