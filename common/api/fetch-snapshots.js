import fetch from "./fetch"

export default async function fetchSnapshotsFor(page = "") {
  // Capitalizing the first letter
  page = page[0].toUpperCase() + page.slice(1);

  const response = await fetch(`get${page}Snapshots`);
  const { data } = response;
  const snapshots = data.sort((a, b) => b.dateUpdate - a.dateUpdate);
  return snapshots;
}