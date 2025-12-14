export default async function handler(req, res) {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ ok:false, error:"Missing lat/lng" });

  // Больший радиус — критично для РФ (дворы/частные дороги)
  const url = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?radius=5000`;

  try {
    const r = await fetch(url, { headers: { "User-Agent": "Hadamat-Taxi" } });
    const j = await r.json();

    const wp = j?.waypoints?.[0];
    if (!wp?.location) return res.status(200).json({ ok:false, error:"No road nearby" });

    return res.status(200).json({
      ok: true,
      lng: wp.location[0],
      lat: wp.location[1]
    });
  } catch (e) {
    return res.status(200).json({ ok:false, error:"nearest failed" });
  }
}
