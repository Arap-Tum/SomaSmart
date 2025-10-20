import fetch from "node-fetch";

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const BASE =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  const url = `${BASE}/oauth/v1/generate?grant_type=client_credentials`;
  const basic = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const res = await fetch(url, {
    headers: { Authorization: `Basic ${basic}` },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

export function getTimestamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

export function generatePassword(shortcode, passkey, timestamp) {
  const str = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(str).toString("base64");
}

export async function initiateStkPush({
  amount,
  phoneNumber,
  accountReference,
  transactionDesc,
}) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(
    process.env.MPESA_SHORTCODE,
    process.env.MPESA_PASSKEY,
    timestamp
  );

  const url = `${BASE}/mpesa/stkpush/v1/processrequest`;

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phoneNumber, // customer phone (2547XXXXXXXX)
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: accountReference || "CompanyXYZ",
    TransactionDesc: transactionDesc || "Payment",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data;
}
