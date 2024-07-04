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

    function formatDate(date) {
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
        let day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parse the query parameters into Date objects
    // Explicitly cast query parameters to strings
    let start = new Date(startDate as string);
    let end = new Date(endDate as string);


    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate = formatDate(start);
    let formattedEndDate = formatDate(end);

    console.log("THE DATE RANGE IS ", formattedStartDate + " to " + formattedEndDate);

    try {
        const [orders, regionShipped, customers] = await Promise.all([
            Orders.findAll({
                where: {
                    date: {
                        [Op.between]: [formattedStartDate, formattedEndDate]
                    }
                },
                // include: [Customers, RegionShipped, SkuSales]
            }),
            RegionShipped.findAll({
                where: {
                    date: {
                        [Op.between]: [formattedStartDate, formattedEndDate]
                    }
                },
                // include: [Customers, RegionShipped, SkuSales]
            }),
            Customers.findAll()
            // SkuSales.findAll({
            //     where: {
            //         date: {
            //             [Op.between]: [formattedStartDate, formattedEndDate]
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


const getOrdersLastSixMonths = asyncHandler(async (req: Request, res: Response) => {
    apiCount++;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(startDate.getDate() - 1);
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
