// import { CLIENT_RENEG_LIMIT } from "tls";
import { fetchAllCustomerNames, Token } from "../3plApi/fetchingAPI.js";
import { checkToken } from "../3plApi/tokenHandler.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Request, Response } from 'express';

const authKey: string = 'MGMyMzllMTgtYmM0YS00NDA3LThmMmUtODAwYWE2MjQ5OTlhOnRaQVhJV29YYlpBUXVZbFJYM05JM3RUL3E3WXBWY0VF';
const tpl: string = '{8f403968-22c2-46f2-8942-6aaa7b846398}';
const userLoginId: string = '1055';

const getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
    const token: Token = await checkToken(authKey, tpl, userLoginId);
    console.log(token.access_token);
    const accessToken: string = token.access_token;
    // let url: string = "https://secure-wms.com/customers?pgsiz=100&pgnum=1&facilityid=1&sort=+companyInfo.companyName";

    try {
        const finalResult = await fetchAllCustomerNames(accessToken);
        console.log("Processed customers data:", finalResult);
        res.send(finalResult)
    } catch (error) {
        console.error('Error:', error);
    }
});

export default getAllCustomers;
