export interface NumberedMenuItem<T> {
  item: T;
  index: number;
}

/** Split the menu in reading order: left half first, then the remaining right column. */
export function splitMenuIntoColumns<T>(items: T[]): [NumberedMenuItem<T>[], NumberedMenuItem<T>[]] {
  const leftCount = items.length <= 1 ? items.length : Math.floor(items.length / 2);
  const numbered = (start: number, end: number) =>
    items.slice(start, end).map((item, offset) => ({ item, index: start + offset }));
  return [numbered(0, leftCount), numbered(leftCount, items.length)];
}
