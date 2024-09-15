import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Orders from "../schema/sequelizeModels/ordersModel.js";
import Customers from "../schema/sequelizeModels/customersModel.js";
import RegionShipped from "../schema/sequelizeModels/regionShippedModel.js";
import SkuSales from "../schema/sequelizeModels/skuSalesModel.js";
import { addDays, startOfWeek, subDays, subMonths } from "date-fns";

import { Op, fn, col, Sequelize } from "sequelize";

import { dataTransformationOrdersDashboardFilter } from "../utils/ordersDashboard/dataTransform.js";

function formatDate(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

let apiCount = 0;
const getOrdersByDateRange = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // Parse the query parameters into Date objects
    // Explicitly cast query parameters to strings
    let start = new Date(startDate as string);
    let end = new Date(endDate as string);

    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate = formatDate(start);
    let formattedEndDate = formatDate(end);

    console.log(
      "THE DATE RANGE IS ",
      formattedStartDate + " to " + formattedEndDate,
    );

    try {
      const [orders, regionShipped, customers] = await Promise.all([
        Orders.findAll({
          where: {
            date: {
              [Op.between]: [formattedStartDate, formattedEndDate],
            },
          },
          // include: [Customers, RegionShipped, SkuSales]
        }),
        RegionShipped.findAll({
          where: {
            date: {
              [Op.between]: [formattedStartDate, formattedEndDate],
            },
          },
          // include: [Customers, RegionShipped, SkuSales]
        }),
        Customers.findAll(),
        // SkuSales.findAll({
        //     where: {
        //         date: {
        //             [Op.between]: [formattedStartDate, formattedEndDate]
        //         }
        //     },
        //     // include: [Customers, RegionShipped, SkuSales]
        // })
      ]);
      console.log("ORDRES  ", customers);

      const filterOptions = await dataTransformationOrdersDashboardFilter({
        orders,
        regionShipped,
        customers,
      });

      res.send({ dbData: { orders, regionShipped, customers, filterOptions } });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

const getOrdersLastSixMonths = asyncHandler(
  async (req: Request, res: Response) => {
    apiCount++;
    const endDate = new Date();
    // const startDate = new Date();
    const yesterday = subDays(new Date(), 1);
    const sixMonthsAgo = subMonths(yesterday, 6);
    const startOfWeekAfterSixMonthsAgo = addDays(
      startOfWeek(sixMonthsAgo, { weekStartsOn: 1 }),
      7,
    ); // Adding 7 days to get the start of the next week

    // startDate.setMonth(startDate.getMonth() - 6);
    // startDate.setDate(startDate.getDate() - 1);
    console.log("THIS API END PPOINT has been called : ", apiCount);
    try {
      const [orders, regionShipped, customers] = await Promise.all([
        Orders.findAll({
          where: {
            date: {
              [Op.between]: [startOfWeekAfterSixMonthsAgo, endDate],
            },
          },
          // include: [Customers, RegionShipped, SkuSales]
        }),
        RegionShipped.findAll({
          where: {
            date: {
              [Op.between]: [startOfWeekAfterSixMonthsAgo, endDate],
            },
          },
          // include: [Customers, RegionShipped, SkuSales]
        }),
        Customers.findAll(),
        // SkuSales.findAll({
        //     where: {
        //         date: {
        //             [Op.between]: [startOfWeekAfterSixMonthsAgo, endDate]
        //         }
        //     },
        //     // include: [Customers, RegionShipped, SkuSales]
        // })
      ]);

      const filterOptions = await dataTransformationOrdersDashboardFilter({
        orders,
        regionShipped,
        customers,
      });

      res.send({ dbData: { orders, regionShipped, customers, filterOptions } });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

const getLast12WeekAverage = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // Explicitly cast query parameters to strings
    let start = new Date(startDate as string);
    let end = new Date(endDate as string);

    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate = formatDate(start);
    let formattedEndDate = formatDate(end);

    console.log(
      "THE 12 week avg DATE RANGE IS ",
      formattedStartDate + " to " + formattedEndDate,
    );

    try {
      const [result] = await Promise.all([
        Orders.findAll({
          attributes: [
            [
              Sequelize.fn("SUM", Sequelize.col("total_orders")),
              "totalOrdersSum",
            ],
          ],
          where: {
            date: {
              [Op.between]: [formattedStartDate, formattedEndDate],
            },
          },
        }),
      ]);

      const totalOrdersSum = result[0]?.dataValues?.totalOrdersSum || 0;

      res.send({ totalOrdersSum });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

const getOrdersByClientLastSixMonths = asyncHandler(
  async (req: Request, res: Response) => {
    apiCount++;
    const { clientId } = req.params;
    const endDate = new Date();
    // const startDate = new Date();
    const yesterday = subDays(new Date(), 1);
    const sixMonthsAgo = subMonths(yesterday, 6);
    const startOfWeekAfterSixMonthsAgo = addDays(
      startOfWeek(sixMonthsAgo, { weekStartsOn: 1 }),
      7,
    ); // Adding 7 days to get the start of the next week
    console.log("STARTING of the Weeek", startOfWeekAfterSixMonthsAgo);
    console.log("endDate", endDate);
    console.log("clientId", typeof clientId);
    try {
      const skusales = await SkuSales.findAll({
        where: {
          date: {
            [Op.between]: [startOfWeekAfterSixMonthsAgo, endDate],
          },
          client_id: clientId.trim(),
        },
      });

      res.send({ dbData: { skusales } });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

const getOrdersByClientByDateRange = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const { clientId } = req.params;

    function formatDate(date) {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
      let day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Parse the query parameters into Date objects
    // Explicitly cast query parameters to strings
    let start = new Date(startDate as string);
    let end = new Date(endDate as string);

    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate = formatDate(start);
    let formattedEndDate = formatDate(end);

    console.log(
      "THE DATE RANGE FOR SKUSALES DATA IS ",
      formattedStartDate + " to " + formattedEndDate,
    );

    try {
      const skusales = await SkuSales.findAll({
        where: {
          date: {
            [Op.between]: [formattedStartDate, formattedEndDate],
          },
          client_id: clientId,
        },
      });

      res.send({ dbData: { skusales } });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

//

const getTotalOrdersByClientByDateRange = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const { clientId } = req.params;
    console.log("Summarized SKU data being called");
    function formatDate(date) {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
      let day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Parse the query parameters into Date objects
    let start = new Date(startDate as string);
    let end = new Date(endDate as string);

    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate = formatDate(start);
    let formattedEndDate = formatDate(end);

    try {
      const totalOrdersResult = await Orders.findOne({
        where: {
          date: {
            [Op.between]: [formattedStartDate, formattedEndDate],
          },
          client_id: clientId,
        },
        attributes: [[fn("sum", col("total_orders")), "totalOrders"]],
      });

      const avgQtyPerOrderResult = await Orders.findOne({
        where: {
          date: {
            [Op.between]: [formattedStartDate, formattedEndDate],
          },
          client_id: clientId,
        },
        attributes: [[fn("avg", col("avg_qty_per_order")), "avgQtyPerOrder"]],
      });

      const totalOrders = totalOrdersResult?.get("totalOrders") || 0;
      const avgQtyPerOrder = avgQtyPerOrderResult?.get("avgQtyPerOrder") || 0;

      res.send({ totalOrders, avgQtyPerOrder });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);
const getTotalInventoryProcessed = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    function formatDate(date) {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
      let day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Parse the query parameters into Date objects
    let start = new Date(startDate as string);
    let end = new Date(endDate as string);

    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate = formatDate(start);
    let formattedEndDate = formatDate(end);
    try {
      const totalInventoryProcessedResult = await SkuSales.findAll({
        attributes: [
          "client_id",
          [Sequelize.fn("SUM", Sequelize.col("total_units")), "total_units"],
        ],
        where: {
          date: {
            [Op.between]: [formattedStartDate, formattedEndDate],
          },
        },
        group: ["client_id"],
      });

      res.send({ totalInventoryProcessedResult });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

export {
  getOrdersByDateRange,
  getOrdersLastSixMonths,
  getOrdersByClientLastSixMonths,
  getOrdersByClientByDateRange,
  getTotalOrdersByClientByDateRange,
  getTotalInventoryProcessed,
  getLast12WeekAverage,
};
