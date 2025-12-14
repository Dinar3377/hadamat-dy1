export default async function handler(req, res) {
  const { fromLat, fromLng, toLat, toLng } = req.query;

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({ error: "Missing params" });
  }

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=full&geometries=geojson`;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Hadamat-Taxi-WebApp"
      }
    });

    const data = await r.json();
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: "OSRM failed" });
  }
}
