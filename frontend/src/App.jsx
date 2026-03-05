import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import OrcamentoEditor from './pages/OrcamentoEditor'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
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
