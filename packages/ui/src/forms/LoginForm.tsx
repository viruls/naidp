import React, { useState } from 'react';
import styled from 'styled-components';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const FormWrapper = styled.form`
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  color: #333;
`;

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <Title>Sign In</Title>
      
      {error && (
        <div style={{ color: '#dc3545', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <Button
        type="submit"
        variant="primary"
        size="large"
        disabled={isLoading}
        style={{ width: '100%' }}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </FormWrapper>
  );
};