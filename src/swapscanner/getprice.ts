import axios from "axios";

interface PriceData {
    [key: string]: number; // 키는 문자열이고 값은 숫자
}
async function getPrice(){
    let priceData : PriceData;
    try{
        const response=await axios.get('https://api.swapscanner.io/v1/tokens/prices');
        priceData=response.data
        for (const [key, value] of Object.entries(priceData)) {
            console.log(`${key}`);
    }
    }catch(error){
        console.log("error:",error);
    } 
};
getPrice();

