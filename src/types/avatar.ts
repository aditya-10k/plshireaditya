export type AvatarExpression =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'surprised'
  | 'confused'
  | 'skeptical'
  | 'sad'
  | 'frustrated'
  | 'angry'
  | 'laughing'
  | 'serious'
  | 'greeting'
  | 'agreeing'
  | 'disagreeing'
  | 'sleepy'
  | 'focused'
  | 'realizing';

export type EyeDirection = 'center' | 'left' | 'right' | 'up' | 'down';

export type MouthShape =
  | 'neutral'
  | 'smile'
  | 'big_smile'
  | 'frown'
  | 'open'
  | 'wide_open'
  | 'small_open'
  | 'skeptical'
  | 'laugh';

export interface AvatarAccessories {
  hat: boolean;
  sunglasses: boolean;
}
