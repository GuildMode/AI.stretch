import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { generateAIResponse } from '../utils/aiLogic';
import useUserStore from '../store/userStore';
import { useStretchStore } from '../store/stretchStore';

const ChatContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.large};
  margin-top: ${({ theme }) => theme.spacing.xlarge};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.h2};
  color: ${({ theme }) => theme.colors.text};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const MessageList = styled.div`
  height: 300px;
  overflow-y: auto;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding-right: 10px; /* for scrollbar */
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
`;

const InputForm = styled.form`
  display: flex;
  gap: 10px;
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
`;

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef(null);

  const userProfile = useUserStore((state) => state.userProfile);
  const setAiSuggestions = useUserStore((state) => state.setAiSuggestions);
  const stretches = useStretchStore(state => state.stretches);

  // Set initial greeting message on mount
  useEffect(() => {
    const fetchInitialMessage = async () => {
      const initialResponse = await generateAIResponse('');
      setMessages([{ id: 1, sender: 'ai', ...initialResponse }]);
    };
    fetchInitialMessage();
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputValue, stretches, userProfile, updatedMessages);
      const aiMessage = { id: Date.now() + 1, sender: 'ai', ...aiResponse };
      setMessages(prev => [...prev, aiMessage]);

      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setAiSuggestions(aiResponse.suggestions);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage = { id: Date.now() + 1, sender: 'ai', text: 'エラーが発生しました。もう一度お試しください。', suggestions: null };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <Title>AIパーソナルトレーナー</Title>
      <MessageList ref={messageListRef}>
        {messages.map((msg) => (
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