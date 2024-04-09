import axios from 'axios';
import separateOffSiteInventory from '../utils/separateOffSiteInventory.js';
import { fetchStockDetailAllPages } from './PageLogic/fetchStockDetailsPage.js';
import { access } from 'fs';
import { fetchCustomerDetailAllPages } from './PageLogic/fetchCustomerDetailsPage.js';
import extractCustomerDetails from '../utils/extractCutomerDetails.js';

export interface Token {
    access_token: string;
}

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
        console.log("FETCHED ALL DATA")
        return separateOffSiteInventory(result);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const fetchAllCustomerNames = async(accessToken) => {
    try {
        const result = await fetchCustomerDetailAllPages(accessToken);
        console.log("FETCHED ALL DATA")
        // console.log(result)
        return extractCustomerDetails(result);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
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


export { fetchAndProcessStorageData, fetchEndpoint, fetchAllCustomerNames  };