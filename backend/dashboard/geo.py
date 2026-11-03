"""US state name normalization for the map insight view. No boundary
polygons here — those are fetched client-side from the us-atlas CDN topology
and matched by name against what normalize_state_name() produces."""

from __future__ import annotations

MAP_CONFIDENCE_THRESHOLD = 0.7

US_STATES: dict[str, str] = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
}

US_STATE_ALIASES: dict[str, str] = {
    **{name.lower(): name for name in US_STATES},
    **{abbr.lower(): name for name, abbr in US_STATES.items()},
    "washington dc": "District of Columbia",
    "washington d.c.": "District of Columbia",
    "d.c.": "District of Columbia",
}


def normalize_state_name(value: str) -> str | None:
    """Map a raw value (full name, abbreviation, or minor variant) to its
    canonical full state name, or None if it isn't a recognizable US state."""
    if not isinstance(value, str):
        return None
    return US_STATE_ALIASES.get(value.strip().lower())


def geo_match_confidence(values: list[str]) -> float:
    """Fraction of distinct values that normalize to a real US state. Used to
    tell a genuine 'State' column apart from a look-alike like 'Region'
    (East/West/Central/South) before rendering either as a map."""
    distinct = {v for v in values if v is not None}
    if not distinct:
        return 0.0
    matched = sum(1 for v in distinct if normalize_state_name(v) is not None)
    return matched / len(distinct)
