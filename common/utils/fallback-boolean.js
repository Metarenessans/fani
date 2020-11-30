export default function fallbackBoolean(value, fallback) {
  return ["true", "false"].indexOf(String(value)) > -1 ? value : fallback;
}