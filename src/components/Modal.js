import React, { useEffect, useRef } from 'react';
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
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContainer = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  width: 90%;
  max-width: 500px;
  padding: ${({ theme }) => theme.spacing.large};
  animation: ${zoomIn} 0.3s ease;
  text-align: left;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
  font-size: ${({ theme }) => theme.fontSizes.h2};
  color: ${({ theme }) => theme.colors.primary};
`;

const Message = styled.p`
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.confirm {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    &:hover { background-color: ${({ theme }) => theme.colors.secondary}; }
  }

  &.cancel {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover { background-color: ${({ theme }) => theme.colors.background}; }
  }
`;

const Modal = () => {
  const { isModalOpen, modalContent, onConfirm, onCancel, setModalInputValue } = useUiStore();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isModalOpen && modalContent.type === 'prompt' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isModalOpen, modalContent.type]);

  if (!isModalOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(modalContent.inputValue);
  };

  return (
    <Backdrop onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onCancel}>&times;</CloseButton>
        <Title>{modalContent.title}</Title>
        {modalContent.message && <Message>{modalContent.message}</Message>}
        
        {modalContent.type === 'prompt' && (
          <Input
            ref={inputRef}
            type="text"
            value={modalContent.inputValue}
            onChange={(e) => setModalInputValue(e.target.value)}
            placeholder={modalContent.placeholder || ''}
          />
        )}

        <ButtonGroup>
          {modalContent.cancelText && (
            <Button className="cancel" onClick={onCancel}>
              {modalContent.cancelText}
            </Button>
          )}
          {modalContent.confirmText && (
            <Button className="confirm" onClick={handleConfirm}>
              {modalContent.confirmText}
            </Button>
          )}
        </ButtonGroup>
      </ModalContainer>
    </Backdrop>
  );
};

export default Modal;
