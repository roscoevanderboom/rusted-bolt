export function setApiKey(provider: string, key: string) {
  localStorage.setItem(`apiKey_${provider}`, key);
}

export function getApiKey(provider: string): string {
  return localStorage.getItem(`apiKey_${provider}`) || "";
}
