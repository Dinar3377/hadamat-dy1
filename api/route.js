async function snap(lat, lng) {
  const url =
    `https://router.project-osrm.org/nearest/v1/driving/` +
    `${lng},${lat}`;

  const r = await fetch(url);
  const j = await r.json();

  if (!j.waypoints || !j.waypoints[0]) {
    throw new Error("No road nearby");
  }

  return {
    lat: j.waypoints[0].location[1],
    lng: j.waypoints[0].location[0]
  };
}

export default async function handler(req, res) {
  const { fromLat, fromLng, toLat, toLng } = req.query;

  try {
    // 🔥 ПРИЛИПАЕМ К ДОРОГЕ
    const A = await snap(fromLat, fromLng);
    const B = await snap(toLat, toLng);

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
    return res.status(200).json({ routes: [] });
  }
}
