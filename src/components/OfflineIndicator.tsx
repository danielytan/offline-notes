import { useEffect, useState } from 'react';
import styled from 'styled-components';

const OfflineContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  margin: 0.5rem;
  display: flex;
  align-items: center;
`;

const OfflineText = styled.p`
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: #888;
`;

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };

    // Check if the navigator object is available (client-side)
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnlineStatusChange);
      window.addEventListener('offline', handleOnlineStatusChange);
    }

    return () => {
      // Clean up event listeners
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  if (!isOffline) {
    return null; // Don't render anything if online
  }

  return (
    <OfflineContainer>
      <svg width="12" height="12" viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="5" fill="#FF4136" />
      </svg>
      <OfflineText>You are offline</OfflineText>
    </OfflineContainer>
  );
};

export default OfflineIndicator;