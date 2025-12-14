export default async function handler(req, res) {
  const { fromLat, fromLng, toLat, toLng } = req.query;

  const url =
    `https://router.project-osrm.org/route/v1/driving/`+
    `${fromLng},${fromLat};${toLng},${toLat}`+
    `?overview=full&geometries=geojson`;

  const r = await fetch(url, {
    headers: { "User-Agent": "Hadamat-Taxi" }
  });

  const data = await r.json();
  res.status(200).json(data);
}
