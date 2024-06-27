import { Request, Response } from 'express';
import asyncHandler from "../middleware/asyncHandler.js";
import { Op } from 'sequelize';
import Orders  from "../schema/sequelizeModels/ordersModel.js" 
import Customers  from "../schema/sequelizeModels/customersModel.js" 
import  RegionShipped  from "../schema/sequelizeModels/regionShippedModel.js" 
import SkuSales from "../schema/sequelizeModels/skuSalesModel.js" 
import { dataTransformationOrdersDashboardFilter } from '../utils/ordersDashboard/dataTransform.js';


let apiCount =0;
const getOrdersByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    try {

        const orders = await Orders.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [Customers, RegionShipped, SkuSales]
        });

        res.send({ dbData: orders });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
});

const getOrdersLastSixMonths = asyncHandler(async (req: Request, res: Response) => {
    apiCount++;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
console.log("THIS API END PPOINT has been called : ", apiCount)
    try {
        const [orders, regionShipped, customers] = await Promise.all([
            Orders.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                // include: [Customers, RegionShipped, SkuSales]
            }),
            RegionShipped.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                // include: [Customers, RegionShipped, SkuSales]
            }),
            Customers.findAll()
            // SkuSales.findAll({
            //     where: {
            //         date: {
            //             [Op.between]: [startDate, endDate]
            //         }
            //     },
            //     // include: [Customers, RegionShipped, SkuSales]
            // })
        ]);

        const filterOptions = await dataTransformationOrdersDashboardFilter({orders, regionShipped, customers})

        res.send({ dbData: { orders, regionShipped, customers, filterOptions } });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
});

// const getOrderSalesLastSixMonths = asyncHandler(async (req: Request, res: Response) => {
//     apiCount++;
//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setMonth(startDate.getMonth() - 6);
//     try {
//         const [skusales] = await Promise.all([
//             SkuSales.findAll({
//                 where: {
//                     date: {
//                         [Op.between]: [startDate, endDate]
//                     }
//                 },
//             })
//         ]);

//         const filterOptions = await dataTransformationOrdersDashboardFilter({skusales})

//         res.send({ dbOrdersData: { skusales, filterOptions } });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send(error);
//     }
// });



export { getOrdersByDateRange, getOrdersLastSixMonths };
