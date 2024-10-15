import 'dotenv/config';
import { ethers } from 'ethers';
import {abi as QuoterABI} from '@pancakeswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { address } from '../utils/address';

const privateKey=process.env.WALLET_PRIVATE_KEY;

const provider=new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const wallet = new ethers.Wallet(privateKey!, provider);

const quoterAddress=address.DragonswapQuoterV2Address

const quoterContract=new ethers.Contract(quoterAddress,QuoterABI,wallet);

const usdctousdt=500;
const usdttoweth=1000;

const tokenIn=address.WETHAddress;
const tokenMid=address.USDTAddress
const tokenOut=address.USDCAddress;

const path=ethers.concat([
    tokenOut,ethers.toBeHex(usdctousdt,3),
    tokenMid,ethers.toBeHex(usdttoweth,3),
    tokenIn
    // tokenIn,ethers.toBeHex(usdttoweth,3),
    // tokenMid,ethers.toBeHex(usdctousdt,3),
    // tokenOut
]);

const QuoteOutput=async()=>{
    const AmountOut="10";
    const amountOut=ethers.parseUnits(AmountOut,6);

    try{
        const quoteInput=await quoterContract.getFunction("quoteExactOutput").staticCall(
            path,
            amountOut,
        );
        const amountIn=ethers.formatUnits(quoteInput.amountIn,18);
        console.log(`Put ${amountIn} WETH => Get ${AmountOut} USDC`);
    }catch(error){
        console.log("quote fetch error:",error);
    }
};
QuoteOutput();