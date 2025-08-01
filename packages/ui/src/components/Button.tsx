import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; size?: 'small' | 'medium' | 'large' }>`
  padding: ${props => 
    props.size === 'small' ? '8px 16px' :
    props.size === 'large' ? '16px 32px' :
    '12px 24px'
  };
  font-size: ${props => 
    props.size === 'small' ? '14px' :
    props.size === 'large' ? '18px' :
    '16px'
  };
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  background-color: ${props => 
    props.variant === 'primary' ? '#007bff' :
    props.variant === 'danger' ? '#dc3545' :
    '#6c757d'
  };
  
  color: white;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};