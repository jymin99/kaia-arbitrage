import 'dotenv/config';
import { ethers } from 'ethers';
import {abi as QuoterABI} from '@pancakeswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { address } from '../utils/address';

const privateKey=process.env.WALLET_PRIVATE_KEY;

const provider=new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const wallet = new ethers.Wallet(privateKey!, provider);

const quoterAddress=address.DragonswapQuoterV2Address

const quoterContract=new ethers.Contract(quoterAddress,QuoterABI,wallet);

const QuoteInputeSingle=async()=>{
    const tokenIn=address.USDTAddress;
    const tokenOut=address.USDCAddress;
    const AmountIn="10";
    const amountIn=ethers.parseUnits(AmountIn,6);
    const fee=500;

    try{
        const quoteTx=await quoterContract.getFunction("quoteExactInputSingle").staticCall({
            tokenIn,
            tokenOut,
            amountIn,
            fee,
            sqrtPriceLimitX96: 0,
    });
    console.log("결과값:",quoteTx);
        const amountOut = ethers.formatUnits(quoteTx.amountOut, 6);
        console.log(`Put ${AmountIn} USDT => Get ${amountOut} USDC`);
    }catch(error){
        console.log("quote error occurs:",error);
    }
}

QuoteInputeSingle();