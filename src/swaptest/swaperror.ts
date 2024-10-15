import "dotenv/config";
import { ethers } from "ethers";
import UniswapV3SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"; // Uniswap V3 Router ABI
// import { abi as ERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import ERC20ABI from './ERC20ABI.json';

// 이더리움 프로바이더 설정
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
//uniswap router 주소
const routerAddress="0xE592427A0AEce92De3Edee1F18E0157C05861564"
//지갑 생성
const privateKey = process.env.WALLET_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey!, provider);
// 계약 인스턴스 생성
const{abi:uniswapV3SwapRouterABI}=UniswapV3SwapRouterArtifact;
const routerContract = new ethers.Contract(routerAddress,uniswapV3SwapRouterABI,wallet);

// 스왑 함수
const SwapSingleInput = async () => {

const tokenIn = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const tokenOut = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const fee=500;
const recipient=wallet.address;
const deadline= Math.floor(Date.now() / 1000) + 60 * 10;//10분
const amountIn=ethers.parseUnits("0.0005", 18);
const amountOutMinimum=ethers.parseUnits("0.5",6);

  try {
    const tokenInContract = new ethers.Contract(tokenIn, ERC20ABI, wallet);

    const approvalTx = await tokenInContract.approve(routerAddress,amountIn);
    await approvalTx.wait();
    console.log("Token approved");

    const swapTx =await routerContract.exactInputSingle( {
      tokenIn, // 입력할 토큰 주소
      tokenOut, // 교환할 토큰 주소
      fee, // 수수료 (0.3%=3000)
      recipient, // 수신자 주소
      deadline,
      amountIn,// 스왑할 양 (1.0 토큰)
      amountOutMinimum, // 최소 수량
      sqrtPriceLimitX96: 0, // 가격 제한 (0이면 제한 없음)
    });
    const receipt = await swapTx.wait();
    console.log("스왑 완료:", receipt);
  } catch (error) {
    console.error("스왑 중 오류 발생:", error);
  }
};

SwapSingleInput();
