import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.main};
    font-size: ${({ theme }) => theme.fontSizes.body};
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 700;
    margin-top: ${({ theme }) => theme.spacing.large};
    margin-bottom: ${({ theme }) => theme.spacing.medium};
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes.h1}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes.h2}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.h3}; }

  p {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.medium};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
    font-family: ${({ theme }) => theme.fonts.main};
    font-weight: 600;
    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }

  .btn-primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    &:hover {
      opacity: 0.9;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  }

  .card {
      background: ${({ theme }) => theme.colors.surface};
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: ${({ theme }) => theme.borderRadius};
      box-shadow: ${({ theme }) => theme.boxShadow};
      padding: ${({ theme }) => theme.spacing.medium};
  }
`;