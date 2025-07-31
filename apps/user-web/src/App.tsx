import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoginForm } from '@naidp/ui';
import { authService, AuthUser } from './services/auth';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Navigation = styled.nav`
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
`;

const Logo = styled.h1`
  margin: 0;
  color: #007bff;
  font-size: 24px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #c82333;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const ProfileCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-weight: 500;
  color: #666;
  font-size: 14px;
`;

const Value = styled.span`
  color: #333;
`;

const StatusBadge = styled.span<{ verified: boolean }>`
  background: ${props => props.verified ? '#28a745' : '#ffc107'};
  color: ${props => props.verified ? 'white' : '#212529'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
`;

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <DashboardContainer>
      <Navigation>
        <NavContainer>
          <Logo>NAIDP</Logo>
          <UserInfo>
            <span>Welcome, {user.firstName}</span>
            <LogoutButton onClick={onLogout}>Logout</LogoutButton>
          </UserInfo>
        </NavContainer>
      </Navigation>
      
      <MainContent>
        <ProfileCard>
          <SectionTitle>Your Profile</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <Label>Full Name</Label>
              <Value>{user.fullName}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Email</Label>
              <Value>{user.email}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Email Status</Label>
              <StatusBadge verified={user.emailVerified}>
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </StatusBadge>
            </InfoItem>
            <InfoItem>
              <Label>Account ID</Label>
              <Value><code>{user.id}</code></Value>
            </InfoItem>
          </InfoGrid>
        </ProfileCard>

        <ProfileCard>
          <SectionTitle>Connected Applications</SectionTitle>
          <p style={{ color: '#666', margin: 0 }}>
            Applications that can access your account through NAIDP will appear here.
          </p>
        </ProfileCard>

        <ProfileCard>
          <SectionTitle>Security</SectionTitle>
          <p style={{ color: '#666', margin: 0 }}>
            Manage your password, two-factor authentication, and other security settings.
          </p>
        </ProfileCard>
      </MainContent>
    </DashboardContainer>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.verifyToken(token);
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <AppContainer>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </AppContainer>
    );
  }

  if (!user) {
    return (
      <AppContainer>
        <LoginForm 
          onSubmit={handleLogin}
          error={undefined}
        />
      </AppContainer>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;