import styled from 'styled-components';
import theme from './theme';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

export const Heading = styled.h1`
  font-size: 24px;
  color: ${theme.colors.primary};
  margin-bottom: 20px;
`;

export const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0050cc;
  }
`;