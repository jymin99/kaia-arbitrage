import "dotenv/config";
import crypto from "node:crypto";
import { URL } from "node:url";
import axios from "axios";
import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";

const privateKey = process.env.WALLET_PRIVATE_KEY;

//whitlisting 되어있는 계정으로 signing
const REFERRER = {
  account: process.env.SWAPSCANNER_ACCOUNT,
  privateKey: Buffer.from(privateKey!, "hex"),
};

//api 요청 type 정의
interface QuoteRequest {
  issuedAt: number;
  slippage: string;
  from: string;
  to: string;
  tokenInAddress: string;
  tokenOutAddress: string;
  amount: string;
  referrerFeeToken: string;
  referrerFee: string;
  referrerFeeTo: string;
  payWithSCNR: boolean;
}

// NOTE: ensure every hex digits are in lowercase
export const quote = async (message: QuoteRequest): Promise<number | null> => {
  // `salt` needs to be cryptographically randomly generated for every other request.
  const salt = "0x" + crypto.randomBytes(32).toString("hex");

  // sign the data (signTypedData_v4).
  const signature = signTypedData({
    privateKey: REFERRER.privateKey,
    data: {
      message: message as any,
      domain: {
        name: "Swapscanner Navigator",
        version: "v2",
        chainId: 8217,
        verifyingContract: "0x8888888888888888888888888888888888888888",
        salt,
      },
      primaryType: "QuoteRequestV2",
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
          { name: "salt", type: "bytes32" },
        ],
        QuoteRequestV2: [
          { name: "issuedAt", type: "uint256" },
          { name: "slippage", type: "uint16" },
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "tokenInAddress", type: "address" },
          { name: "tokenOutAddress", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "referrerFeeToken", type: "uint8" },
          { name: "referrerFee", type: "uint16" },
          { name: "referrerFeeTo", type: "address" },
          { name: "payWithSCNR", type: "bool" },
        ],
      },
    },
    version: SignTypedDataVersion.V4,
  });

  const url = new URL("https://api.swapscanner.io/api/v2/quote");
  url.searchParams.set("salt", salt);
  url.searchParams.set("referrer", REFERRER.account!.toLowerCase());
  url.searchParams.set("signature", signature);
  Object.entries(message).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );

  try {
    const response = await axios.get(url.toString());
    const estimatedAmount =
      response.data.quote.output.estimatedAmountDeductingFee;
    if (estimatedAmount != null) {
      return estimatedAmount;
    } else {
      console.log("liquidity is not enough");
      return null;
    }
  } catch (error) {
    console.error("Error fetching quote");
    return null;
  }
};
