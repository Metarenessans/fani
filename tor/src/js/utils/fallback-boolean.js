export default function fallbackBoolean(bool, fallback) {
  return ["true", "false"].indexOf(String(bool)) > -1 ? bool : fallback;
}