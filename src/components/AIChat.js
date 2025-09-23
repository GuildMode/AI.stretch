import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { generateAIResponse } from '../utils/aiLogic';
import useUserStore from '../store/userStore';
import { useStretchStore } from '../store/stretchStore';

import useUiStore from '../store/uiStore';

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const ChatContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.large};
  display: flex;
  flex-direction: column;
  height: 80vh; /* 画面の高さの80%を占める */

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.medium};
    height: auto;
    min-height: 75vh;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.h2};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.h3};
  }
`;

const NewChatButton = styled.button`
  background: none;
  border: 1px solid transparent;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding-right: 10px; /* for scrollbar */

  @media (max-width: 768px) {
    padding-right: 5px;
  }
`;

const Message = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 18px;
  border-radius: 20px;
  background-color: ${props => (props.sender === 'user' ? props.theme.colors.primary : props.theme.colors.background)};
  color: ${props => (props.sender === 'user' ? props.theme.colors.white : props.theme.colors.text)};
  white-space: pre-wrap; /* 改行を反映させる */
  word-break: break-word;

  @media (max-width: 768px) {
    max-width: 90%;
    padding: 10px 16px;
  }
`;

const InputForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: auto; /* Push to the bottom */
`;

const TextInput = styled.input`
  flex-grow: 1;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const SendButton = styled.button`
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
`;

const AIChat = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef(null);

  const {
    userProfile,
    setUserProfile,
    setAiSuggestions,
    chatMessages,
    addChatMessage,
    resetChat,
  } = useUserStore();
  const openModal = useUiStore((state) => state.openModal);
  
  const stretches = useStretchStore(state => state.stretches);

  const initialMessageFetched = useRef(false);

  // Set initial greeting message on mount if chat is empty
  useEffect(() => {
    const fetchInitialMessage = async () => {
      if (chatMessages.length === 0 && !initialMessageFetched.current) {
        initialMessageFetched.current = true;
        setIsLoading(true);
        const initialResponse = await generateAIResponse('');
        addChatMessage({ id: Date.now(), sender: 'ai', ...initialResponse });
        setIsLoading(false);
      }
    };
    fetchInitialMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages.length]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  const handleNewChatClick = () => {
    openModal({
      title: '新しいチャットの開始',
      message: '本当に新しいチャットを開始しますか？現在の会話は削除されます。',
      confirmText: '開始する',
      cancelText: 'キャンセル',
      onConfirm: () => {
        resetChat();
        initialMessageFetched.current = false; // Allow initial message to be fetched again
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    addChatMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputValue, stretches, userProfile, chatMessages);
      const aiMessage = { id: Date.now() + 1, sender: 'ai', text: aiResponse.text, suggestions: aiResponse.suggestions };
      addChatMessage(aiMessage);

      // Auto-update user profile if changed
      if (aiResponse.updatedProfile && aiResponse.updatedProfile !== userProfile) {
        setUserProfile(aiResponse.updatedProfile);
        console.log('User profile was auto-updated.');
      }

      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setAiSuggestions(aiResponse.suggestions);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage = { id: Date.now() + 1, sender: 'ai', text: 'エラーが発生しました。もう一度お試しください。', suggestions: null };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <Title>AIパーソナルトレーナー</Title>
        <NewChatButton onClick={handleNewChatClick} title="新しいチャットを開始">
          <RefreshIcon />
        </NewChatButton>
      </ChatHeader>
      <MessageList ref={messageListRef}>
        {chatMessages.map((msg) => (
          <Message key={msg.id} sender={msg.sender}>
            <MessageBubble sender={msg.sender}>{msg.text}</MessageBubble>
          </Message>
        ))}
        {isLoading && (
          <Message sender="ai">
            <MessageBubble sender="ai">
              考えています...
            </MessageBubble>
          </Message>
        )}
      </MessageList>
      <InputForm onSubmit={handleSubmit}>
        <TextInput
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? 'AIが応答中です...' : 'メッセージを入力...'}
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={isLoading}>
          {isLoading ? '...' : '送信'}
        </SendButton>
      </InputForm>
    </ChatContainer>
  );
};

export default AIChat;
