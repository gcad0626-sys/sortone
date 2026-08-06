const pastelVividColors = [
  { bg: '#FFE4E6', text: '#E11D48' }, // Rose
  { bg: '#FEF3C7', text: '#D97706' }, // Amber
  { bg: '#ECFCCB', text: '#65A30D' }, // Lime
  { bg: '#D1FAE5', text: '#059669' }, // Emerald
  { bg: '#CCFBF1', text: '#0D9488' }, // Teal
  { bg: '#E0F2FE', text: '#0284C7' }, // Sky
  { bg: '#E0E7FF', text: '#4F46E5' }, // Indigo
  { bg: '#F3E8FF', text: '#9333EA' }, // Purple
  { bg: '#FAE8FF', text: '#C026D3' }, // Fuchsia
  { bg: '#FCE7F3', text: '#DB2777' }, // Pink
  { bg: '#FFEFE5', text: '#EA580C' }, // Orange
  { bg: '#E8FCE0', text: '#3EB312' }, // Green
  { bg: '#E0F0FF', text: '#1E82FF' }, // Blue
];

export const getTagColor = (tag: string) => {
  if (!tag) return pastelVividColors[0];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelVividColors.length;
  return pastelVividColors[index];
};
