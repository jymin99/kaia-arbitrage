import { quote } from './calculate';
import { ethers } from 'ethers';
import { abi as ERC20ABI } from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { tokens } from '../../utils/tokenaddress';

const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const amountIn = 1000000;

const executeQuote = async (tokenInAddress: string, tokenOutAddress: string, amountIn: number) => {
    return await quote({
        issuedAt: Math.floor(Date.now() / 1000),
        slippage: '100',
        from: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
        to: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
        tokenInAddress: tokenInAddress.toLowerCase(),
        tokenOutAddress: tokenOutAddress.toLowerCase(),
        amount: `${amountIn}`, // 해당 토큰의 decimal로 나눠줘야함.
        referrerFeeToken: '1',
        referrerFee: '10',
        referrerFeeTo: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
        payWithSCNR: false,
    });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const findOpportunity = async () => {
    const tokenKeys = tokens;
    if (tokenKeys) {
        const tokenAddresses = Object.keys(tokenKeys);

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
                        const amountAB = await executeQuote(a, b, amountIn);
                        if (amountAB != null) {
                            const amountBC = await executeQuote(b, c, amountAB);
                            if (amountBC != null) {
                                const amountCA = await executeQuote(c, a, amountBC);
                                if (amountCA != null && amountCA > amountIn) {
                                    console.log("Find arbitrage opportunity!!");
                                    console.log(`Exchanging tokens ${a} -> ${b} -> ${c} -> ${a} makes profit`);
                                    console.log(`Profit Amount: ${amountCA - amountIn}`);
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