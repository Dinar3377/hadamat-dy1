async function snap(lat, lng) {
  const url =
    `https://router.project-osrm.org/nearest/v1/driving/` +
    `${lng},${lat}?radius=2000`; // 🔥 ВАЖНО: увеличенный радиус

  const r = await fetch(url, {
    headers: { "User-Agent": "Hadamat-Taxi" }
  });

  const j = await r.json();

  if (!j.waypoints || !j.waypoints[0]) {
    return null;
  }

  return {
    lat: j.waypoints[0].location[1],
    lng: j.waypoints[0].location[0]
  };
}

export default async function handler(req, res) {
  const { fromLat, fromLng, toLat, toLng } = req.query;

  try {
    let A = await snap(fromLat, fromLng);
    let B = await snap(toLat, toLng);

    // 🔥 FALLBACK — если в РФ не нашли дорогу
    if (!A || !B) {
      return res.status(200).json({
        fallback: true,
        geometry: {
          type: "LineString",
          coordinates: [
            [fromLng, fromLat],
            [toLng, toLat]
          ]
        },
        distance: haversine(fromLat, fromLng, toLat, toLng)
      });
    }

    const routeUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${A.lng},${A.lat};${B.lng},${B.lat}` +
      `?overview=full&geometries=geojson`;

    const r = await fetch(routeUrl, {
      headers: { "User-Agent": "Hadamat-Taxi" }
    });

    const data = await r.json();
    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: "routing failed" });
  }
}

// 🔢 Расстояние по прямой (км)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  return +(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
}
