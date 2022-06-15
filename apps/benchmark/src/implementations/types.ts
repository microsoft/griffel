export interface BoxProps {
  color: 0 | 1 | 2 | 3 | 4 | 5;
  fixed: boolean;
  layout: 'column' | 'row';
  outer: boolean;
}

export interface DotProps {
  size: number;
  x: number;
  y: number;
  color: string;
}
