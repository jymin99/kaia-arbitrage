//quote endpoint는 인증이 필요해서 whitelisting 목록에 추가되어야 endpoint에서 정보 가져올 수 있음
// import "dotenv/config";
// import { ethers } from "ethers";
// import crypto from "node:crypto";
// import { URL } from "node:url";
// import {signTypedData,SignTypedDataVersion} from '@metamask/eth-sig-util';
// import axios from "axios";

// const privatekey = process.env.WALLET_PRIVATE_KEY;

// console.log("priveKey:",privatekey);

// const REFERRER = {
//   account: "0xd4913ab881Ca0a79d3A18a7457F1EEa08F80d86D",
//   privateKey: Buffer.from(privatekey!, "hex"),
// };

// const fetch = async (url: string): Promise<void> => {
//   try {
//     const response = await axios.get(url);
//     console.log(response.data); // 응답 데이터를 출력합니다.
//   } catch (error) {
//     console.error("Error:", error); // 오류가 발생하면 출력합니다.
//   }
// };

// // message의 타입 정의
// interface QuoteMessage {
//   issuedAt: number;
//   slippage: string;
//   from: string;
//   to: string;
//   tokenInAddress: string;
//   tokenOutAddress: string;
//   amount: string;
//   referrerFeeToken: string;
//   referrerFee: string;
//   referrerFeeTo: string;
//   payWithSCNR: boolean;
// }

// const quote = async (message: QuoteMessage): Promise<void> => {
//   const salt = "0x" + crypto.randomBytes(32).toString("hex");

//   const signature = signTypedData({
//     privateKey: REFERRER.privateKey,
//     data: {
//       domain: {
//         name: "Swapscanner Navigator",
//         version: "v2",
//         chainId: 8217,
//         verifyingContract: "0x8888888888888888888888888888888888888888",
//         salt,
//       },
//       primaryType: "QuoteRequestV2",
//       types: {
//         EIP712Domain: [
//           { name: "name", type: "string" },
//           { name: "version", type: "string" },
//           { name: "chainId", type: "uint256" },
//           { name: "verifyingContract", type: "address" },
//           { name: "salt", type: "bytes32" },
//         ],
//         QuoteRequestV2: [
//           { name: "issuedAt", type: "uint256" },
//           { name: "slippage", type: "uint16" },
//           { name: "from", type: "address" },
//           { name: "to", type: "address" },
//           { name: "tokenInAddress", type: "address" },
//           { name: "tokenOutAddress", type: "address" },
//           { name: "amount", type: "uint256" },
//           { name: "referrerFeeToken", type: "uint8" },
//           { name: "referrerFee", type: "uint16" },
//           { name: "referrerFeeTo", type: "address" },
//           { name: "payWithSCNR", type: "bool" },
//         ],
//       },
//     },
//     version: SignTypedDataVersion.V4,
//   });

//   const url = new URL('https://api.swapscanner.io/api/v2/quote');
//   url.searchParams.set('salt', salt);
//   url.searchParams.set('referrer', REFERRER.account.toLowerCase());
//   url.searchParams.set('signature', signature);
//   Object.entries(message).forEach(([key, value]) => url.searchParams.set(key, value));

//   await fetch(url.toString()); // URL을 문자열로 변환하여 호출
// };

// // quote 함수 호출
// quote({
//   issuedAt: Math.floor(Date.now() / 1000),
//   slippage: '100',
//   from: '0xd4913ab881Ca0a79d3A18a7457F1EEa08F80d86D'.toLowerCase(),
//   to: '0xd4913ab881Ca0a79d3A18a7457F1EEa08F80d86D'.toLowerCase(),
//   tokenInAddress: '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432'.toLowerCase(),
//   tokenOutAddress: '0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a'.toLowerCase(),
//   amount: '1000000',
//   referrerFeeToken: '1',
//   referrerFee: '10',
//   referrerFeeTo: '0xd4913ab881Ca0a79d3A18a7457F1EEa08F80d86D'.toLowerCase(),
//   payWithSCNR: false,
// });
