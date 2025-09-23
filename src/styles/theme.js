const common = {
  fonts: {
    main: "'Noto Sans JP', sans-serif",
  },
  fontSizes: {
    small: '0.875rem',
    body: '1rem',
    large: '1.125rem',
    h3: '1.25rem',
    h2: '1.5rem',
    h1: '2rem',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
};

const lightTheme = {
  ...common,
  colors: {
    primary: '#2563EB',      // ブルー
    secondary: '#60A5FA',    // ライトブルー
    accent: '#F59E0B',        // オレンジ
    success: '#10B981',      // グリーン
    purple: '#8B5CF6',       // パープル
    text: '#1F2937',         // ダークグレー (Text)
    textSecondary: '#6B7280', // ミディアムグレー (Text)
    background: '#F9FAFB',    // オフホワイト (Background)
    surface: '#FFFFFF',       // ホワイト (Component Background)
    border: '#E5E7EB',        // ライトグレー (Borders)
    white: '#FFFFFF',
  },
};

const darkTheme = {
  ...common,
  colors: {
    primary: '#3B82F6',      // Bright Blue
    secondary: '#60A5FA',    // Lighter Blue
    accent: '#FBBF24',        // Bright Orange
    success: '#34D399',      // Bright Green
    purple: '#A78BFA',       // Bright Purple
    text: '#F9FAFB',         // Light Gray (Text)
    textSecondary: '#9CA3AF', // Medium Gray (Text)
    background: '#111827',    // Dark Blue-Gray (Background)
    surface: '#1F2937',       // Blue-Gray (Component Background)
    border: '#374151',        // Gray (Borders)
    white: '#FFFFFF',
  },
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
};

export const getTheme = (mode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};