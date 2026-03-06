import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import OrcamentoEditor from './pages/OrcamentoEditor'
import Orcamentos from './pages/Orcamentos'
import Login from './pages/Login'
import Clientes from './pages/Clientes'
import Fornecedores from './pages/Fornecedores'
import Materiais from './pages/Materiais'
import Categorias from './pages/Categorias'
import Kanban from './pages/Kanban'
import Metas from './pages/Metas'
import ConfiguracoesPreco from './pages/ConfiguracoesPreco'
import Usuarios from './pages/Usuarios'
import Error404 from './pages/Error404'
import AccessDenied from './pages/AccessDenied'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/403" element={<AccessDenied />} />
            <Route path="/404" element={<Error404 />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />

                {/* Engenharia / Orçamentos */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ORCAMENTISTA']} />}>
                  <Route path="orcamentos" element={<Orcamentos />} />
                  <Route path="orcamento/:id" element={<OrcamentoEditor />} />
                  <Route path="novo-orcamento" element={<OrcamentoEditor />} />
                  <Route path="materiais" element={<Materiais />} />
                  <Route path="categorias" element={<Categorias />} />
                </Route>

                {/* Comercial */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'VENDEDOR']} />}>
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="fornecedores" element={<Fornecedores />} />
                  <Route path="kanban" element={<Kanban />} />
                  <Route path="metas" element={<Metas />} />
                </Route>

                {/* Sistema / Admin */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="configuracoes" element={<ConfiguracoesPreco />} />
                  <Route path="usuarios" element={<Usuarios />} />
                </Route>

                {/* Fallback para rotas não encontradas no dashboard */}
                <Route path="*" element={<Error404 />} />
              </Route>
            </Route>

            {/* Redirecionar qualquer outra coisa para o 404 */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
