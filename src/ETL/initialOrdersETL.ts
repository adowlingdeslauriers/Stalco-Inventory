import { PoolClient } from "pg";
import { pool } from "../config/sqlDb.js";
import { Token, fetchEndpoint, fetchOrdersShippedByDateRange } from "../3plApi/fetchingAPI.js";
import { checkToken } from "../3plApi/tokenHandler.js";

const BATCH_SIZE = 10000;
const authKey: string = process.env.AUTH_KEY as string;
const tpl: string = process.env.TPL as string;
const userLoginId: string = process.env.USER_LOGIN_ID as string





interface Order {
    readOnly: {
        customerIdentifier: {
            id: string;
            name: string;
        };
        processDate: string;
        numUnits1: number;
    };
    numUnits1: number;
    referenceNum: string;
    notes: string;
    routingInfo: {
carrier: string;
trackingNumber:string;
    };
    shipTo: {
        retailerInfo: any;
        country: string;
        state: string;
    };
    _embedded: {
        'http://api.3plCentral.com/rels/orders/item': Array<{
            shipTo: any;
            itemIdentifier: {
                sku: string;
            };
            qty: number;
        }>;
    };
}

interface AggregatedData {
    clientId: string,
    clientName: string;
    totalOrders: number;
    canada: number;
    us: number;
    intl: number;
    internal: number;
    avgQtyPerOrder: number;
    retailerId: number;
    skus: {
        [sku: string]: {
            totalOrders: number;
            totalUnits: number;
            retailerId?: number;
        };
    };
    regions: Array<{
        country: string;
        stateProvince: string;
        totalOrders: number;
    }>;
    usps: number;
    dhl: number;
    fedex: number;
    ups: number;
    canadaPost: number;
    otherCarriers: number;
}

export const extractData = async (startDate: string, endDate: string, concurrency: number): Promise<void> => {
    const token: Token = await checkToken(authKey, tpl, userLoginId);
    const accessToken: string = token.access_token;
    const ordersData = await fetchOrdersShippedByDateRange(accessToken, startDate, endDate,concurrency);
    
    await loadData(ordersData);

}

