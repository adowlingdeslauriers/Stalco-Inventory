import { fetchEndpoint } from "../../3plApi/fetchingAPI.js";

const fetchCustomerDetailPages = async (page, accessToken) => {
    const url = `https://secure-wms.com/customers?pgsiz=100&pgnum=${page}&facilityid=1&sort=+companyInfo.companyName`;
    const data = await fetchEndpoint(url, accessToken);
    return {
        totalResults: data.totalResults,
        item: {
           "companyId": data._embedded.readonly.customerId,
           "companyName": data._embedded.companyInfo.companyName,
           "deactivated": data._embedded.readonly.deactivated,
        }
    };

};

const fetchCustomerDetailAllPages = async (accessToken) => {
    let page = 1;
    let consolidatedData;
    let allPages = [];
    let pagePromises = [];
    let pageSize = 500;
    let totalPages;
    let totalResults = 0;

   
        try {
            const firstFetch = await fetchCustomerDetailPages(page, accessToken);
            totalResults = firstFetch.totalResults;
            console.log("TOTAL RESULTS:", totalResults)
            totalPages = Math.ceil(totalResults / pageSize);
            console.log("Total PAGES", totalPages);
            
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }

     while (page < totalPages) {
        try {
            pagePromises.push(fetchCustomerDetailPages(page, accessToken));
            page++;
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }
    }

    try {
        const pages = await Promise.all(pagePromises);
        consolidatedData = pages.flatMap(obj => obj.item);
        // console.log(allPages);
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
    }

    return consolidatedData;
};

export { fetchCustomerDetailAllPages, fetchCustomerDetailPages };
