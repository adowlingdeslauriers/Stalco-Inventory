import NodeCache from 'node-cache';
import { fetchAllCustomerNames, Token } from "../3plApi/fetchingAPI.js";
import { checkToken } from "../3plApi/tokenHandler.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Request, Response } from 'express';

const authKey: string = process.env.AUTH_KEY as string;
const tpl: string = process.env.TPL as string;
const userLoginId: string = process.env.USER_LOGIN_ID as string;

// Initialize cache with a 24-hour TTL (time-to-live)
const cache = new NodeCache({ stdTTL: 86400 });

const getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
    // Check if the data is already cached
    let cachedCustomers = cache.get('customers');

    if (cachedCustomers) {
        // If cached data exists, return it
        console.log("Returning cached customer data");
        res.send(cachedCustomers);
    } else {
        // If no cached data, fetch from API
        const token: Token = await checkToken(authKey, tpl, userLoginId);
        console.log(token.access_token);
        const accessToken: string = token.access_token;

        try {
            const finalResult = await fetchAllCustomerNames(accessToken);
            console.log("Processed customers data:", finalResult);

            // Cache the fetched data
            cache.set('customers', finalResult);
            res.send(finalResult);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

export default getAllCustomers;
