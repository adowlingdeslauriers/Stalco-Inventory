import { fetchEndpoint } from "../../3plApi/fetchingAPI.js";

const fetchCustomerDetailPage = async (page, accessToken) => {
    const url = `https://secure-wms.com/customers?pgsiz=100&pgnum=${page}&facilityid=1&sort=+companyInfo.companyName`;
    const data = await fetchEndpoint(url, accessToken);
    return {
        totalResults: data.totalResults,
        item: data._embedded["http://api.3plCentral.com/rels/customers/customer"].map(item => ({ 
            "customerId": item.readOnly.customerId, 
            "companyName": item.companyInfo.companyName, 
            "deactivated": item.readOnly.deactivated 
        }))
    };

};

const fetchCustomerDetailAllPages = async (accessToken) => {
    let page = 1;
    let consolidatedData;
    let allPages = [];
    let pagePromises = [];
    let pageSize = 100;
    let totalPages;
    let totalResults = 0;

   
        try {
            const firstFetch = await fetchCustomerDetailPage(page, accessToken);
            totalResults = firstFetch.totalResults;
            console.log("TOTAL RESULTS:", totalResults)
            totalPages = Math.ceil(totalResults / pageSize);
            console.log("TOTAL PAGES", totalPages);
            
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }

     while (page < totalPages) {
        try {
            pagePromises.push(fetchCustomerDetailPage(page, accessToken));
            page++;
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }
    }

    try {
        const pages = await Promise.all(pagePromises);
        consolidatedData = pages.flatMap(obj => obj.item);
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
    }

    return consolidatedData;
};

export { fetchCustomerDetailAllPages, fetchCustomerDetailPage };
