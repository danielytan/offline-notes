import styled, { keyframes } from 'styled-components';

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
  border-top-color: #555;
  border-radius: 50%;
  margin-top: 40px; /* Add some margin-top to move the spinner lower */
  animation: ${spinAnimation} 1s linear infinite;
`;

const LoadingSpinner = () => {
  return <SpinnerContainer />;
};

export default LoadingSpinner;