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
    tokenIn,ethers.toBeHex(usdttoweth,3),
    tokenMid,ethers.toBeHex(usdctousdt,3),
    tokenOut
]);

const QuoteInput=async()=>{
    const AmountIn="10";
    const amountIn=ethers.parseUnits(AmountIn,18);

    try{
        const quoteOutput=await quoterContract.getFunction("quoteExactInput").staticCall(
            path,
            amountIn,
        );
        const amountOut=ethers.formatUnits(quoteOutput.amountOut,6);
        console.log(`Put ${AmountIn} WETH => Get ${amountOut} USDC`);
    }catch(error){
        console.log("quote fetch error:",error);
    }
};
QuoteInput();