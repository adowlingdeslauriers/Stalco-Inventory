type OrderItem = {
    readOnly: {
      originalPrimaryQty: number;
    };
    itemIdentifier: {
      sku: string;
      id: number;
    };
    qty: number;
  };
  
  type OrderData = {
    readOnly: {
      orderId: number;
      processDate: string;
      customerIdentifier: {
        name: string;
        id: number;
      };
    };
    numUnits1: number;
    billing: any;
    shipTo: {
      name: string;
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phoneNumber: string;
      emailAddress: string;
    };
    _embedded?: {
        "http://api.3plCentral.com/rels/orders/item"?: OrderItem[];
      };
  };
  
  type OrdersArray = OrderData[];
  
  function filterOrdersData(orders) {
    return orders.flatMap(order =>
        (order._embedded?.["http://api.3plCentral.com/rels/orders/item"] ?? [])
        .filter(item => item.qty > 0) // Filter out items with itemQty of 0
        .map(item => ({
          orderNumber: order.readOnly.orderId,
          customerName: order.readOnly.customerIdentifier.name,
          customerId: order.readOnly.customerIdentifier.id,
          processDate: order.readOnly.processDate,
          shipToName: order.shipTo.name,
          shipToAddress1: order.shipTo.address1,
          shipToCity: order.shipTo.city,
          shipToState: order.shipTo.state,
          shipToZip: order.shipTo.zip,
          shipToCountry: order.shipTo.country,
          shipToPhoneNumber: order.shipTo.phoneNumber,
          shipToEmailAddress: order.shipTo.emailAddress,
          totalQty: order.numUnits1,
          itemSku: item.itemIdentifier.sku,
          itemId: item.itemIdentifier.id,
          itemQty: item.qty
        }))
    );
  }
  
export {filterOrdersData}