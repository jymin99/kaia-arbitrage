import axios from "axios";

interface address {
    [key: string]: number; // 키는 문자열이고 값은 숫자
}
export async function getAddress(){
    let addressData : address;
    try{
        const response=await axios.get('https://api.swapscanner.io/v1/tokens/prices');
        addressData=response.data;
        return addressData;
    }catch(error){
        console.log("error:",error);
        return undefined;
    } 
};

getAddress();

