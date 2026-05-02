# AGENTS.md for Synastry API

This repo teaches AI coding agents (Cursor, Claude Code, Aider, Codex, Windsurf, RooCode, Gemini CLI) how to use the RoxyAPI synastry endpoint.

## Endpoint
- Method: `POST`
- URL: `https://roxyapi.com/api/v2/astrology/synastry`
- Auth: `X-API-Key` header
- Domain: `astrology` (one of 10 in the RoxyAPI catalog)
- Operation ID: `calculateSynastry` matches the SDK method name in camelCase
- MCP tool: `post_astrology_synastry` on `https://roxyapi.com/mcp/astrology`

## TypeScript SDK
```ts
import { createRoxy } from '@roxyapi/sdk';
const roxy = createRoxy(process.env.ROXY_API_KEY!);
const { data, error } = await roxy.astrology.calculateSynastry({
  body: {
    person1: {
      name: 'Alex',
      date: '1990-03-21',
      time: '08:15:00',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
    },
    person2: {
      name: 'Jordan',
      date: '1992-08-14',
      time: '14:30:00',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    },
  },
});
```

## Python SDK
```python
import os
from roxy_sdk import create_roxy
roxy = create_roxy(os.environ["ROXY_API_KEY"])
result = roxy.astrology.calculate_synastry(
    person1={
        "name": "Alex",
        "date": "1990-03-21",
        "time": "08:15:00",
        "latitude": 40.7128,
        "longitude": -74.006,
        "timezone": "America/New_York",
    },
    person2={
        "name": "Jordan",
        "date": "1992-08-14",
        "time": "14:30:00",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "timezone": "Europe/London",
    },
)
```

## Setup step (coordinate-dependent endpoint)
Always call `GET /location/search?q={city}` TWICE (once per person) before calling synastry. Take `latitude`, `longitude`, `timezone` from `cities[0]` and pipe them in. Never ask the user to type coordinates.

```ts
const { data: loc1 } = await roxy.location.searchCities({ query: { q: 'New York' } });
const { data: loc2 } = await roxy.location.searchCities({ query: { q: 'London' } });
const { latitude: lat1, longitude: lng1, timezone: tz1 } = loc1.cities[0];
const { latitude: lat2, longitude: lng2, timezone: tz2 } = loc2.cities[0];
const { data } = await roxy.astrology.calculateSynastry({
  body: {
    person1: { date: '1990-03-21', time: '08:15:00', latitude: lat1, longitude: lng1, timezone: tz1 },
    person2: { date: '1992-08-14', time: '14:30:00', latitude: lat2, longitude: lng2, timezone: tz2 },
  },
});
```

## Request fields
- `person1` (object, required): first person birth data
  - `date` (string, required): birth date YYYY-MM-DD
  - `time` (string, required): birth time HH:MM:SS, 24-hour. Determines the Ascendant. Use 12:00:00 if unknown
  - `latitude` (number, required): -90 to 90. Get from `/location/search`
  - `longitude` (number, required): -180 to 180. Get from `/location/search`
  - `timezone` (number or IANA string, required): UTC offset or IANA name (e.g. "America/New_York"). Server resolves DST-correct offset for the birth date
  - `name` (string, optional): display name echoed in the response
- `person2` (object, required): same shape as `person1`
- `houseSystem` (string, optional): `placidus` (default), `whole-sign`, `equal`, `koch`

## Response top level keys
- `person1`: chart highlights for person 1: `ascendant` (sign, degree), `sunSign`, `moonSign`, optional `name`
- `person2`: same shape as `person1`
- `compatibilityScore`: number 0-100. Weighted from harmonious vs challenging inter-aspects and planet importance
- `interAspects[]`: every inter-chart aspect. Each has `planet1`, `planet2`, `type`, `angle`, `orb`, `strength` (0-100), `interpretation` (harmonious/challenging/neutral), and `meaning` object with `relationshipContext`
- `summary`: `total`, `harmonious`, `challenging`, `neutral`, `byType` (object keyed by aspect type)
- `analysis`: `overall` (string narrative), `strengths[]` (string array), `challenges[]` (string array)

## Domain rules
- This endpoint requires two full birth data objects. Both `person1` and `person2` are required.
- Always call `/location/search` TWICE, once for each person, before calling synastry. Never hardcode coordinates.
- `timezone` accepts both decimal UTC offset and IANA name. Prefer passing `cities[0].timezone` (the IANA string) directly. The server resolves DST-correct offset for each birth date independently, so a summer 1990 New York birth and a winter 1992 New York birth get different offsets automatically.
- `interAspects` is sorted by `strength` descending by default. Slice the first N for a compact display.
- For the lightweight compatibility card (score plus blurb only, no full inter-aspect table) use `POST /astrology/compatibility-score` instead.
- Aspect types that appear in `interAspects[].type`: CONJUNCTION, OPPOSITION, TRINE, SQUARE, SEXTILE, QUINCUNX, SEMISEXTILE, SEMISQUARE, SESQUIQUADRATE.
- `interpretation: "neutral"` usually means a conjunction: the outcome depends on which planets are conjunct.

## Related endpoints
- `POST /astrology/compatibility-score` (`calculateCompatibility`): lightweight compatibility percent with sign-level blocks
- `POST /astrology/natal-chart` (`generateNatalChart`): full natal chart per person with sign, house, interpretation
- `POST /astrology/transits` (`calculateTransits`): current sky transits against a natal chart for live timing

## Verified
2026-Q2 against `https://roxyapi.com/api/v2/openapi.json`. Re-fetch the spec for ground truth before changing this file.

## Discovery
- Full catalog: https://roxyapi.com/AGENTS.md
- LLM index: https://roxyapi.com/llms.txt
- Methodology: https://roxyapi.com/methodology
