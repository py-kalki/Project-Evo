/**
 * card.ts — shared constants for the Event Card Designer.
 * Used by both the API (validation) and the UI (rendering).
 * Changing a value here automatically updates both sides.
 */

export const THEMES = ['sunset', 'ocean', 'forest'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_GRADIENTS: Record<Theme, string> = {
  sunset: 'linear-gradient(135deg, #ff6b35 0%, #f7c59f 50%, #ffb347 100%)',
  ocean: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #0e4d92 100%)',
  forest: 'linear-gradient(135deg, #134e5e 0%, #1a6b4a 50%, #71b280 100%)',
};

export const THEME_LABELS: Record<Theme, string> = {
  sunset: 'Sunset',
  ocean: 'Ocean',
  forest: 'Forest',
};

export const STICKERS = ['🎵', '🍕', '🎉', '⭐', '🔥'] as const;
export type Sticker = (typeof STICKERS)[number];

export const MAX_STICKERS = 3;
export const DEFAULT_THEME: Theme = 'sunset';
