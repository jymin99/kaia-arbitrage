import {quote} from './calculate';
import { ethers } from 'ethers';
import tokens from "../../utils/token_address";
// import {abi as ERC20ABI} from '@openzeppelin/contracts/build/contracts/ERC20.json';

// const provider=new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const amountIn=1000000;

// const tokenDecimal=async(tokenInAddress:string,tokenOutAddress:string)=>{
//     const tokenInContract=new ethers.Contract(tokenInAddress,ERC20ABI,provider);
//     const tokenOutContract=new ethers.Contract(tokenOutAddress,ERC20ABI,provider);
//     const tokenInDecimal=Number(await tokenInContract.decimals());
//     const tokenOutDecimal=Number(await tokenOutContract.decimals());
//     return [tokenInDecimal,tokenOutDecimal];

// }

const executeQuote = async (tokenInAddress:string, tokenOutAddress:string,amountIn:number) => {
  await quote({
    issuedAt: Math.floor(Date.now() / 1000),
    slippage: '100',
    from: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
    to: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
    tokenInAddress: tokenInAddress.toLowerCase(),
    tokenOutAddress: tokenOutAddress.toLowerCase(),
    amount: `${amountIn}`,//넣어주는 값을 해당 토큰의 decimal로 나눠줘야함.
    referrerFeeToken: '1',
    referrerFee: '10',
    referrerFeeTo: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
    payWithSCNR: false,
  });
};

const executeQuteReturn=async(tokenInAddress:string, tokenOutAddress:string,amountIn:number) => {
    await quote({
      issuedAt: Math.floor(Date.now() / 1000),
      slippage: '100',
      from: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
      to: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
      tokenInAddress: tokenInAddress.toLowerCase(),
      tokenOutAddress: tokenOutAddress.toLowerCase(),
      amount: `${amountIn}`,//넣어주는 값을 해당 토큰의 decimal로 나눠줘야함.
      referrerFeeToken: '1',
      referrerFee: '10',
      referrerFeeTo: '0xd4913ab881ca0a79d3a18a7457f1eea08f80d86d'.toLowerCase(),
      payWithSCNR: false,
    });
  };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const findOpportunity=async()=>{
    const tokenKeys=tokens;
    if(tokenKeys){
        for (let i=1;i<tokenKeys.length-1;i++){
            for(let j=2;j<tokenKeys.length;j++){
                const tokenInAddress=tokenKeys[i];
                const tokenOutAddress=tokenKeys[j];
                const amountMid=await executeQuote(tokenInAddress,tokenOutAddress,amountIn);

                // const tokenDecimalValue=await tokenDecimal(tokenInAddress,tokenOutAddress);
                // const tokenDecimalIn=tokenDecimalValue[0];
                // const tokenDecimalOut=tokenDecimalValue[1];

                if(amountMid!=null){
                    const amountOut=await executeQuote(tokenOutAddress,tokenInAddress,amountMid);
                    if (amountOut!=null&&amountOut>amountIn){
                        console.log("find arbigtrage opportunity!!");
                        console.log(`exchanging token ${tokenInAddress}-${tokenOutAddress} makes profit`);
                    }else{
                        console.log("Arbitrage opportunity did not occur.");
                    }
                }else{
                    continue;
                }
                await delay(250);//1초 dealy
            }
        }
    }else{
        console.log("no tokens are available");
    }
}
findOpportunity();


