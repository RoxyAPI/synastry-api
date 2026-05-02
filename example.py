"""
Synastry API: inter-chart aspect analysis between two natal charts plus a compatibility score.
Call /location/search for each person first -- never hardcode coordinates.
Roxy Ephemeris, verified against NASA JPL Horizons.
"""

import os
from roxy_sdk import create_roxy

roxy = create_roxy(os.environ["ROXY_API_KEY"])


def main():
    # Step 1: geocode person 1 birth city
    loc1 = roxy.location.search_cities(q="New York")
    city1 = loc1["cities"][0]

    # Step 2: geocode person 2 birth city
    loc2 = roxy.location.search_cities(q="London")
    city2 = loc2["cities"][0]

    # Step 3: calculate synastry (relationship compatibility)
    result = roxy.astrology.calculate_synastry(
        person1={
            "name": "Alex",
            "date": "1990-03-21",
            "time": "08:15:00",
            "latitude": city1["latitude"],
            "longitude": city1["longitude"],
            "timezone": city1["timezone"],
        },
        person2={
            "name": "Jordan",
            "date": "1992-08-14",
            "time": "14:30:00",
            "latitude": city2["latitude"],
            "longitude": city2["longitude"],
            "timezone": city2["timezone"],
        },
    )

    print("Compatibility score:", result["compatibilityScore"])
    p1 = result["person1"]
    p2 = result["person2"]
    print(
        f"{p1.get('name', 'Person 1')}: {p1['sunSign']} sun / {p1['moonSign']} moon / {p1['ascendant']['sign']} rising"
    )
    print(
        f"{p2.get('name', 'Person 2')}: {p2['sunSign']} sun / {p2['moonSign']} moon / {p2['ascendant']['sign']} rising"
    )

    summary = result["summary"]
    print(
        f"\nAspect summary: {summary['total']} total "
        f"({summary['harmonious']} harmonious, {summary['challenging']} challenging)"
    )

    print("\nTop 3 inter-aspects by strength:")
    for aspect in result["interAspects"][:3]:
        print(
            f"  {aspect['planet1']} -> {aspect['planet2']}: "
            f"{aspect['type']} orb {aspect['orb']:.2f} "
            f"strength {aspect['strength']} [{aspect['interpretation']}]"
        )

    print("\nRelationship strengths:")
    for strength in result["analysis"]["strengths"]:
        print(" ", strength)

    print("\nRelationship challenges:")
    for challenge in result["analysis"]["challenges"]:
        print(" ", challenge)


if __name__ == "__main__":
    main()
