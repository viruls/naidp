import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ClientsPage } from './pages/ClientsPage';
import { UsersPage } from './pages/UsersPage';

const AppContainer = styled.div`
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

const NavLinks = styled.div`
  display: flex;
  gap: 32px;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #007bff;
  }

  &.active {
    color: #007bff;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to the NAIDP Admin Portal</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Quick Actions</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '12px' }}>
              <Link to="/clients" style={{ color: '#007bff', textDecoration: 'none' }}>
                Manage Clients
              </Link>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <Link to="/users" style={{ color: '#007bff', textDecoration: 'none' }}>
                Manage Users
              </Link>
            </li>
          </ul>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>System Status</h3>
          <p style={{ color: '#666', margin: 0 }}>All services are running normally</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Navigation>
          <NavContainer>
            <Logo>NAIDP Admin</Logo>
            <NavLinks>
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/clients">Clients</NavLink>
              <NavLink to="/users">Users</NavLink>
            </NavLinks>
          </NavContainer>
        </Navigation>
        
        <MainContent>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App;