import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Orders from "../schema/sequelizeModels/ordersModel.js";
import { Op } from "sequelize";

import { dataTransformationRangeComparison } from "../utils/rangeComparison/dataTransform.js";

function formatDate(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const getOrdersRangeComparison = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate1, endDate1, startDate2, endDate2 } = req.query;

    // Parse the query parameters into Date objects
    // Explicitly cast query parameters to strings
    let start1 = new Date(startDate1 as string);
    let end1 = new Date(endDate1 as string);
    let start2 = new Date(startDate2 as string);
    let end2 = new Date(endDate2 as string);

    // Format the dates to 'YYYY-MM-DD'
    let formattedStartDate1 = formatDate(start1);
    let formattedEndDate1 = formatDate(end1);
    let formattedStartDate2 = formatDate(start2);
    let formattedEndDate2 = formatDate(end2);

    console.log(
      "THE DATE RANGE 1 IS ",
      formattedStartDate1 + " to " + formattedEndDate1,
    );
    console.log(
      "THE DATE RANGE 2 IS ",
      formattedStartDate2 + " to " + formattedEndDate2,
    );

    try {
      const [orders1, orders2] = await Promise.all([
        Orders.findAll({
          where: {
            date: {
              [Op.between]: [formattedStartDate1, formattedEndDate1],
            },
          },
        }),
        Orders.findAll({
          where: {
            date: {
              [Op.between]: [formattedStartDate2, formattedEndDate2],
            },
          },
        }),
      ]);

      let consolidatedData = dataTransformationRangeComparison(
        orders1,
        orders2,
      );

      let dateRanges = {
        dateRange1: `${formattedStartDate1} to ${formattedEndDate1}`,
        dateRange2: `${formattedStartDate2} to ${formattedEndDate2}`,
      };

      res.send({ consolidatedData, dateRanges });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send(error);
    }
  },
);

export { getOrdersRangeComparison };
