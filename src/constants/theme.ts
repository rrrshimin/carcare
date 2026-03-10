export const theme = {
  colors: {
    primary: '#0051E8',
    background: '#0C111F',
    link: '#367DFF',
    card: '#141A2B',
    border: '#1F2740',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3ACBF',
    warning: '#FFB020',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    button: 10,
    input: 10,
    card: 14,
    image: 14,
  },
  typography: {
    fontFamily: 'Poppins',
    pageTitle: { size: 28, weight: '800' },
    sectionTitle: { size: 20, weight: '800' },
    cardTitle: { size: 18, weight: '800' },
    body: { size: 16, weight: '400' },
    secondary: { size: 14, weight: '400' },
    caption: { size: 12, weight: '400' },
  },
} as const;
