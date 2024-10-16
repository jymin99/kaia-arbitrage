import 'dotenv/config';
import crypto from 'node:crypto';
import { URL } from 'node:url';
import axios from 'axios';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';

const privateKey=process.env.WALLET_PRIVATE_KEY;

// while the account here does not need to have any balance, it needs to be a valid address.
const REFERRER = {
  account: process.env.SWAPSCANNER_ACCOUNT,
  privateKey: Buffer.from(privateKey!, 'hex'),
};

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
const quote = async (message: QuoteRequest): Promise<void> => {
  // `salt` needs to be cryptographically randomly generated for every other request.
  const salt = '0x' + crypto.randomBytes(32).toString('hex');

  // sign the data (signTypedData_v4).
  const signature = signTypedData({
    privateKey: REFERRER.privateKey,
    data: {
      message: message as any,
      domain: {
        name: 'Swapscanner Navigator',
        version: 'v2',
        chainId: 8217,
        verifyingContract: '0x8888888888888888888888888888888888888888',
        salt,
      },
      primaryType: 'QuoteRequestV2',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
          { name: 'salt', type: 'bytes32' },
        ],
        QuoteRequestV2: [
          { name: 'issuedAt', type: 'uint256' },
          { name: 'slippage', type: 'uint16' },
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenInAddress', type: 'address' },
          { name: 'tokenOutAddress', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'referrerFeeToken', type: 'uint8' },
          { name: 'referrerFee', type: 'uint16' },
          { name: 'referrerFeeTo', type: 'address' },
          { name: 'payWithSCNR', type: 'bool' },
        ],
      },
    },
    version: SignTypedDataVersion.V4,
  });

  const url = new URL('https://api.swapscanner.io/api/v2/quote');
  url.searchParams.set('salt', salt);
  url.searchParams.set('referrer', REFERRER.account!.toLowerCase());
  url.searchParams.set('signature', signature);
  Object.entries(message).forEach(([key, value]) => url.searchParams.set(key, value));

  try {
    const response = await axios.get(url.toString());
    // console.log(response.data);
    console.log(JSON.stringify(response.data, null, 2)); // 전체 응답 출력

  } catch (error) {
    console.error('Error fetching quote:', error);
  }
};

quote({
  issuedAt: Math.floor(Date.now() / 1000),
  slippage: '100',
  from: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
  to: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
  tokenInAddress: '0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2'.toLowerCase(),
  tokenOutAddress: '0x02cbe46fb8a1f579254a9b485788f2d86cad51aa'.toLowerCase(),
  amount: '1000000',
  referrerFeeToken: '1',
  referrerFee: '10',
  referrerFeeTo: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
  payWithSCNR: false,
});

