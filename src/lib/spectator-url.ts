export function buildSpectatorUrl(matchId: string): string {
  return `${window.location.origin}/matches/${matchId}/watch`;
}
