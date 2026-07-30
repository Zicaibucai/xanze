import React from 'react'
import ReactDOM from 'react-dom/client'
import { App as AntApp, ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import '@xanze/design-tokens/tokens.css'
import 'antd/dist/reset.css'
import './styles.css'
import { AuthProvider } from './auth'
import { XanzeRoutes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1f5a42',
          colorInfo: '#1f5a42',
          borderRadius: 12,
          colorBgLayout: '#f3f5f2',
          fontFamily:
            '"Inter", "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Button: { controlHeight: 42 },
          Input: { controlHeight: 42 },
          Select: { controlHeight: 42 },
          Table: { headerBg: '#f6f8f5' },
        },
      }}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <XanzeRoutes />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
)

