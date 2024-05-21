// import { CLIENT_RENEG_LIMIT } from "tls";
import { fetchAndProcessStorageData, Token } from "../3plApi/fetchingAPI.js";
import { checkToken } from "../3plApi/tokenHandler.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Request, Response } from 'express';


const authKey: string = process.env.AUTH_KEY as string;
const tpl: string = process.env.TPL as string;
const userLoginId: string = process.env.USER_LOGIN_ID as string

const getOrdersByDateRange = asyncHandler(async (req: Request, res: Response) => {
    
    const customerId: any = req.query.customerId;
    const token: Token = await checkToken(authKey, tpl, userLoginId);
    console.log(token.access_token);
    const accessToken: string = token.access_token;
    console.log("CustomerID:", customerId)
    // let url: string = "https://secure-wms.com/inventory/stockdetails?customerid=1347&facilityid=1&rql=onHand=gt=0&pgsiz=500&pgnum=8";

    try {
        const finalResult = await fetchAndProcessStorageData(accessToken, customerId);
        console.log("Processed inventory data:", finalResult);
        res.send(finalResult)
        // await updateReplenishmentFlags(finalResult.detail, customerId );


    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error)
    }
});

export default getOrdersByDateRange;
