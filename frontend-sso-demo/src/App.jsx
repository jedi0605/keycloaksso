import { AuthProvider, useAuth } from './AuthContext'
import LoginButton from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import UserProfile from './components/UserProfile'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Initializing authentication...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Frontend SSO Demo</h1>
        <div className="auth-controls">
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
      </header>

      <main className="main-content">
        {isAuthenticated ? (
          <div className="authenticated-content">
            <h2>Welcome! You are authenticated.</h2>
            <UserProfile />
            
            <ProtectedRoute>
              <div className="protected-content">
                <h3>Protected Content</h3>
                <p>This content is only visible to authenticated users.</p>
                <p>You can add any protected functionality here.</p>
              </div>
            </ProtectedRoute>
          </div>
        ) : (
          <div className="unauthenticated-content">
            <h2>Please login to access the application</h2>
            <p>This demo shows Keycloak SSO integration with React.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
