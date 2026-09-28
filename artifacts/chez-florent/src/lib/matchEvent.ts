export type MatchLeague = "NHL" | "NFL";

export const MATCH_TAGS: Record<MatchLeague, string> = {
  NHL: "__match_nhl__",
  NFL: "__match_nfl__",
};

const MATCH_LEAGUE_LABELS: Record<MatchLeague, string> = {
  NHL: "Hockey",
  NFL: "Football",
};

export function matchLeague(tag: string | null | undefined): MatchLeague | null {
  if (tag === MATCH_TAGS.NHL) return "NHL";
  if (tag === MATCH_TAGS.NFL) return "NFL";
  return null;
}

export function matchLeagueLabel(league: MatchLeague): string {
  return MATCH_LEAGUE_LABELS[league];
}

export function eventTagLabel(tag: string): string {
  const league = matchLeague(tag);
  return league ? `Soir de match · ${matchLeagueLabel(league)}` : tag;
}

export function matchEventTitle(title: string, tag: string): string {
  const league = matchLeague(tag);
  return league && title === `Soir de match ${league}`
    ? `Soir de match ${matchLeagueLabel(league)}`
    : title;
}

export const MATCH_MENU_HREF = `${import.meta.env.BASE_URL}menu?categorie=soir-de-match#la-cuisine`;