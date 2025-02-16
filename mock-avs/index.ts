/* mock-avs/index.ts */
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// A super-simple "AI" that returns high risk if the token is "new" or "scam"
app.post("/classify", async (req: Request, res: Response): Promise<void> => {
  const { tokenAddress, functionSignature } = req.body;

  // We'll just do a naive logic: if tokenAddress is "new" or functionSignature is "mint"/"removeLiquidity" => high risk
  let riskScore = 0;
  if (!tokenAddress) {
    res.status(400).json({ error: "Missing tokenAddress" });
  }

  // Very naive logic:
  if (functionSignature === "removeLiquidity" || functionSignature === "mint") {
    riskScore += 70;
  }
  if (tokenAddress.includes("new")) {
    riskScore += 30;
  }

  // clamp
  if (riskScore > 100) riskScore = 100;

  const classification = riskScore > 50 ? "MALICIOUS" : "SAFE";

  // Return result
  res.json({
    classification,
    riskScore,
    signature: "0xMockSignature", // pretend we sign it
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock AVS server running on http://localhost:${PORT}`);
});
