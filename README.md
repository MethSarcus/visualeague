## Visualeague
Visualeague is a site for visualizing the data of fantasy leagues hosted on Sleeper.

This project uses [Next.js](https://nextjs.org/) with [Chakra UI](https://chakra-ui.com/) for the front end, [Nivo](https://nivo.rocks/) for data visualization and [MongoDB](https://www.mongodb.com/) for storing player projections, stats, and details. Stats for leagues are pulled using [Sleeper's API](https://docs.sleeper.com). If you have any feature requests or want to contribute feel free to open a PR or submit a feature request. 

This app uses the experimental features provided with [NextJS 13](https://nextjs.org/blog/next-13) so make sure to read up on those changes

The draft page's auction spending chart follows linked league seasons and shows each roster's recorded pick dollars and positional spending shares for a selected auction. Owners and team names come from each season's reported rosters; mid-season ownership changes cannot be reconstructed. Non-auction drafts and auctions with no recorded spending are omitted; active auctions show spending recorded so far. Kicker and defense spending are combined, and other positions are shown separately.

The league page's FAAB chart subtracts each roster's Sleeper-reported waiver budget used from the league's starting waiver budget. The roster value reflects FAAB transfers, so balances can exceed the starting budget. Grey segments show successful paid waiver claims from the league's recorded transaction weeks, with player names and bid amounts on hover or focus; on mobile, select Details to see each purchase. Transfers are not purchases.

The weekly scoring range chart shows each week's highest, average and lowest available team scores, including bye weeks. Weeks without scores are omitted, and the vertical scale is zoomed to the data. Open the weekly scores table for exact values.

The team points by position chart shows starter points attributed to each position, with a table of exact values. Teams are ordered by total points; custom score adjustments may not be reflected in the positional breakdown.

The Experimental page offers four views for the selected team and season portion. The starter mosaic shows recorded weekly scores for up to 15 most-used starters; score twins compares the closest-scoring starter pair each week. Starter or bench compares each player's average scores while started and benched by that team, not eligible lineup swaps or predictions. The starter constellation totals recorded points while starting and shows up to 12 positive totals. Five team fun facts also follow the team selector. Only weeks with recorded player stats are included; missing stats do not necessarily mean a player did not play.

Additional Experimental views include direct eligible bench swaps that change a result, top-starter scoring shares, opponent scoring by position versus the rest of the league, former players started against their old team, high-scoring starters in losses, and a team profile. Matchup result calculations exclude custom-adjusted games, bye weeks, and games without recorded starter stats on both sides. The league model treats other missing starter scores as zero. Swaps rely on position eligibility and weekly roster snapshots, not game-time availability or reserve and taxi eligibility. Revenge history uses earlier weekly roster snapshots from the same season, including weeks outside the selected portion; it can miss reserve or taxi players and midweek roster changes. Positional comparisons use recorded opposing starters in paired games; they are descriptive and not measures of defensive ability.

League History follows Sleeper's linked previous leagues and uses roster and weekly matchup scores without loading individual player statistics. It includes scored regular-season and playoff weeks (including consolation games). Points for include bye weeks and unpaired matchups; points against, per-game averages, records and nemeses use paired head-to-head matchups only and exclude league-median games. Standings can be sorted and filtered to a single linked season. Teams are grouped by the roster owner reported for each season; mid-season ownership changes cannot be reconstructed.

The wins leader chart plots season wins. The points leader chart plots per-game averages above the line and shows season totals below the years; seasons without paired games leave a gap. Hover or focus a season for details. The wins card's win rate counts ties as half a win; the points card's overall and seasonal per-game averages use paired head-to-head scores, while its total and seasonal points also include byes and unpaired weeks.

The history page's current-members filter is on by default. When enabled, it includes only owners of rosters in the requested league season; their past scores, records and division contributions still include games against former members. Nemeses can be former members, and game highlights can include a former opponent if at least one participant is a current member. Unowned rosters are not treated as current members.

Nemeses can be ranked by losses or by the largest total scoring advantage an opponent has over a team in head-to-head games. A team has no points-differential nemesis if no opponent has outscored it. Loss ties are broken by opponent points; exact ties share the title. Mutual nemeses share a card. Browse the 3D carousel with the team chips, controls, arrow keys or a swipe, and open rivalry details to see each team's wins, points, points per game and past matchups. When a team has multiple nemeses, its chip opens the nearest matching card.

The all-time head-to-head matrix shows each row team's record against each column team using paired games. Select a cell for scoring comparisons and past matchups. The current-members filter limits both matrix axes to current owners. Records omit ties when no paired game in the full league history ended in a tie.

The standings' W/L ratio divides head-to-head wins by losses and excludes ties. Teams with wins and no losses show infinity; teams with neither wins nor losses have no ratio.

Division bragging rights compare head-to-head records and scores between divisions, using their reported season roster assignments. Win rate counts ties as half a win; scoring averages use the same interdivision games. Same-division games, byes, median games, incomplete or invalid matchups, and results for rosters with unknown divisions are excluded. Division slots and names can change across seasons, and mid-season assignment changes cannot be reconstructed.

The all-time division tab groups by Sleeper division slot, reports name changes, and weights win rates and scoring averages by interdivision games played. The season tab preserves each season's names and head-to-head results separately. Its colors compare win rate and average points independently, and graphs can be expanded. A trophy marks the champion's reported division from the completed season's Sleeper playoff bracket, even if the champion is excluded by the current-members filter; no trophy is shown when the champion or division is unavailable.

Node.js 20.9 or newer is required by the current Next.js version.

## Getting Started

First create a .env.local file with the following content
```
MONGODB_URI=mongodb+srv://guest:etPwqpjM9oVcRFRc@cluster0.ertyk0m.mongodb.net/?retryWrites=true&w=majority
```

install npm packages and run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser
