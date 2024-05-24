import { fetchEndpoint } from "../fetchingAPI.js";
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { fileURLToPath } from 'url';
import { filterOrdersData } from "../../utils/orders/filterOrderData.js";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fetch a single page
const fetchOrderDetailsPage = async (pageNumber, pageSize, accessToken) => {
    const url = `https://secure-wms.com/orders?pgsiz=${pageSize}&pgnum=${pageNumber}&rql=readonly.processDate=gt=2024-04-01T17:16:00;readonly.processDate=lt=2024-04-30T17:17:59&detail=All&itemdetail=All`;
    try {
        const data = await fetchEndpoint(url, accessToken);
        if (!data || !data._embedded) {
            console.error(`Invalid data structure / Empty data received from the API: ${JSON.stringify(data)}`);
            return {
                totalResults: 0,
                items: []
            };
        }
        return {
            totalResults: data.totalResults,
            items: data._embedded["http://api.3plCentral.com/rels/orders/order"]
        };
    } catch (error) {
        console.error(`Error fetching data from API: ${error.message}`);
        throw error;
    }
};

// Function to fetch all pages concurrently
const fetchOrderDetailsAllPages = async (accessToken, concurrency = 100) => {
    let totalResults = 0;
    let totalPages = 0;
    const pageSize = 1000;
    const allData = [];

    try { 
        // Fetch the first page to get the total number of results
        const firstFetch = await fetchOrderDetailsPage(1, 1, accessToken);
        totalResults = firstFetch.totalResults;
        totalPages = Math.ceil(totalResults / pageSize);

        console.log("TOTAL RESULTS:", totalResults);
        console.log("TOTAL PAGES:", totalPages);

        // Fetch remaining pages in batches
        const fetchPagesInBatches = async (startPage, endPage) => {
            const pagePromises = [];
            for (let page = startPage; page <= endPage; page++) {
                pagePromises.push(fetchOrderDetailsPage(page, pageSize, accessToken));
                console.log("Fetching page :" ,page)
            }
            console.log("Fetching a batch");
            return Promise.all(pagePromises);
        };

        for (let currentPage = 1; currentPage <= totalPages; currentPage += concurrency) {
            const endPage = Math.min(currentPage + concurrency - 1, totalPages);
            try {
                const pageResults = await fetchPagesInBatches(currentPage, endPage);
                allData.push(...pageResults.flatMap(result => result.items || []));
            } catch (error) {
                console.error(`Error fetching batch starting from page ${currentPage}:`, error);
                throw error;
            }
        }
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
    }

    // Save the data to a CSV file
    const filterData = filterOrdersData(allData)
    await saveDataToCSV(filterData);

    return filterData;
};

// Function to save data to a CSV file
const saveDataToCSV = async (data) => {
    const monthName = "April"; // Replace this with logic to determine the correct month name
    const filePath = path.join(__dirname, 'Data', `${monthName}.csv`);

    // Create the directory if it doesn't exist
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: Object.keys(data[0] || {}).map(key => ({ id: key, title: key }))
    });

    try {
        await csvWriter.writeRecords(data);
        console.log(`Data successfully saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving data to CSV: ${error.message}`);
        throw error;
    }
};

export { fetchOrderDetailsAllPages, fetchOrderDetailsPage };
