const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzni0iD3GO51CXB3o8GJ8_16u6Fkbv3S_l_Uys73qsi5A8TuanH5DIaJchlU70BZlT6RQ/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let url = SCRIPT_URL;
    let options = { method: 'GET' };

    if (req.method === 'POST') {
      const body = req.body;
      const params = new URLSearchParams({ data: JSON.stringify(body) });
      url = SCRIPT_URL + '?' + params.toString();
    }

    const response = await fetch(url, options);
    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(200).send(text);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
