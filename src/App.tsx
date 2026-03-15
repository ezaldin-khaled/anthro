import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { MouseProvider } from './contexts/MouseContext'
import { ScrollRestore } from './components/ScrollRestore'
import { PageTransition } from './components/PageTransition'
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
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function RedirectIfAdmin() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/admin" replace />
  return <AdminLogin />
}

function App() {
  return (
    <AuthProvider>
      <ScrollRestore />
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
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
            </PageTransition>
          }
        />
        <Route
          path="/team/:slug"
          element={
            <PageTransition>
              <Header />
              <TeamMemberPage />
              <Footer />
            </PageTransition>
          }
        />
        <Route
          path="/admin/login"
          element={
            <PageTransition>
              <RedirectIfAdmin />
            </PageTransition>
          }
        />
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
