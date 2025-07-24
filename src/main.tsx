import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 루트 엘리먼트 확인
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// React 18의 새로운 root API 사용
const root = ReactDOM.createRoot(rootElement)

// 앱 렌더링 (StrictMode 제거)
root.render(<App />) 