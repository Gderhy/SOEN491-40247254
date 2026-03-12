/**
 * Chart color utilities
 * Generates a deterministic, visually-distinct color palette for any
 * number of data series using the HSL golden-angle distribution.
 *
 * The golden angle (~137.5°) guarantees maximum perceptual separation
 * between adjacent hues regardless of how many series are present.
 */

const GOLDEN_ANGLE = 137.508; // degrees

/**
 * Generate `count` deterministic, evenly-distributed HSL colors.
 *
 * @param count Number of colors to generate
 * @returns Array of CSS color strings (e.g. "hsl(137, 65%, 48%)")
 */
export function generateChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * GOLDEN_ANGLE) % 360;
    return `hsl(${hue.toFixed(0)}, 65%, 48%)`;
  });
}
