/**
 * Pixel-art sprites as data (docs/11 Phase 5).
 *
 * A sprite is a tiny 2D color grid: rows of characters, a legend mapping
 * each character to a CSS color (`.` and space = transparent). Rendering
 * is fully code-generated — one `<rect>` per filled pixel, crisp edges —
 * so badges, stamps, and spinners need no sprite artist and no texture
 * files. The grid→rect mapping is pure and unit-tested
 * (`__tests__/pixel-sprite.test.ts`); the component is a thin renderer
 * over it.
 */

export interface PixelGrid {
  /** Maps row characters to CSS colors; `"."` and `" "` mean transparent. */
  legend: Record<string, string>;
  /** Rows of equal length; each character is one pixel. */
  rows: string[];
}

export interface PixelRect {
  x: number;
  y: number;
  fill: string;
}

const TRANSPARENT = new Set([".", " "]);

/** Pure: expands a grid into per-pixel rects. Throws on ragged rows or unknown legend characters. */
export function spriteToRects(grid: PixelGrid): PixelRect[] {
  const width = grid.rows[0]?.length ?? 0;
  const rects: PixelRect[] = [];

  grid.rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error(
        `Ragged sprite row: expected ${width} columns, got ${row.length} at row ${y}`,
      );
    }
    for (let x = 0; x < row.length; x += 1) {
      const char = row[x];
      if (char === undefined || TRANSPARENT.has(char)) continue;
      const fill = grid.legend[char];
      if (!fill) {
        throw new Error(`Unknown sprite legend character: "${char}"`);
      }
      rects.push({ x, y, fill });
    }
  });

  return rects;
}

export interface PixelSpriteProps {
  grid: PixelGrid;
  /** Display size of ONE pixel, px. The SVG scales as `pixelSize × grid`. */
  pixelSize?: number;
  /** Alt text when the sprite carries meaning on its own; omit when it is decorative (paired with plain text) — the sprite is then `aria-hidden`. */
  title?: string;
  className?: string;
}

/**
 * Renders a `PixelGrid` as crisp SVG. `shape-rendering: crispEdges` keeps
 * every pixel square at any scale (the vector equivalent of
 * `image-rendering: pixelated`).
 */
export function PixelSprite({ grid, pixelSize = 4, title, className }: PixelSpriteProps) {
  const rects = spriteToRects(grid);
  const width = grid.rows[0]?.length ?? 0;
  const height = grid.rows.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * pixelSize}
      height={height * pixelSize}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {rects.map((rect) => (
        <rect key={`${rect.x}-${rect.y}`} x={rect.x} y={rect.y} width={1} height={1} fill={rect.fill} />
      ))}
    </svg>
  );
}
