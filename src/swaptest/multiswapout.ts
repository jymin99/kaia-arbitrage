import 'dotenv/config';
import { ethers } from "ethers";
import { abi as UniswapV3RouterABI } from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"; // Uniswap V3 Router ABI
import {abi as ERC20ABI} from '@openzeppelin/contracts/build/contracts/ERC20.json';

const privateKey = process.env.WALLET_PRIVATE_KEY;

// 이더리움 프로바이더 설정
const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

// 코인 contract 주소
const USDC = "0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a";
const USDT = "0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2";
const WETH = "0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1";
// 지갑 비밀주소
const wallet = new ethers.Wallet(privateKey!, provider);
//dragonswap router 주소
const routerAddress = "0xA324880f884036E3d21a09B90269E1aC57c7EC8a";
// 계약 인스턴스 생성
const routerContract = new ethers.Contract(routerAddress, UniswapV3RouterABI, wallet);

// 거래 수수료
const usdctousdt=500;
const usdttoweth=1000;

// 스왑 함수
const swapExactOutputMultihop = async () => {
    // 경로 생성 (WETH -> USDC -> BTCB)
    const path = ethers.concat([
        USDC,ethers.toBeHex(usdctousdt,3),
        USDT,ethers.toBeHex(usdttoweth,3),
        WETH
    ]);
    const deadline= Math.floor(Date.now() / 1000) + 60 * 10;//10분 후
    const amountOut=ethers.parseUnits("0.1",6);
    const amountInMaximum=ethers.parseUnits("1",18);
    const recipient=wallet.address;

    try{
    const tokenInContract = new ethers.Contract(WETH, ERC20ABI, wallet);
    const approveTx = await tokenInContract.approve(routerAddress, amountInMaximum);
    await approveTx.wait();

    const swapTx = await routerContract.exactOutput ({
        path,
        recipient,
        deadline, 
        amountOut,
        amountInMaximum,
    });

    // 스왑을 실행합니다.
    const receipt = await swapTx.wait();
    console.log("Swap transaction successful:", receipt);
}catch(error){
    console.error("Transaction failed:", error);
}
};

swapExactOutputMultihop();
