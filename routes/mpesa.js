import express from "express";
import { initiateStkPush } from "../utils/mpesaClient.js";

const router = express.Router();

router.post("/stkpush", async (req, res) => {
  try {
    const { amount, phoneNumber, accountReference, transactionDesc } = req.body;

    const formattedPhone = phoneNumber.startsWith("254")
      ? phoneNumber
      : phoneNumber.replace(/^0/, "254");

    const result = await initiateStkPush({
      amount,
      phoneNumber: formattedPhone,
      accountReference,
      transactionDesc,
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/callback", express.json(), (req, res) => {
  console.log("Daraja callback:", JSON.stringify(req.body, null, 2));
  res.status(200).send({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default router;
