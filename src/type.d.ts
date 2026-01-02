type Theme =
  | 'bitmap'
  | 'noir'
  | 'ice'
  | 'sand'
  | 'forest'
  | 'mono'
  | 'breeze'
  | 'candy'
  | 'crimson'
  | 'falcon'
  | 'meadow'
  | 'midnight'
  | 'raindrop'
  | 'sunset';

type Padding = 16 | 32 | 64 | 128;

interface RaysoParams {
  title?: string;
  theme?: Theme;
  background?: boolean;
  darkMode?: boolean;
  lineNumbers?: boolean;
  padding: Padding | `${Padding}`;
  language?: string;
  code: string;
}
