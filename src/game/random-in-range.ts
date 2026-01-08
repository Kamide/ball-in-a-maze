export function randomInRange(
  min: number,
  max: number,
  random: () => number = Math.random,
) {
  return random() * (max - min) + min;
}
