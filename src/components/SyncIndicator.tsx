import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

const SyncIndicatorContainer = styled.div`
  position: absolute;
  top: 50%;
  right: -36px;
  transform: translate(0, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #888;
  color: #fff;
`;

const SyncIndicator = () => {
  return <SyncIndicatorContainer><FontAwesomeIcon icon={faSync} spin /></SyncIndicatorContainer>;
};

export default SyncIndicator;