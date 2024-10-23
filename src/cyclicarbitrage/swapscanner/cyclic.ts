import { quote } from "./calculate";
import { ethers } from "ethers";
import { abi as ERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import tokens from "../../utils/token_address";

const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const executeQuote = async (
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: BigInt,
) => {
  return await quote({
    issuedAt: Math.floor(Date.now() / 1000),
    slippage: "100",
    from: "0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d".toLowerCase(),
    to: "0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d".toLowerCase(),
    tokenInAddress: tokenInAddress.toLowerCase(),
    tokenOutAddress: tokenOutAddress.toLowerCase(),
    amount: `${amountIn}`, // 해당 토큰의 decimal로 나눠줘야함.
    referrerFeeToken: "1",
    referrerFee: "10",
    referrerFeeTo: "0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d".toLowerCase(),
    payWithSCNR: false,
  });
};

const getTokenDecimal = async (tokenIn: string) => {
  const tokenInContract = new ethers.Contract(tokenIn, ERC20ABI, provider);
  const tokenInDecimal = Number(await tokenInContract.decimals());
  return tokenInDecimal;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findOpportunity = async () => {
    const tokenKeys = tokens;
    if (tokenKeys) {
        const tokenAddresses = tokens;

        for (let i = 0; i < tokenAddresses.length - 2; i++) {
            for (let j = i + 1; j < tokenAddresses.length - 1; j++) {
                for (let k = j + 1; k < tokenAddresses.length; k++) {
                    const tokenA = tokenAddresses[i];
                    const tokenB = tokenAddresses[j];
                    const tokenC = tokenAddresses[k];

                    const paths = [
                        [tokenA, tokenB, tokenC],
                        [tokenA, tokenC, tokenB],
                        [tokenB, tokenA, tokenC],
                        [tokenB, tokenC, tokenA],
                        [tokenC, tokenA, tokenB],
                        [tokenC, tokenB, tokenA],
                    ];

                    for (const [a, b, c] of paths) {
                        const decimalA=await getTokenDecimal(a);
                        const amountIn = ethers.parseUnits("1", decimalA);
                        const amountAB = await executeQuote(a, b, BigInt(amountIn));
                        if (amountAB != null) {
                            const amountBC = await executeQuote(b, c, BigInt(amountAB));
                            if (amountBC != null) {
                                const amountOut = await executeQuote(c, a, BigInt(amountBC));
                                if (amountOut != null && amountOut > amountIn) {
                                    console.log("Find arbitrage opportunity!!");
                                    console.log(`Exchanging tokens ${a} -> ${b} -> ${c} -> ${a} makes profit`);
                                    console.log(`Profit Amount: ${(amountOut - Number(amountIn))/(10**decimalA)}`);
                                }else{
                                    console.log('Arbitrage opportunity did not occur')
                                }
                            }
                        }
                        await delay(250); // 250ms delay
                    }
                }
            }
        }
    } else {
        console.log("No tokens are available");
    }
};
findOpportunity();
