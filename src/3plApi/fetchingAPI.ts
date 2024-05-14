import axios from 'axios';
import separateOffSiteInventory from '../utils/separateOffSiteInventory.js';
import { fetchStockDetailAllPages } from './PageLogic/fetchStockDetailsPage.js';
import { access } from 'fs';
import { fetchCustomerDetailAllPages } from './PageLogic/fetchCustomerDetailsPage.js';
import extractCustomerDetails from '../utils/extractCutomerDetails.js';
import { checkToken } from './tokenHandler.js';
import { updateReplenishmentFlags } from '../services/replenishmentService.js';

export interface Token {
    access_token: string;
}

const authKey: string = 'MGMyMzllMTgtYmM0YS00NDA3LThmMmUtODAwYWE2MjQ5OTlhOnRaQVhJV29YYlpBUXVZbFJYM05JM3RUL3E3WXBWY0VF';
const tpl: string = '{8f403968-22c2-46f2-8942-6aaa7b846398}';
const userLoginId: string = '1055';


const fetchEndpoint = async (url, accessToken) => {
    const headers = {
        'Host': 'secure-wms.com',
        'Content-Type': 'application/hal+json; charset=utf-8',
        'Accept': 'application/hal+json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept-Language': 'en-US,en;q=0.8',
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching endpoint:', error);
        throw error;
    }
};


const fetchAndProcessStorageData = async (accessToken, customerId) => {
    try {
        const result = await fetchStockDetailAllPages(accessToken,customerId);
        // console.log("FETCHED ALL DATA", result)
        return separateOffSiteInventory(result);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const fetchAllCustomerNames = async(accessToken) => {
    try {
        const result = await fetchCustomerDetailAllPages(accessToken);
        // console.log("FETCHED ALL DATA")
        return extractCustomerDetails(result);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


const fetchAndUpdateFlagsByClient = async(customerId) => {
    const token: Token = await checkToken(authKey, tpl, userLoginId);
    const accessToken: string = token.access_token;
    const result = await fetchAndProcessStorageData(accessToken, customerId);
    
    await updateReplenishmentFlags(result.detail, customerId );
    console.log("Updated replenishment data for client ID:", customerId)
}



// const fetchAndProcessInventory = async (url, accessToken) => {
//     try {
//         const result = await fetchEndpoint(url, accessToken);
//         console.log(result)
//         return separateOffSiteInventory(result);
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
// };


export { fetchAndProcessStorageData, fetchEndpoint, fetchAllCustomerNames, fetchAndUpdateFlagsByClient  };