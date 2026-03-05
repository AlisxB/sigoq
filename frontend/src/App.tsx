import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import OrcamentoEditor from './pages/OrcamentoEditor'

import Login from './pages/Login'

const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orcamento/:id" element={<OrcamentoEditor />} />
            <Route path="novo-orcamento" element={<OrcamentoEditor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
