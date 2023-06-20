import styled, { keyframes } from 'styled-components';

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const SpinnerContainer = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
  border-top-color: #555;
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`;

export const LoadingSpinner = () => {
  return <SpinnerContainer />;
};