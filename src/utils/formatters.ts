/**
 * Calculates distance between two geographical points using the Haversine formula.
 * @returns Distance in kilometers rounded to 1 decimal place.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts price level numbers (1-4) to currency symbols.
 */
export function formatPriceLevel(level: number): string {
  switch (level) {
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return '$$';
  }
}

/**
 * Formats distance display string (e.g. 1.2 km or 450 m).
 */
export function formatDistance(distKm: number | undefined): string {
  if (distKm === undefined) return '';
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

/**
 * Generates formatted star rating string or array indicator.
 */
export function formatRatingText(rating: number): string {
  return rating.toFixed(1);
}
