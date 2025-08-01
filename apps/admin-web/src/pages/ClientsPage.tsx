import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@naidp/ui';
import { clientService, Client } from '../services/api';

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

const TypeBadge = styled.span<{ type: string }>`
  background: ${props => 
    props.type === 'saml' ? '#007bff' :
    props.type === 'oidc' ? '#28a745' :
    '#fd7e14'
  };
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
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

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientService.getClients();
      setClients(response.clients);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Load clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await clientService.deleteClient(id);
      await loadClients();
    } catch (err) {
      setError('Failed to delete client');
      console.error('Delete client error:', err);
    }
  };

  const handleRotateSecret = async (id: string) => {
    if (!window.confirm('Are you sure you want to rotate the client secret?')) {
      return;
    }

    try {
      const response = await clientService.rotateSecret(id);
      alert(`New client secret: ${response.clientSecret}`);
      await loadClients();
    } catch (err) {
      setError('Failed to rotate client secret');
      console.error('Rotate secret error:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading clients...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Clients</Title>
        <Button variant="primary">Add Client</Button>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Client ID</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <Td>{client.name}</Td>
              <Td>
                <TypeBadge type={client.type}>{client.type}</TypeBadge>
              </Td>
              <Td><code>{client.clientId}</code></Td>
              <Td>
                <StatusBadge active={client.isActive}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </Td>
              <Td>{new Date(client.createdAt).toLocaleDateString()}</Td>
              <Td>
                <ActionButtons>
                  <Button size="small" variant="secondary">Edit</Button>
                  <Button 
                    size="small" 
                    variant="secondary"
                    onClick={() => handleRotateSecret(client.id)}
                  >
                    Rotate Secret
                  </Button>
                  <Button 
                    size="small" 
                    variant="danger"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    Delete
                  </Button>
                </ActionButtons>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {clients.length === 0 && !loading && (
        <LoadingMessage>No clients found. Click "Add Client" to create one.</LoadingMessage>
      )}
    </Container>
  );
};