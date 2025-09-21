import React from 'react';
import styled, { keyframes } from 'styled-components';
import useUiStore from '../store/uiStore';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const zoomIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  animation: ${zoomIn} 0.3s ease;
  text-align: left;
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`;

const Message = styled.p`
  margin: 0 0 2rem 0;
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  white-space: pre-wrap; // To respect newlines in the message
  max-height: 400px;
  overflow-y: auto;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.confirm {
    background-color: #3498db;
    color: white;
    &:hover { background-color: #2980b9; }
  }

  &.cancel {
    background-color: #f0f0f0;
    color: #333;
    &:hover { background-color: #e0e0e0; }
  }
`;

const Modal = () => {
  const { isModalOpen, modalContent, onConfirm, onCancel } = useUiStore();

  if (!isModalOpen) {
    return null;
  }

  return (
    <Backdrop onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{modalContent.title}</Title>
        <Message>{modalContent.message}</Message>
        <ButtonGroup>
          <Button className="cancel" onClick={onCancel}>
            {modalContent.cancelText || '閉じる'}
          </Button>
          {modalContent.confirmText && (
            <Button className="confirm" onClick={onConfirm}>
              {modalContent.confirmText}
            </Button>
          )}
        </ButtonGroup>
      </ModalContainer>
    </Backdrop>
  );
};

export default Modal;
