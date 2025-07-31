import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@naidp/ui';
import { userService, User } from '../services/api';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  background: ${props => props.active ? '#28a745' : '#dc3545'};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const VerifiedBadge = styled.span<{ verified: boolean }>`
  background: ${props => props.verified ? '#28a745' : '#ffc107'};
  color: ${props => props.verified ? 'white' : '#212529'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      setUsers(response.users);
    } catch (err) {
      setError('Failed to load users');
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      await loadUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error('Delete user error:', err);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.updateUser(user.id, { isActive: !user.isActive });
      await loadUsers();
    } catch (err) {
      setError('Failed to update user status');
      console.error('Update user error:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading users...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Users</Title>
        <Button variant="primary">Add User</Button>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th>Email Verified</Th>
            <Th>Last Login</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <Td>{user.fullName}</Td>
              <Td>{user.email}</Td>
              <Td>
                <StatusBadge active={user.isActive}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </Td>
              <Td>
                <VerifiedBadge verified={user.emailVerified}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </VerifiedBadge>
              </Td>
              <Td>
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleDateString()
                  : 'Never'
                }
              </Td>
              <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
              <Td>
                <ActionButtons>
                  <Button size="small" variant="secondary">Edit</Button>
                  <Button 
                    size="small" 
                    variant={user.isActive ? 'secondary' : 'primary'}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    size="small" 
                    variant="danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </ActionButtons>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {users.length === 0 && !loading && (
        <LoadingMessage>No users found. Click "Add User" to create one.</LoadingMessage>
      )}
    </Container>
  );
};