import axios from "axios";
import 'dotenv/config';
import { ethers } from "ethers";
import UniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as FactoryABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
import {abi as ERC20ABI} from '@openzeppelin/contracts/build/contracts/ERC20.json';
import { address } from "../utils/address";

const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");
const factoryAddress = address.DragonswapV3FactoryAddress;
const factoryContract = new ethers.Contract(factoryAddress, FactoryABI, provider);

interface PriceData {
    [key: string]: number; // 키는 문자열이고 값은 숫자
}

const getPriceData = async (): Promise<PriceData> => {
    let priceData: PriceData = {};
    try {
        const response = await axios.get('https://api.swapscanner.io/v1/tokens/prices');
        priceData = response.data;
        console.log("가격 데이터:", priceData);
    } catch (error) {
        console.log("가격 데이터 가져오기 오류:", error);
    }
    return priceData;
};

const getPoolInfo = async (poolAddress: string) => {
    const poolContract = new ethers.Contract(poolAddress, UniswapV3PoolArtifact.abi, provider);
    const slot0 = await poolContract.slot0();
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();

    const token0Contract = new ethers.Contract(token0, ERC20ABI, provider);
    const token1Contract = new ethers.Contract(token1, ERC20ABI, provider);

    const token0Decimals = Number(await token0Contract.decimals());
    const token1Decimals = Number(await token1Contract.decimals());

    const sqrtPriceX96 = Number(slot0.sqrtPriceX96);

    return { sqrtPriceX96, token0, token1, token0Decimals, token1Decimals };
};

const calculatePriceFromSqrtPriceX96 = (
    sqrtPriceX96: number,
    token0Decimals: number,
    token1Decimals: number
): number => {
    const price = (sqrtPriceX96 / 2 ** 96) ** 2;
    return price * 10 ** (token0Decimals - token1Decimals);
};

const getPoolPrice = async (tokenA: string, tokenB: string, fee: number) => {
    try {
        const poolAddress = await factoryContract.getPool(tokenA, tokenB, fee);

        if (poolAddress === ethers.ZeroAddress) {
            console.log(`풀 정보: ${tokenA}, ${tokenB} - 풀 존재하지 않음`);
            return;
        }

        console.log(`풀 주소: ${poolAddress}`);

        const { sqrtPriceX96, token0Decimals, token1Decimals } = await getPoolInfo(poolAddress);

        const buyOneOfToken0 = calculatePriceFromSqrtPriceX96(sqrtPriceX96, token0Decimals, token1Decimals);
        const buyOneOfToken1 = 1 / buyOneOfToken0;

        console.log(`가격: ${tokenA} -> ${tokenB}: ${buyOneOfToken0}`);
        console.log(`가격: ${tokenB} -> ${tokenA}: ${buyOneOfToken1}`);
    } catch {
        console.log(`풀 정보: ${tokenA}, ${tokenB} - pool liquidity:0`);
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const main = async () => {
    const priceData = await getPriceData();
    const tokenAddresses = Object.keys(priceData);
    const fees = [500, 3000, 10000]; // Uniswap V3에서 지원하는 수수료

    for (let i = 0; i < tokenAddresses.length; i++) {
        for (let j = i + 1; j < tokenAddresses.length; j++) {
            const tokenA = tokenAddresses[i];
            const tokenB = tokenAddresses[j];
            for (const fee of fees) {
                console.log(`finding ${tokenA}-${tokenB} fee:${fee} pool ...`);
                await delay(1000); // 1초 대기
                await getPoolPrice(tokenA, tokenB, fee);
                await delay(1000); // 1초 대기

            }
        }
    }
};

main();
