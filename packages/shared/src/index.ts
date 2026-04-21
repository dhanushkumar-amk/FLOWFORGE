export function createAppBanner(target: "web" | "api"): string {
  return `[flowforge:${target}]`;
}
