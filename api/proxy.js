console.log(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const { google } = require("googleapis");

const SHEET_ID = "1u2JnLZbzCWiBCdZB2NLkWnr4mbBZUzag8YkX-SR1Akc";
const SHEET_NAME = "Foaie1";

module.exports = async (req, res) => {
  try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    // GET
    if (req.method === "GET") {

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:G`,
      });

      return res.status(200).json(response.data.values || []);
    }

    // POST
    if (req.method === "POST") {

      const body = req.body;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:G`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            body.id,
            body.client,
            body.service,
            body.date,
            body.start,
            body.end,
            body.phone
          ]]
        }
      });

      return res.status(200).json({
        success: true
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
};