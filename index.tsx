import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // css 파일이 없으면 이 줄은 지워도 됩니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)