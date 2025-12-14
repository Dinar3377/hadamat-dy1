export default async function handler(req, res) {
  const { fromLat, fromLng, toLat, toLng } = req.query;
  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({ ok:false, error:"Missing params" });
  }

  const routeUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=full&geometries=geojson&alternatives=false&steps=false`;

  try {
    const r = await fetch(routeUrl, { headers: { "User-Agent": "Hadamat-Taxi" } });
    const j = await r.json();

    const route = j?.routes?.[0];
    if (!route?.geometry) {
      return res.status(200).json({ ok:false, error:"Маршрут по дорогам не найден. Выберите точки ближе к улице." });
    }

    return res.status(200).json({
      ok: true,
      distance_km: +(route.distance / 1000).toFixed(2),
      geometry: route.geometry
    });
  } catch (e) {
    return res.status(200).json({ ok:false, error:"route failed" });
  }
}
