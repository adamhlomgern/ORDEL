/**
 * Minimal V0.0 design tokens. Scandinavian/calm/tactile direction per
 * MASTER_PRODUCT_BRIEF.md section 19. This is intentionally small — no
 * component primitives yet (see docs/DESIGN_SYSTEM.md and brief section 50).
 */
export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  ink: '#1F1B16',
  inkMuted: '#6B6459',
  border: '#E4DED3',
  accent: '#2F5D50',
  success: '#2F5D50',
  danger: '#B3441E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
};

export const typography = {
  heading: {
    fontSize: 28,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
};
