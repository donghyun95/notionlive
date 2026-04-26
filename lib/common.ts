type HueRange = [number, number];

export function generatePremiumHexColor(): string {
  const hueRanges: HueRange[] = [
    [200, 220], // blue
    [165, 185], // teal
    [250, 280], // violet
    [330, 350], // rose
    [35, 50], // amber
    [140, 160], // emerald
  ];

  const randomRange = (min: number, max: number): number =>
    Math.random() * (max - min) + min;

  const randomInt = (min: number, max: number): number =>
    Math.floor(randomRange(min, max + 1));

  const [hMin, hMax] = hueRanges[randomInt(0, hueRanges.length - 1)];

  const h: number = randomRange(hMin, hMax);
  const s: number = randomRange(55, 78);
  const l: number = randomRange(45, 62);

  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c: number = (1 - Math.abs(2 * l - 1)) * s;
  const x: number = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m: number = l - c / 2;

  let r: number = 0;
  let g: number = 0;
  let b: number = 0;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
