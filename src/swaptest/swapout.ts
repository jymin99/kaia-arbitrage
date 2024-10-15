import 'dotenv/config'
import { ethers } from "ethers";
import UniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as UniswapV3RouterABI } from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"; // Uniswap V3 Router ABI
import {abi as ERC20ABI} from '@openzeppelin/contracts/build/contracts/ERC20.json';

const privateKey = process.env.WALLET_PRIVATE_KEY;

// 이더리움 프로바이더 설정
const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");
//거래할 pool contract 주소
// const poolAddress = "0xd79539fd47089ad468a990e5075c8e1c5d724bfa";
//pool abi형식 맞추기
const { abi: UniswapV3PoolABI } = UniswapV3PoolArtifact;
//pool contract 생성
// const poolContract = new ethers.Contract(poolAddress, UniswapV3PoolABI, provider);
//거래할 token 주소 가져오기
// const getTokenAddress=async()=>{
//     const token0=await poolContract.token0();
//     const token1=await poolContract.token1();
//     return{token0,token1};
// };
//지갑 비밀주소
const wallet=new ethers.Wallet(privateKey!,provider);
//dragonswap router 주소
const routerAddress = "0xA324880f884036E3d21a09B90269E1aC57c7EC8a";
// 계약 인스턴스 생성
const routerContract = new ethers.Contract(routerAddress, UniswapV3RouterABI, wallet);

// 스왑 함수
const swapWithExactOutputSingle = async () => {
    // const{token0,token1}=await getTokenAddress();
    const amountOut=ethers.parseUnits("0.1",6);
    const amountInMaximum=ethers.parseUnits("3",6)
    const deadline=Math.floor(Date.now() / 1000) + 60 * 10;
    
    const tokenIn="0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a";//usdc
    const tokenOut="0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2";//usdt

    try{
    const tokenOutContract=new ethers.Contract(tokenIn,ERC20ABI,wallet);
    const approveTx=await tokenOutContract.approve(routerAddress,amountInMaximum);
    await approveTx.wait();

    const swapTx=await routerContract.exactOutputSingle( {
        tokenIn, // 입력할 토큰 주소
        tokenOut, // 교환할 토큰 주소
        fee: 500, // 수수료 (0.3%)
        recipient: wallet.address, // 수신자 주소
        amountOut: amountOut,
        amountInMaximum:amountInMaximum, 
        deadline,
        sqrtPriceLimitX96: 0 // 가격 제한 없음
    });
        const receipt = await swapTx.wait();
        console.log("스왑 완료:", receipt);
    } catch (error) {
        console.error("스왑 중 오류 발생:", error);
    }
};

swapWithExactOutputSingle();