const loadData = async (orders: Order[]): Promise<void> => {
    const client: PoolClient = await pool.connect();

    try {
        await client.query('BEGIN');

        const aggregatedData = aggregateOrders(orders);
        const ordersBatch: Map<string, any[]> = new Map();
        const customersBatch: Map<string, any[]> = new Map();
        const regionsBatch: Map<string, any[]> = new Map();
        const skusBatch: Map<string, any[]> = new Map();

        for (const [key, data] of Object.entries(aggregatedData)) {
            const [clientId, processDate] = key.split('|');

            const orderKey = `${clientId}|${processDate}`;
            if (!ordersBatch.has(orderKey)) {
                ordersBatch.set(orderKey, [
                    clientId, processDate, data.totalOrders, data.canada, data.us, data.intl, 
                    data.internal, data.usps, data.dhl, data.fedex, data.ups, data.canadaPost, 
                    data.otherCarriers, data.avgQtyPerOrder
                ]);
            }

            const customerKey = `${clientId}`;
            if (!customersBatch.has(customerKey)) {
                customersBatch.set(customerKey, [clientId, data.clientName]);
            }

            for (const regionKey in data.regions) {
                const regionData = data.regions[regionKey];
                regionsBatch.set(`${clientId}|${processDate}|${regionKey}`, [
                    clientId, processDate, regionData.country, regionData.stateProvince, regionData.totalOrders
                ]);
            }


            for (const [sku, skuData] of Object.entries(data.skus)) {
                const skuKey = `${clientId}|${sku}|${processDate}`;
                if (!skusBatch.has(skuKey)) {
                    skusBatch.set(skuKey, [sku, processDate, skuData.totalOrders, skuData.totalUnits, data.clientId, skuData.retailerId]);
                }
            }

            if (ordersBatch.size >= BATCH_SIZE) {
                await batchInsert(client, 'Orders', [
                    'client_id', 'date', 'total_orders', 'canada', 'us', 'intl', 'internal', 'usps', 'dhl', 'fedex', 'ups', 'canada_post', 'other_carriers', 'avg_qty_per_order'
                ], Array.from(ordersBatch.values()), ['client_id', 'date']);
                ordersBatch.clear();
            }
            if (customersBatch.size >= BATCH_SIZE) {
                await batchInsert(client, 'Customers', ['client_id', 'clientName'], Array.from(customersBatch.values()), ['client_id']);
                customersBatch.clear();
            }
            if (regionsBatch.size >= BATCH_SIZE) {
                await batchInsert(client, 'RegionShipped', ['client_id', 'date', 'country', 'state_province', 'total_orders'], Array.from(regionsBatch.values()), ['client_id', 'date', 'country', 'state_province']);
                regionsBatch.clear();
            }
            if (skusBatch.size >= BATCH_SIZE) {
                await batchInsert(client, 'SkuSales', ['sku', 'date', 'total_orders', 'total_units', 'client_id', 'retailer_id'], Array.from(skusBatch.values()), ['client_id','sku', 'date']);
                skusBatch.clear();
            }
        }

        if (ordersBatch.size > 0) {
            await batchInsert(client, 'Orders', [
                'client_id', 'date', 'total_orders', 'canada', 'us', 'intl', 'internal', 'usps', 'dhl', 'fedex', 'ups', 'canada_post', 'other_carriers', 'avg_qty_per_order'
            ], Array.from(ordersBatch.values()), ['client_id', 'date']);
        }
        if (customersBatch.size > 0) {
            await batchInsert(client, 'Customers', ['client_id', 'clientName'], Array.from(customersBatch.values()), ['client_id']);
        }
        if (regionsBatch.size > 0) {
            await batchInsert(client, 'RegionShipped', ['client_id', 'date', 'country', 'state_province', 'total_orders'], Array.from(regionsBatch.values()), ['client_id', 'date', 'country', 'state_province']);
        }
        if (skusBatch.size > 0) {
            await batchInsert(client, 'SkuSales', ['sku', 'date', 'total_orders', 'total_units', 'client_id', 'retailer_id'], Array.from(skusBatch.values()), ['client_id','sku', 'date']);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error during data load: ", error);
        throw error;
    } finally {
        client.release();
    }
};


const batchInsert = async (client: PoolClient, table: string, columns: string[], values: any[], conflictColumns: string[]): Promise<void> => {
    const placeholders = values.map(
        (row, rowIndex) => `(${row.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
    ).join(', ');

    const conflictColumnsString = conflictColumns.join(', ');
    const updateColumns = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');

    const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES ${placeholders}
        ON CONFLICT (${conflictColumnsString}) DO UPDATE SET ${updateColumns}
        RETURNING *;
    `;

    try {
        const result = await client.query(query, values.flat());
        const totalProcessed = result.rowCount;
        const totalInserted = values.length;
        const totalSkipped = totalInserted - totalProcessed;
        console.log(`Total Records for ${table}: Processed=${totalProcessed}, Inserted=${totalInserted}, Skipped=${totalSkipped}`);
    } catch (error) {
        console.error(`Error during batch insert into ${table}: `, error);
        throw error;
    }
};

const aggregateOrders = (orders: Order[]): { [key: string]: AggregatedData } => {
    const aggregatedData: { [key: string]: AggregatedData } = {};
    let cancel = 0;

    for (const order of orders) {
        if (
            (order.referenceNum && order.referenceNum.toLowerCase().includes("cancel")) ||
            (order.notes && order.notes.toLowerCase().includes("cancel"))
        ) {
            cancel++;
            continue; // Skip this order
        }

        const clientId = order.readOnly.customerIdentifier.id;
        const processDate = new Date(order.readOnly.processDate).toISOString().split('T')[0];
        const key = `${clientId}|${processDate}`;

        if (!aggregatedData[key]) {
            aggregatedData[key] = {
                clientId: order.readOnly.customerIdentifier.id,
                clientName: order.readOnly.customerIdentifier.name,
                totalOrders: 0,
                canada: 0,
                us: 0,
                intl: 0,
                internal: 0,
                avgQtyPerOrder: 0,
                retailerId: 0,
                skus: {},
                regions: [],
                usps: 0,
                dhl: 0,
                fedex: 0,
                ups: 0,
                canadaPost: 0,
                otherCarriers: 0,
            };
        }


        if(order.numUnits1 <= 20) {
            aggregatedData[key].avgQtyPerOrder += order.numUnits1 || 0;
        } else {
            aggregatedData[key].avgQtyPerOrder += 1;
        }
        aggregatedData[key].totalOrders += 1;

        // Update carrier-specific fields based on the shipping method
        const mailCarriers = {
            "USPS": ["ehub", "usps – ehub", "usps"],
            "DHL": ["dhl", "dhl ecom v4", "dhlglobalmail", "dhlglobalmailv4", "dhlglobalmailv5"],
            "Fedex": ["fedex"],
            "UPS": ["ups", "ups rest"],
            "Canada Post": ["canada post"]
        };

        const carrier = order.routingInfo?.carrier?.toLowerCase();


        if(carrier != 'do not ship' || order.routingInfo?.trackingNumber?.toLowerCase().includes('internal') ){
let found = false
            for (const [carrierName, aliases] of Object.entries(mailCarriers)) {
                if (aliases.includes(carrier)) {
                    switch (carrierName) {
                        case 'USPS':
                            aggregatedData[key].usps += 1;
                            break;
                        case 'DHL':
                            aggregatedData[key].dhl += 1;
                            break;
                        case 'Fedex':
                            aggregatedData[key].fedex += 1;
                            break;
                        case 'UPS':
                            aggregatedData[key].ups += 1;
                            break;
                        case 'Canada Post':
                            aggregatedData[key].canadaPost += 1;
                            break;
                    }
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                aggregatedData[key].otherCarriers += 1;
            }
    }

    (carrier == 'do not ship' || order.routingInfo?.trackingNumber?.toLowerCase().includes('internal')) && console.log("CARRIER", carrier )

        if (order.shipTo.country === 'CA') {
            aggregatedData[key].canada += 1;
        } else if (order.shipTo.country === 'US') {
            aggregatedData[key].us += 1;
        } else if (carrier == 'do not ship' || order.routingInfo?.trackingNumber?.toLowerCase().includes('internal')) {  // or check TrackingNo equals 'internal' or referenceNo contains 'WO-WL'
            aggregatedData[key].internal += 1;
        } else {
            aggregatedData[key].intl += 1;
        }

        const regionKey = `${order.shipTo.country}|${order.shipTo.state}`;
        if (!aggregatedData[key].regions[regionKey]) {
            aggregatedData[key].regions[regionKey] = {
                country: order.shipTo.country || 'XXX',
                stateProvince: order.shipTo.state || 'XXX',
                totalOrders: 0,
            };
        }
        aggregatedData[key].regions[regionKey].totalOrders += 1;

        for (const item of order._embedded['http://api.3plCentral.com/rels/orders/item']) {
            if (!aggregatedData[key].skus[item.itemIdentifier.sku]) {
                aggregatedData[key].skus[item.itemIdentifier.sku] = {
                    totalOrders: 0,
                    totalUnits: 0,
                    retailerId: order.shipTo.retailerInfo?.id || null,
                };
            }
            aggregatedData[key].skus[item.itemIdentifier.sku].totalOrders += 1;
            aggregatedData[key].skus[item.itemIdentifier.sku].totalUnits += item.qty;
        }
    }

    for (const key in aggregatedData) {
        aggregatedData[key].avgQtyPerOrder /= aggregatedData[key].totalOrders;
    }

    console.log("CANCEL", cancel);
    return aggregatedData;
};

export const startInitialETL = async (): Promise<void> => {
    try {
        await extractData("2024-04-01T00:00:00", "2024-04-01T23:59:59", 1);
        // await extractData("2024-04-11T17:16:00", "2024-05-11T17:17:59", 100);
    } catch (error) {
        console.error("Error in startInitialETL: ", error);
    }
};
