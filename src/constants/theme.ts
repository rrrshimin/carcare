// ─── MASTER THEME ───────────────────────────────────────────────────
// Single source of truth for all visual tokens.
// Changing a value here propagates to every component/screen that reads theme.
export const theme = {
  // ── Colors ──────────────────────────────────────────────────────────
  // App-wide color palette. Every UI color should reference these tokens.
  colors: {
    primary: '#0051E8',        // Brand blue – buttons, active states, highlights
    background: '#0C111F',     // Dark base – screen/app background
    link: '#367DFF',           // Text links, secondary actions ("New Log", "Share")
    card: '#141A2B',           // Card/container/input fill
    border: '#1F2740',         // Borders, separators, input outlines
    textPrimary: '#FFFFFF',    // Titles, main content
    textSecondary: '#A3ACBF',  // Labels, descriptions, metadata
    warning: '#FFB020',        // Due-soon maintenance warnings
    error: '#FF4D4D',          // Validation errors, failure states
    success: '#34D399',        // Success confirmations
  },

  // ── Spacing scale (px) ─────────────────────────────────────────────
  // Base unit: 8px. Used for padding, margin, gaps throughout the app.
  spacing: {
    xs: 4,   // Tight gaps (icon-to-text, badge padding)
    sm: 8,   // Small gaps (row inner spacing)
    md: 16,  // Default padding (cards, screen horizontal margin)
    lg: 24,  // Section separation
    xl: 32,  // Large breathing room (top/bottom screen padding)
  },

  // ── Border radius ──────────────────────────────────────────────────
  radius: {
    button: 10,  // Primary/outline/chip buttons
    input: 10,   // Text inputs, selects, date pickers
    card: 14,    // Cards, category containers
    image: 14,   // Vehicle images, onboarding illustrations
  },

  // ── Typography ─────────────────────────────────────────────────────
  // Font: Poppins (loaded in App.tsx). Weights map to expo-google-fonts variants.
  typography: {
    fontFamily: 'Poppins',
    pageTitle: { size: 28, weight: '800' },     // Screen titles (ExtraBold)
    sectionTitle: { size: 20, weight: '800' },  // Category headings (ExtraBold)
    cardTitle: { size: 18, weight: '800' },     // Card headings (ExtraBold)
    body: { size: 16, weight: '400' },          // Default body text (Regular)
    secondary: { size: 14, weight: '400' },     // Helper text, metadata (Regular)
    caption: { size: 12, weight: '400' },       // Smallest text, captions (Regular)
  },
} as const;
