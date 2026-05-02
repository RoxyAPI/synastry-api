import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY);

/**
 * Synastry API: inter-chart aspect analysis between two natal charts.
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

  // Step 3: calculate synastry
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
    `${data.person1.name}: ${data.person1.sunSign} sun / ${data.person1.moonSign} moon`
  );
  console.log(
    `${data.person2.name}: ${data.person2.sunSign} sun / ${data.person2.moonSign} moon`
  );

  console.log('\nTop 3 inter-aspects:');
  for (const aspect of data.interAspects.slice(0, 3)) {
    console.log(
      `  ${aspect.planet1} -> ${aspect.planet2}: ${aspect.type} orb=${aspect.orb.toFixed(2)} strength=${aspect.strength}`
    );
  }

  console.log('\nRelationship strengths:');
  for (const s of data.analysis.strengths) {
    console.log(' ', s);
  }
}

main().catch(console.error);
