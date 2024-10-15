import 'dotenv/config';
import { ethers } from 'ethers';
import {abi as QuoterABI} from '@pancakeswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { address } from '../utils/address';

const privateKey=process.env.WALLET_PRIVATE_KEY;

const provider=new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const wallet = new ethers.Wallet(privateKey!, provider);

const quoterAddress=address.DragonswapQuoterV2Address

const quoterContract=new ethers.Contract(quoterAddress,QuoterABI,wallet);

const QuoteOutputSingle=async()=>{
    const tokenIn=address.USDTAddress;
    const tokenOut=address.USDCAddress;
    const AmountOut="10";
    const amount=ethers.parseUnits(AmountOut,6);//변수명 ABI에 맞게 바꿔주기
    const fee=500;

    try{
        const quoteInput=await quoterContract.getFunction("quoteExactOutputSingle").staticCall({
            tokenIn,
            tokenOut,
            fee,
            amount,
            sqrtPriceLimitX96: 0,
        });
        const amountIn=ethers.formatUnits(quoteInput.amountIn,6);
        console.log(`Put ${amountIn} USDT => Get ${amount} USDC`);

    }catch(error){
        console.log("fetching fail:",error);
    }

}
QuoteOutputSingle();