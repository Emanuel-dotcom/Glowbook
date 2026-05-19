import { google } from 'googleapis';

const SHEET_ID = '1u2JnLZbzCWiBCdZB2NLkWnr4mbBZUzag8YkX-SR1Akc';
const SHEET_NAME = 'Foaie1';

async function getSheet() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sheets = await getSheet();
    const body = req.method === 'POST' ? req.body : {};
    const action = body.action || 'getAll';

    if (action === 'getAll') {
      const r = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:J`,
      });
      const rows = r.data.values || [];
      const apts = rows.map(r => ({
        id: r[0], nume: r[1], nrTelefon: r[2], email: r[3],
        data: r[4], oraProgramarii: r[5], durata: r[6],
        tipProgramare: r[7], notite: r[8]
      })).filter(a => a.id && a.nume);
      return res.status(200).json(apts);
    }

    if (action === 'add') {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:J`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            body.id, body.nume, body.nrTelefon, body.email,
            body.data, body.oraProgramarii, body.durata,
            body.tipProgramare, body.notite, new Date().toISOString()
          ]]
        }
      });
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      const r = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:A`,
      });
      const rows = r.data.values || [];
      const rowIndex = rows.findIndex(r => String(r[0]) === String(body.id));
      if (rowIndex > 0) {
        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const sheet = sheetInfo.data.sheets.find(s => s.properties.title === SHEET_NAME);
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1
                }
              }
            }]
          }
        });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'deleteAll') {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:J`,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
