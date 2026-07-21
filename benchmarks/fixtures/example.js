export function groupByStatus(items) {
  return Object.groupBy(items, ({ status }) => status);
}

const result = groupByStatus([
  { id: 1, status: "ready" },
  { id: 2, status: "waiting" },
]);

console.log(result);
