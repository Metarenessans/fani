var params = (function () {

  function getHash() {
    return window.location.hash.substring(1);
  }

  return {
    get(name) {
      for (let chunk of getHash().split("&")) {
        var chunkName  = chunk.split("=")[0];
        var chunkValue = chunk.split("=")[1];
        if (chunkName === name) {
          return chunkValue;
        }
      }

      return null;
    },

    replaceEntry(hash, name, val) {
      let regexp = new RegExp(name + "=[\\w\\d]+");

      if (hash.search(regexp) === -1) {
        if (hash.length !== 0) {
          hash += "&";
        }

        hash += name + "=" + val;
      }
      else {
        hash = hash.replace(regexp, name + "=" + val);
      }

      return hash;
    },

    set(name, val) {
      // debugger;
      var hash = getHash();

      if (typeof name == "string") {
        hash = this.replaceEntry(hash, name, val);
      }
      else {
        for (var key in name) {
          hash = this.replaceEntry(hash, key, name[key])
        }
      }

      window.location.hash = hash;
    }
  };
})();

export default params;