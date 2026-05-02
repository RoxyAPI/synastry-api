import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

/**
 * Synastry API: computes inter-chart aspects between two natal charts and returns
 * a compatibility score plus full aspect table. Roxy Ephemeris, verified against NASA JPL Horizons.
 * Call /location/search for each person first -- never hardcode coordinates.
 */
async function main() {
  // Step 1: geocode person 1 birth city
  const { data: loc1, error: locErr1 } = await roxy.location.searchCities({
    query: { q: 'New York' },
  });
  if (locErr1) throw new Error(locErr1.error);
  const { latitude: lat1, longitude: lng1, timezone: tz1 } = loc1.cities[0];

  // Step 2: geocode person 2 birth city
  const { data: loc2, error: locErr2 } = await roxy.location.searchCities({
    query: { q: 'London' },
  });
  if (locErr2) throw new Error(locErr2.error);
  const { latitude: lat2, longitude: lng2, timezone: tz2 } = loc2.cities[0];

  // Step 3: calculate synastry (relationship compatibility)
  const { data, error } = await roxy.astrology.calculateSynastry({
    body: {
      person1: {
        name: 'Alex',
        date: '1990-03-21',
        time: '08:15:00',
        latitude: lat1,
        longitude: lng1,
        timezone: tz1,
      },
      person2: {
        name: 'Jordan',
        date: '1992-08-14',
        time: '14:30:00',
        latitude: lat2,
        longitude: lng2,
        timezone: tz2,
      },
    },
  });

  if (error) throw new Error(error.error);

  console.log('Compatibility score:', data.compatibilityScore);
  console.log(
    `${data.person1.name ?? 'Person 1'}: ${data.person1.sunSign} sun / ${data.person1.moonSign} moon / ${data.person1.ascendant.sign} rising`
  );
  console.log(
    `${data.person2.name ?? 'Person 2'}: ${data.person2.sunSign} sun / ${data.person2.moonSign} moon / ${data.person2.ascendant.sign} rising`
  );

  console.log(
    `\nAspect summary: ${data.summary.total} total (${data.summary.harmonious} harmonious, ${data.summary.challenging} challenging)`
  );

  console.log('\nTop 3 inter-aspects by strength:');
  for (const aspect of data.interAspects.slice(0, 3)) {
    console.log(
      `  ${aspect.planet1} -> ${aspect.planet2}: ${aspect.type} orb ${aspect.orb.toFixed(2)} strength ${aspect.strength} [${aspect.interpretation}]`
    );
  }

  console.log('\nStrengths:');
  for (const s of data.analysis.strengths) {
    console.log(' ', s);
  }

  console.log('\nChallenges:');
  for (const c of data.analysis.challenges) {
    console.log(' ', c);
  }
}

main().catch(console.error);
