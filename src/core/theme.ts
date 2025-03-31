// /Users/adelante/Workspace/chaespeech/app/lib/theme.ts

interface ThemeProps {
  baseH: number;
  baseS: number;
  baseL: number;
  globalS: number;
  globalL: number;
  r: number;
}

interface CSSVariable {
  light: string;
  dark: string;
}

interface CSSVariables {
  [key: string]: CSSVariable;
}

// RGB to HSL 변환 함수
export function rgbToHsl(rgb: string): { h: number; s: number; l: number } {
  // 16진수 RGB 값을 R, G, B로 분리
  const hex = rgb.replace(/^#/, "");
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // R, G, B 값을 0-1 범위로 정규화
  const rNormalized = r / 255;
  const gNormalized = g / 255;
  const bNormalized = b / 255;

  // 최대값과 최소값 계산
  const max = Math.max(rNormalized, gNormalized, bNormalized);
  const min = Math.min(rNormalized, gNormalized, bNormalized);
  const delta = max - min;

  // Lightness 계산
  const l = (max + min) / 2;

  // Saturation 계산
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  // Hue 계산
  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case rNormalized:
        h = ((gNormalized - bNormalized) / delta) % 6;
        break;
      case gNormalized:
        h = (bNormalized - rNormalized) / delta + 2;
        break;
      case bNormalized:
        h = (rNormalized - gNormalized) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  return { h, s, l };
}

// HSL 문자열 생성 함수 (내부 함수로 이동)
function hsl(h: number, s: number, l: number): string {
  // return `hsl(${h}, ${s}%, ${l}%)`;
  return `${h}, ${s}%, ${l}%`;
}

// CSS 변수 생성 함수 (단순화)
function createCSSVariable(
  name: string,
  lightH: number,
  lightS: number,
  lightL: number,
  darkH: number,
  darkS: number,
  darkL: number,
  isForeground = false,
): CSSVariable {
  const foregroundLightValue =
    lightL > 50 ? '0, 0%, 0%' : '0, 0%, 100%';
  const foregroundDarkValue =
    darkL > 50 ? '0, 0%, 0%' : '0, 0%, 100%';
  // const foregroundLightValue =
  //   lightL > 50 ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 100%)';
  // const foregroundDarkValue =
  //   darkL > 50 ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 100%)';

  return {
    light: `--${name}: ${hsl(lightH, lightS, lightL)};
      ${isForeground ? `--${name}-foreground: ${foregroundLightValue};` : ''}`,
    dark: `--${name}: ${hsl(darkH, darkS, darkL)};
      ${isForeground ? `--${name}-foreground: ${foregroundDarkValue};` : ''}`,
  };
}

export function generateThemeCSS({
  baseH,
  baseS,
  baseL,
  globalS,
  globalL,
  r,
}: ThemeProps): string {
  
  // 자주 사용되는 변수 생성 패턴을 함수로 추출 (개선)
  const createCommonVariable = (
    name: string,
    lightL: number,
    darkL: number,
    isForeground = false,
  ): CSSVariable => {
    return createCSSVariable(
      name,
      baseH,
      30 - 20 * (1 - globalS),
      lightL + 10 * globalL,
      baseH,
      30 - 20 * (1 - globalS),
      darkL + 10 * globalL,
      isForeground,
    );
  };

  // CSS 변수 정의
  const cssVariables: CSSVariables = {
    background: createCSSVariable(
      "background",
      baseH,
      globalS * 100,
      95 + 5 * globalL,
      baseH,
      globalS * 50,
      5 + 5 * globalL,
    ),
    foreground: createCSSVariable(
      "foreground",
      baseH,
      globalS * 5,
      0 + 10 * globalL,
      baseH,
      globalS * 5,
      90 + 10 * globalL,
    ),
    card: createCSSVariable(
      "card",
      baseH,
      globalS * 50,
      90 + 10 * globalL,
      baseH,
      globalS * 50,
      0 + 10 * globalL,
    ),
    "card-foreground": createCSSVariable(
      "card-foreground",
      baseH,
      globalS * 5,
      10 + 5 * globalL,
      baseH,
      globalS * 5,
      90 + 10 * globalL,
    ),
    popover: createCSSVariable(
      "popover",
      baseH,
      globalS * 100,
      95 + 5 * globalL,
      baseH,
      globalS * 50,
      5 + 5 * globalL,
    ),
    "popover-foreground": createCSSVariable(
      "popover-foreground",
      baseH,
      globalS * 100,
      0 + 10 * globalL,
      baseH,
      globalS * 5,
      90 + 10 * globalL,
    ),
    primary: createCSSVariable(
      "primary",
      baseH,
      baseS,
      baseL,
      baseH,
      baseS,
      baseL,
      true,
    ),
    secondary: createCommonVariable("secondary", 70, 10),
    muted: createCommonVariable("muted", 85, 15),
    "muted-foreground": createCSSVariable(
      "muted-foreground",
      baseH,
      globalS * 5,
      35 + 5 * globalL,
      baseH,
      globalS * 5,
      60 + 5 * globalL,
    ),
    accent: createCommonVariable("accent", 80, 15),
    "accent-foreground": createCSSVariable(
      "accent-foreground",
      baseH,
      globalS * 5,
      10 + 5 * globalL,
      baseH,
      globalS * 5,
      90 + 5 * globalL,
    ),
    destructive: createCSSVariable(
      "destructive",
      0,
      100 - 50 * (1 - globalS),
      30 + 20 * globalL,
      0,
      100 - 50 * (1 - globalS),
      30 + 20 * globalL,
      true,
    ),
    border: createCSSVariable(
      "border",
      baseH,
      30 - 10 * (1 - globalS),
      50 + 32 * globalL,
      baseH,
      30 - 10 * (1 - globalS),
      18 + 32 * globalL,
    ),
    input: createCSSVariable(
      "input",
      baseH,
      30 - 10 * (1 - globalS),
      18 + 32 * globalL,
      baseH,
      30 - 10 * (1 - globalS),
      18 + 32 * globalL,
    ),
    ring: createCSSVariable(
      "ring",
      baseH,
      94.5 - 60 * (1 - globalS),
      42.7 + 10 * globalL,
      baseH,
      94.5 - 60 * (1 - globalS),
      42.7 + 10 * globalL,
    ),
    "chart-1": createCSSVariable(
      "chart-1",
      baseH + 40,
      60,
      60,
      baseH + 180,
      60,
      50,
    ),
    "chart-2": createCSSVariable(
      "chart-2",
      baseH + 120,
      40,
      50,
      baseH + 240,
      50,
      60,
    ),
    "chart-3": createCSSVariable(
      "chart-3",
      baseH + 200,
      30,
      40,
      baseH + 30,
      60,
      60,
    ),
    "chart-4": createCSSVariable(
      "chart-4",
      baseH + 280,
      50,
      70,
      baseH + 100,
      70,
      60,
    ),
    "chart-5": createCSSVariable(
      "chart-5",
      baseH + 320,
      60,
      60,
      baseH + 20,
      80,
      50,
    ),
    sidebar: createCSSVariable(
      "sidebar",
      baseH,
      globalS * 10,
      95 + 5 * globalL,
      baseH,
      globalS * 50,
      5 + 5 * globalL,
    ),
    "sidebar-foreground": createCSSVariable(
      "sidebar-foreground",
      baseH,
      globalS * 5,
      0 + 10 * globalL,
      baseH,
      globalS * 5,
      90 + 10 * globalL,
    ),
    "sidebar-primary": createCSSVariable(
      "sidebar-primary",
      baseH,
      baseS,
      baseL,
      baseH + 180,
      baseS,
      baseL,
    ),
    "sidebar-primary-foreground": createCSSVariable(
      "sidebar-primary-foreground",
      baseH,
      globalS * 10,
      95 + 5 * globalL,
      baseH,
      globalS * 5,
      90 + 10 * globalL,
    ),
    "sidebar-accent": createCommonVariable("sidebar-accent", 80, 15),
    "sidebar-accent-foreground": createCSSVariable(
      "sidebar-accent-foreground",
      baseH,
      globalS * 5,
      10 + 5 * globalL,
      baseH,
      globalS * 5,
      90 + 10 * globalL,
    ),
    "sidebar-border": createCSSVariable(
      "sidebar-border",
      baseH,
      30 - 10 * (1 - globalS),
      50 + 32 * globalL,
      0,
      0,
      0,
    ),
    "sidebar-ring": createCSSVariable(
      "sidebar-ring",
      baseH,
      94.5 - 60 * (1 - globalS),
      42.7 + 10 * globalL,
      baseH,
      94.5 - 60 * (1 - globalS),
      42.7 + 10 * globalL,
    ),
  };

  // CSS 문자열 생성
  let cssString = ':root{';
  for (const key in cssVariables) {
    cssString += `${cssVariables[key].light}`;
  }
  // radius 변수 추가
  cssString += `--radius:${r}rem;`;

  cssString += '}.dark{';
  for (const key in cssVariables) {
    cssString += `${cssVariables[key].dark}`;
  }
  // radius 변수 추가
  cssString += `--radius:${r}rem;}`;

  return cssString;
}
