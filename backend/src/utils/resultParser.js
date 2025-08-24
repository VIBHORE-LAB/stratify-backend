export function parseLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

export function computePctChange(finalNav, startingNav = 100000) {
  if (!startingNav) {
    return 0;
  }

  return ((Number(finalNav) - Number(startingNav)) / Number(startingNav)) * 100;
}
