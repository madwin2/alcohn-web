export interface TrustStat {
  value: string;
  label: string;
  mobileLabel: string;
}

export const trustStats: TrustStat[] = [
  { value: '+7', label: 'años de experiencia', mobileLabel: 'años de exp.' },
  { value: '+6000', label: 'sellos fabricados', mobileLabel: 'sellos fabricados' },
  { value: '72hs', label: 'hábiles de fabricación', mobileLabel: 'fabricación' },
  { value: 'Envíos', label: 'a todo el país', mobileLabel: 'todo el país' },
];
