// import { CLIENT_RENEG_LIMIT } from "tls";
import { fetchOrdersShippedByDateRange, Token } from "../3plApi/fetchingAPI.js";
import { checkToken } from "../3plApi/tokenHandler.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Request, Response } from 'express';


const authKey: string = process.env.AUTH_KEY as string;
const tpl: string = process.env.TPL as string;
const userLoginId: string = process.env.USER_LOGIN_ID as string

const getOrdersByDateRange = asyncHandler(async (req: Request, res: Response) => {
    
//    const dateStart = "";
//    const dateEnd = "";
    const token: Token = await checkToken(authKey, tpl, userLoginId);
    console.log(token.access_token);
    const accessToken: string = token.access_token;
    //  let url: string = "https://secure-wms.com/orders?pgsiz=1000&pgnum=1&rql=readonly.processDate=gt=2024-04-11T17:16:00;readonly.processDate=lt=2024-04-30T17:17:59&detail=All&itemdetail=All";

    try {
        const finalResult = await fetchOrdersShippedByDateRange(accessToken);
        console.log("Processed inventory data:", finalResult);
        res.send(finalResult)
        // await updateReplenishmentFlags(finalResult.detail, customerId );


    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error)
    }
});

export default getOrdersByDateRange;
