import fetch from "../api/fetch"

export default function deleteCommand(page, id) {
  // Capitalizing the first letter
  page = page[0].toUpperCase() + page.slice(1);
  
  return new Promise((resolve, reject) => {
    fetch(`delete${page}Snapshot`, "POST", { id })
      .then(() => {
        let { saves, currentSaveIndex } = this.state;

        saves.splice(currentSaveIndex - 1, 1);
        currentSaveIndex = Math.min(Math.max(currentSaveIndex, 1), saves.length);

        this.setState({
          id: null,
          saves,
          saved: false,
          changed: false,
          currentSaveIndex,
        }, resolve);
      })
      .catch(reject);
  });
}