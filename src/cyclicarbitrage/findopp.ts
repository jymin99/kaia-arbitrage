//일단 dragon swap에서만
import { ethers } from "ethers";
import {abi as FactoryABI} from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Factory.sol/PancakeV3Factory.json';
import { address } from "../utils/address";

const factoryAddress=address.DragonswapV3FactoryAddress;

const provider = new ethers.JsonRpcProvider("https://public-en.node.kaia.io");

const factoryContract=new ethers.Contract(factoryAddress,FactoryABI,provider);

const getPoolInfo=async()=>{
    try{
        const getInfo=await factoryContract.getPool({
        })
        const poolInfo=getInfo();
        console.log("result:",poolInfo);
    }catch(error){
        console.log("error occurs:",error);
    }
};

