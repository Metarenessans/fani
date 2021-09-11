module.exports = {
  moduleNameMapper: {
    "\\.(css|scss|sass|jpg|png)$": "<rootDir>/empty-module.js"
  },
  transform: {
    "^.+\\.(js|jsx)$": "<rootDir>/jest-transformer.js",
  },
  transformIgnorePatterns: [
    "<roodDir>/node_modules/(?!antd)"
  ],
};