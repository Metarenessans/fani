const esModules = [
  "@ant-design/icons",
  "@antv/g2",
  "antd",
  "antd/es",
  "anychart",
  "lodash"
].join("|");

module.exports = {
  moduleNameMapper: {
    "\\.(css|scss|sass|jpg|png)$": "<rootDir>/empty-module.js"
  },
  transform: {
    "^.+\\.(js|jsx)$": "<rootDir>/jest-transformer.js",
  },
  transformIgnorePatterns: [`<roodDir>/node_modules/(?!${esModules})`],
  globals: {
    dev: true
  }
};