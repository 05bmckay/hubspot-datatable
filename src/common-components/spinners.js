// Unicode braille spinner frame data + helpers.
//
// Recreated (zero-dependency) from the public-domain frame definitions in
// https://github.com/gunnargray-dev/unicode-animations (MIT). Each spinner is
// a `{ frames: string[], interval: number }` pair. Frames are pure braille
// glyphs so they render correctly in HubSpot's `<Text>` primitive without a
// monospace font.

const BRAILLE_DOT_MAP = [
  [1, 8],     // row 0
  [2, 16],    // row 1
  [4, 32],    // row 2
  [64, 128],  // row 3
];

export function gridToBraille(grid) {
  const rows = grid.length;
  const cols = grid[0] ? grid[0].length : 0;
  const charCount = Math.ceil(cols / 2);
  let result = "";
  for (let c = 0; c < charCount; c++) {
    let code = 0x2800;
    for (let r = 0; r < 4 && r < rows; r++) {
      for (let d = 0; d < 2; d++) {
        const col = c * 2 + d;
        if (col < cols && grid[r] && grid[r][col]) {
          code |= BRAILLE_DOT_MAP[r][d];
        }
      }
    }
    result += String.fromCodePoint(code);
  }
  return result;
}

export function makeGrid(rows, cols) {
  if (rows <= 0 || cols <= 0) return [];
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

function genScan() {
  const W = 8, H = 4, frames = [];
  for (let pos = -1; pos < W + 1; pos++) {
    const g = makeGrid(H, W);
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (c === pos || c === pos - 1) g[r][c] = true;
      }
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genRain() {
  const W = 8, H = 4, totalFrames = 12, frames = [];
  const offsets = [0, 3, 1, 5, 2, 7, 4, 6];
  for (let f = 0; f < totalFrames; f++) {
    const g = makeGrid(H, W);
    for (let c = 0; c < W; c++) {
      const row = (f + offsets[c]) % (H + 2);
      if (row < H) g[row][c] = true;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genScanLine() {
  const W = 6, H = 4, frames = [];
  const positions = [0, 1, 2, 3, 2, 1];
  for (const row of positions) {
    const g = makeGrid(H, W);
    for (let c = 0; c < W; c++) {
      g[row][c] = true;
      if (row > 0) g[row - 1][c] = c % 2 === 0;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genPulse() {
  const W = 6, H = 4, frames = [];
  const cx = W / 2 - 0.5, cy = H / 2 - 0.5;
  const radii = [0.5, 1.2, 2, 3, 3.5];
  for (const r of radii) {
    const g = makeGrid(H, W);
    for (let row = 0; row < H; row++) {
      for (let col = 0; col < W; col++) {
        const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
        if (Math.abs(dist - r) < 0.9) g[row][col] = true;
      }
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genSnake() {
  const W = 4, H = 4;
  const path = [];
  for (let r = 0; r < H; r++) {
    if (r % 2 === 0) for (let c = 0; c < W; c++) path.push([r, c]);
    else for (let c = W - 1; c >= 0; c--) path.push([r, c]);
  }
  const frames = [];
  for (let i = 0; i < path.length; i++) {
    const g = makeGrid(H, W);
    for (let t = 0; t < 4; t++) {
      const idx = (i - t + path.length) % path.length;
      g[path[idx][0]][path[idx][1]] = true;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genSparkle() {
  const patterns = [
    [1,0,0,1,0,0,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,1,0,0,1, 1,0,0,0,0,1,0,0],
    [0,1,0,0,1,0,0,1, 1,0,0,1,0,0,0,1, 0,0,0,1,0,1,0,0, 0,0,1,0,1,0,1,0],
    [0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 1,0,1,0,0,0,0,1, 0,1,0,1,0,0,0,1],
    [1,0,0,0,0,0,1,1, 0,0,1,0,1,0,0,0, 0,0,0,0,1,0,1,0, 1,0,0,1,0,0,1,0],
    [0,0,0,1,1,0,0,0, 0,1,0,0,0,1,0,1, 1,0,0,1,0,0,0,0, 0,1,0,0,0,1,0,1],
    [0,1,1,0,0,0,0,1, 0,0,0,1,0,0,1,0, 0,1,0,0,0,1,0,0, 0,0,1,0,1,0,0,0],
  ];
  const W = 8, H = 4, frames = [];
  for (const pat of patterns) {
    const g = makeGrid(H, W);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) g[r][c] = !!pat[r * W + c];
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genCascade() {
  const W = 8, H = 4, frames = [];
  for (let offset = -2; offset < W + H; offset++) {
    const g = makeGrid(H, W);
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const diag = c + r;
        if (diag === offset || diag === offset - 1) g[r][c] = true;
      }
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genColumns() {
  const W = 6, H = 4, frames = [];
  for (let col = 0; col < W; col++) {
    for (let fillTo = H - 1; fillTo >= 0; fillTo--) {
      const g = makeGrid(H, W);
      for (let pc = 0; pc < col; pc++) for (let r = 0; r < H; r++) g[r][pc] = true;
      for (let r = fillTo; r < H; r++) g[r][col] = true;
      frames.push(gridToBraille(g));
    }
  }
  const full = makeGrid(H, W);
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) full[r][c] = true;
  frames.push(gridToBraille(full));
  frames.push(gridToBraille(makeGrid(H, W)));
  return frames;
}

function genOrbit() {
  const path = [[0,0],[0,1],[1,1],[2,1],[3,1],[3,0],[2,0],[1,0]];
  const frames = [];
  for (let i = 0; i < path.length; i++) {
    const g = makeGrid(4, 2);
    g[path[i][0]][path[i][1]] = true;
    const t1 = (i - 1 + path.length) % path.length;
    g[path[t1][0]][path[t1][1]] = true;
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genBreathe() {
  const stages = [
    [],
    [[1,0]],
    [[0,1],[2,0]],
    [[0,0],[1,1],[3,0]],
    [[0,0],[1,1],[2,0],[3,1]],
    [[0,0],[0,1],[1,1],[2,0],[3,1]],
    [[0,0],[0,1],[1,0],[2,1],[3,0],[3,1]],
    [[0,0],[0,1],[1,0],[1,1],[2,0],[3,0],[3,1]],
    [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1]],
  ];
  const sequence = [...stages, ...stages.slice().reverse().slice(1)];
  const frames = [];
  for (const dots of sequence) {
    const g = makeGrid(4, 2);
    for (const [r, c] of dots) g[r][c] = true;
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genWaveRows() {
  const W = 8, H = 4, totalFrames = 16, frames = [];
  for (let f = 0; f < totalFrames; f++) {
    const g = makeGrid(H, W);
    for (let c = 0; c < W; c++) {
      const phase = f - c * 0.5;
      const row = Math.round((Math.sin(phase * 0.8) + 1) / 2 * (H - 1));
      g[row][c] = true;
      if (row > 0) g[row - 1][c] = (f + c) % 3 === 0;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genCheckerboard() {
  const W = 6, H = 4, frames = [];
  for (let phase = 0; phase < 4; phase++) {
    const g = makeGrid(H, W);
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (phase < 2) g[r][c] = (r + c + phase) % 2 === 0;
        else g[r][c] = (r + c + phase) % 3 === 0;
      }
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genHelix() {
  const W = 8, H = 4, totalFrames = 16, frames = [];
  for (let f = 0; f < totalFrames; f++) {
    const g = makeGrid(H, W);
    for (let c = 0; c < W; c++) {
      const phase = (f + c) * (Math.PI / 4);
      const y1 = Math.round((Math.sin(phase) + 1) / 2 * (H - 1));
      const y2 = Math.round((Math.sin(phase + Math.PI) + 1) / 2 * (H - 1));
      g[y1][c] = true;
      g[y2][c] = true;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function genFillSweep() {
  const W = 4, H = 4, frames = [];
  for (let row = H - 1; row >= 0; row--) {
    const g = makeGrid(H, W);
    for (let r = row; r < H; r++) for (let c = 0; c < W; c++) g[r][c] = true;
    frames.push(gridToBraille(g));
  }
  const full = makeGrid(H, W);
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) full[r][c] = true;
  frames.push(gridToBraille(full));
  frames.push(gridToBraille(full));
  for (let row = 0; row < H; row++) {
    const g = makeGrid(H, W);
    for (let r = row + 1; r < H; r++) for (let c = 0; c < W; c++) g[r][c] = true;
    frames.push(gridToBraille(g));
  }
  frames.push(gridToBraille(makeGrid(H, W)));
  return frames;
}

function genDiagonalSwipe() {
  const W = 4, H = 4, frames = [];
  const maxDiag = W + H - 2;
  for (let d = 0; d <= maxDiag; d++) {
    const g = makeGrid(H, W);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (r + c <= d) g[r][c] = true;
    frames.push(gridToBraille(g));
  }
  const full = makeGrid(H, W);
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) full[r][c] = true;
  frames.push(gridToBraille(full));
  for (let d = 0; d <= maxDiag; d++) {
    const g = makeGrid(H, W);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (r + c > d) g[r][c] = true;
    frames.push(gridToBraille(g));
  }
  frames.push(gridToBraille(makeGrid(H, W)));
  return frames;
}

export const SPINNERS = {
  // Classic single-char braille
  braille: {
    frames: ["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"],
    interval: 80,
  },
  braillewave: {
    frames: [
      "\u2801\u2802\u2804\u2840",
      "\u2802\u2804\u2840\u2880",
      "\u2804\u2840\u2880\u2820",
      "\u2840\u2880\u2820\u2810",
      "\u2880\u2820\u2810\u2808",
      "\u2820\u2810\u2808\u2801",
      "\u2810\u2808\u2801\u2802",
      "\u2808\u2801\u2802\u2804",
    ],
    interval: 100,
  },
  dna: {
    frames: [
      "\u280B\u2809\u2819\u281A",
      "\u2809\u2819\u281A\u2812",
      "\u2819\u281A\u2812\u2802",
      "\u281A\u2812\u2802\u2802",
      "\u2812\u2802\u2802\u2812",
      "\u2802\u2802\u2812\u2832",
      "\u2802\u2812\u2832\u2834",
      "\u2812\u2832\u2834\u2824",
      "\u2832\u2834\u2824\u2804",
      "\u2834\u2824\u2804\u280B",
      "\u2824\u2804\u280B\u2809",
      "\u2804\u280B\u2809\u2819",
    ],
    interval: 80,
  },
  // Generated braille grid animations
  scan:         { frames: genScan(),         interval: 70 },
  rain:         { frames: genRain(),         interval: 100 },
  scanline:     { frames: genScanLine(),     interval: 120 },
  pulse:        { frames: genPulse(),        interval: 180 },
  snake:        { frames: genSnake(),        interval: 80 },
  sparkle:      { frames: genSparkle(),      interval: 150 },
  cascade:      { frames: genCascade(),      interval: 60 },
  columns:      { frames: genColumns(),      interval: 60 },
  orbit:        { frames: genOrbit(),        interval: 100 },
  breathe:      { frames: genBreathe(),      interval: 100 },
  waverows:     { frames: genWaveRows(),     interval: 90 },
  checkerboard: { frames: genCheckerboard(), interval: 250 },
  helix:        { frames: genHelix(),        interval: 80 },
  fillsweep:    { frames: genFillSweep(),    interval: 100 },
  diagswipe:    { frames: genDiagonalSwipe(),interval: 60 },
};

export const SPINNER_NAMES = Object.keys(SPINNERS);
