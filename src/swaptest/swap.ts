import "dotenv/config";
import { ethers } from "ethers";
import UniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as UniswapV3RouterABI } from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"; // Uniswap V3 Router ABI
import { abi as ERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";

const privateKey = process.env.WALLET_PRIVATE_KEY;

// 카이아 프로바이더 설정
const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");
//카이아 pool contract 주소
const poolAddress = "0xb64ba987ed3bd9808dbcc19ee3c2a3c79a977e66";
//pool abi형식 맞추기
const { abi: UniswapV3PoolABI } = UniswapV3PoolArtifact;
//지갑 비밀주소
const wallet = new ethers.Wallet(privateKey!, provider);
//dragonswap router 주소
const routerAddress = "0xA324880f884036E3d21a09B90269E1aC57c7EC8a";
// 계약 인스턴스 생성
const routerContract = new ethers.Contract(
  routerAddress,
  UniswapV3RouterABI,
  wallet
);

//pancakeswap
// const provider=new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
// const routerAddress="0x1b81D678ffb9C0263b24A97847620C99d213eB14";
// // const { abi: UniswapV3PoolABI } = UniswapV3PoolArtifact;
// const wallet = new ethers.Wallet(privateKey!, provider);
// const routerContract=new ethers.Contract(routerAddress,UniswapV3RouterABI,wallet);





// const poolContract = new ethers.Contract(poolAddress, UniswapV3PoolABI, provider);


// 스왑 함수
const swapExactInputSingle = async () => {
  // const token0 = await poolContract.token0();
  // const token1 = await poolContract.token1();
  
  const tokenIn="0x19aac5f612f524b754ca7e7c41cbfa2e981a4432";//wklay
  const tokenOut="0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2";//usdt
  const fee=500;//0.01%
  const recipient=wallet.address;
  const amountIn=ethers.parseUnits("10",18);
  const amountOutMinimum=ethers.parseUnits("1",6);
  const deadline=Math.floor(Date.now()/1000)+60*10;

  try {
    const tokenContract = new ethers.Contract(tokenIn, ERC20ABI, wallet);
    const approveTx = await tokenContract.approve(routerAddress,amountIn);
    await approveTx.wait();
    console.log("Token approved");

    const swapTx=await routerContract.exactInputSingle({
      tokenIn, // 입력할 토큰 주소
      tokenOut, // 교환할 토큰 주소
      fee, // 수수료 (0.3%)
      recipient, // 수신자 주소
      amountIn, // 스왑할 양 (1.0 토큰)
      amountOutMinimum, // 최소 수량
      sqrtPriceLimitX96: 0, // 가격 제한 (0이면 제한 없음)
      deadline, // 10분 후
    });
    // exactInputSingle 함수 호출
    const receipt = await swapTx.wait();
    console.log("스왑 완료:", receipt);
  } catch (error) {
    console.error("스왑 중 오류 발생:", error);
  }
};

// 스왑 실행
swapExactInputSingle();
