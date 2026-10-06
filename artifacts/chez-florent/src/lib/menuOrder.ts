/** Returns a new order, preserving all items; invalid/unchanged moves are no-ops. */
export function moveMenuItem<T extends { id: number }>(items: T[], activeId: number, overId: number): T[] {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function sameMenuOrder(a: { id: number }[], b: { id: number }[]) {
  return a.length === b.length && a.every((item, index) => item.id === b[index].id);
}
