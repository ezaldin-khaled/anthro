import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MouseProvider } from './contexts/MouseContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HeroLogos } from './components/HeroLogos'
import { Services } from './components/Services'
import { OurWork } from './components/OurWork'
import { AboutUs } from './components/AboutUs'
import { ContactUs } from './components/ContactUs'
import { Footer } from './components/Footer'
import { AdminLogin } from './components/AdminLogin.tsx'
import { AdminLayout } from './components/AdminLayout.tsx'
import { AdminDashboard } from './components/AdminDashboard.tsx'
import { AdminMessages } from './components/AdminMessages.tsx'
import { AdminMedia } from './components/AdminMedia.tsx'
import { TeamMemberPage } from './components/TeamMemberPage.tsx'

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <MouseProvider>
              <Header />
              <Hero />
              <HeroLogos />
              <Services />
              <AboutUs />
              <OurWork />
              <ContactUs />
              <Footer />
            </MouseProvider>
          }
        />
        <Route path="/team/:slug" element={<TeamMemberPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="media" element={<AdminMedia />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App;
