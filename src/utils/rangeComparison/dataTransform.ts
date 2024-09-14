// Helper function to get consolidated ordersData by clientID
function consolidateOrders(data) {
  const consolidated = {};

  data.forEach((order) => {
    const clientId = order.client_id;
    const totalOrders = order.total_orders;

    if (consolidated[clientId]) {
      consolidated[clientId].totalOrders += totalOrders;
    } else {
      consolidated[clientId] = {
        clientId: clientId,
        totalOrders: totalOrders,
      };
    }
  });

  return Object.values(consolidated);
}

function calculateVariance(data1, data2) {
  const result = [];

  // Create a map for Data 2 for quick lookup by clientId
  const data2Map = {};
  data2.forEach((entry) => {
    data2Map[entry.clientId] = entry.totalOrders;
  });

  // Iterate over Data 1 and calculate variance and variance percentage
  data1.forEach((entry1) => {
    const clientId = entry1.clientId;
    const totalOrders1 = entry1.totalOrders;
    const totalOrders2 = data2Map[clientId] || 0; // Default to 0 if clientId not found in Data 2

    const variance = totalOrders2 - totalOrders1;
    const variancePercentage = ((variance / totalOrders1) * 100).toFixed(2); // Fixing to 2 decimal places

    result.push({
      clientId: clientId,
      totalOrdersData1: Number(totalOrders1),
      totalOrdersData2: Number(totalOrders2),
      variance: Number(variance),
      variancePercentage: Number(variancePercentage),
    });
  });

  // Also, handle cases where clientId exists in Data 2 but not in Data 1
  data2.forEach((entry2) => {
    if (!data1.some((entry1) => entry1.clientId === entry2.clientId)) {
      result.push({
        clientId: entry2.clientId,
        totalOrdersData1: Number(0),
        totalOrdersData2: Number(entry2.totalOrders),
        variance: Number(entry2.totalOrders),
        variancePercentage: 0, // Cannot calculate percentage when there is no initial data
      });
    }
  });

  return result;
}

export const dataTransformationRangeComparison = (orders1, orders2) => {
  const consolidatedData1 = consolidateOrders(orders1);
  const consolidatedData2 = consolidateOrders(orders2);

  return calculateVariance(consolidatedData1, consolidatedData2);
};
