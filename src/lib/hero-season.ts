/**
 * Which hero clips play, and in what order, for a given date.
 *
 * The band used to run one fixed order all year and interleave the summer and
 * winter beats so no month contradicted the weather outside the window. That
 * was the right call while the season was not being tracked at all; now that it
 * is, the honest version is better — open on the season the visitor is actually
 * in, and drop the clip that would look wrong.
 *
 * Summer runs mid-May to mid-September: green rooftops open the story and the
 * snowbound hillside sits out. The rest of the year the snow beat is back in
 * its usual late position and the green one stays where it was.
 */

const SUMMER_START = { month: 5, day: 15 }; // 15 May
const SUMMER_END = { month: 9, day: 15 }; // 15 September

const WOOD = "/media/hero/hero-01-wood.mp4"; //  firewood, stacked
const FEED = "/media/hero/hero-02-feed.mp4"; //  a hand feeds the stove
const FLUE = "/media/hero/hero-03-flue.mp4"; //  smoke and flame inside the flue
const FIRE = "/media/hero/hero-04-fire.mp4"; //  the fire takes — cool-toned
const ROOFS = "/media/hero/hero-06-roofs.mp4"; // rooftops over forest, green
const SNOW = "/media/hero/hero-07-snow.mp4"; //  the same country under snow
const DUSK = "/media/hero/hero-08-dusk.mp4"; //  dusk, several chimneys drawing

export function isSummer(date = new Date()): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const after = (m: { month: number; day: number }) =>
    month > m.month || (month === m.month && day >= m.day);
  const before = (m: { month: number; day: number }) =>
    month < m.month || (month === m.month && day <= m.day);
  return after(SUMMER_START) && before(SUMMER_END);
}

export function heroClips(date = new Date()): string[] {
  return isSummer(date)
    ? // Green first: the fold opens on the season the visitor is in, and the
      // snowbound clip is out until autumn.
      [ROOFS, WOOD, FEED, FLUE, FIRE, DUSK]
    : // The original arc, minus the lone brick chimney: hands, then flue, then
      // out to the country, then dusk.
      [WOOD, FEED, FLUE, FIRE, ROOFS, SNOW, DUSK];
}
