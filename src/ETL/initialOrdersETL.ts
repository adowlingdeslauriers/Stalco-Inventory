import axios from "axios";
import { PoolClient } from "pg";
import { pool } from "../config/sqlDb.js";

const BATCH_SIZE = 10000;

interface Order {
    readOnly: {
        customerIdentifier: {
            id: string;
            name: string;
        };
        processDate: string;
        numUnits1: number;
    };
    shipTo: {
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
    clientName: string;
    totalOrders: number;
    canada: number;
    us: number;
    intl: number;
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
    }>;
}

export const extractData = async (startDate: string, endDate: string, concurrency : number): Promise<void> => {
    let page = 1;
    let totalRecords = 0;
    let hasMoreData = true;
    let fetchCount = 1;
    const fetchPromises: Promise<Order[]>[] = [];

    while (hasMoreData) {
        fetchPromises.push(fetchPageData(page, startDate, endDate));

        if (fetchPromises.length >= concurrency) {
            const results = await Promise.all(fetchPromises);
            console.log("Concurrent fetch count: ", fetchCount);
            fetchCount++;
            fetchPromises.length = 0;

            for (const orders of results) {
                if (orders.length > 0) {
                    await loadData(orders);
                    totalRecords += orders.length;
                } else {
                    hasMoreData = false;
                }
            }
        }

        page++;
    }

    if (fetchPromises.length > 0) {
        const results = await Promise.all(fetchPromises);

        for (const orders of results) {
            if (orders.length > 0) {
                await loadData(orders);
                totalRecords += orders.length;
            } else {
                hasMoreData = false;
            }
        }
    }

    console.log(`Total records processed: ${totalRecords}`);
};

const fetchPageData = async (page: number, startDate: string, endDate: string): Promise<Order[]> => {
    const url = `https://secure-wms.com/orders?pgsiz=1000&pgnum=${page}&rql=readonly.processDate=gt=${startDate};readonly.processDate=lt=${endDate}&detail=All&itemdetail=All`
    const response = await axios.get(url);
    
    return response.data._embedded['http://api.3plCentral.com/rels/orders/order'];
};

const loadData = async (orders: Order[]): Promise<void> => {
    const client: PoolClient = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const aggregatedData = aggregateOrders(orders);
        
        const ordersBatch: any[] = [];
        const customersBatch: any[] = [];
        const regionsBatch: any[] = [];
        const skusBatch: any[] = [];

        for (const [key, data] of Object.entries(aggregatedData)) {
            const [clientId, processDate] = key.split('|');
            ordersBatch.push([clientId, processDate, data.totalOrders, data.canada, data.us, data.intl, data.avgQtyPerOrder]);
            customersBatch.push([clientId, data.clientName]);

            for (const region of data.regions) {
                regionsBatch.push([clientId, processDate, region.country, region.stateProvince]);
            }

            for (const [sku, skuData] of Object.entries(data.skus)) {
                skusBatch.push([sku, processDate, skuData.totalOrders, skuData.totalUnits, skuData.retailerId, clientId]);
            }

            if (ordersBatch.length >= BATCH_SIZE) {
                await batchInsert(client, 'Orders', ['clientId', 'date', 'totalOrders', 'Canada', 'US', 'INTL', 'avgQtyPerOrder'], ordersBatch);
                ordersBatch.length = 0; // Clear the batch
            }
            if (customersBatch.length >= BATCH_SIZE) {
                await batchInsert(client, 'Customers', ['clientId', 'clientName'], customersBatch);
                customersBatch.length = 0; // Clear the batch
            }
            if (regionsBatch.length >= BATCH_SIZE) {
                await batchInsert(client, 'RegionShipped', ['clientId', 'date', 'country', 'stateProvince'], regionsBatch);
                regionsBatch.length = 0; // Clear the batch
            }
            if (skusBatch.length >= BATCH_SIZE) {
                await batchInsert(client, 'SkuSales', ['sku', 'date', 'totalOrders', 'totalUnits', 'clientId', 'retailerId'], skusBatch);
                skusBatch.length = 0; // Clear the batch
            }
        }

        // Insert remaining data
        if (ordersBatch.length > 0) {
            await batchInsert(client, 'Orders', ['clientId', 'date', 'totalOrders', 'Canada', 'US', 'INTL', 'avgQtyPerOrder'], ordersBatch);
        }
        if (customersBatch.length > 0) {
            await batchInsert(client, 'Customers', ['clientId', 'clientName'], customersBatch);
        }
        if (regionsBatch.length > 0) {
            await batchInsert(client, 'RegionShipped', ['clientId', 'date', 'country', 'stateProvince'], regionsBatch);
        }
        if (skusBatch.length > 0) {
            await batchInsert(client, 'SkuSales', ['sku', 'date', 'totalOrders', 'totalUnits', 'clientId', 'retailerId'], skusBatch);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const batchInsert = async (client: PoolClient, table: string, columns: string[], values: any[]): Promise<void> => {
    const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES ${values.map(row => `(${row.map((_, i) => `$${i + 1}`).join(', ')})`).join(', ')}
        ON CONFLICT DO NOTHING;
    `;
    await client.query(query, values.flat());
};

const aggregateOrders = (orders: Order[]): { [key: string]: AggregatedData } => {
    const aggregatedData: { [key: string]: AggregatedData } = {};

    for (const order of orders) {
        const clientId = order.readOnly.customerIdentifier.id;
        const processDate = new Date(order.readOnly.processDate).toISOString().split('T')[0];
        const key = `${clientId}|${processDate}`;

        if (!aggregatedData[key]) {
            aggregatedData[key] = {
                clientName: order.readOnly.customerIdentifier.name,
                totalOrders: 0,
                canada: 0,
                retailerId: 0,
                us: 0,
                intl: 0,
                avgQtyPerOrder: 0,
                skus: {},
                regions: [],
            };
        }

        aggregatedData[key].totalOrders += 1;
        aggregatedData[key].avgQtyPerOrder += order._embedded["http://api.3plCentral.com/rels/orders/order"].reduce((sum, item) => sum + item.numUnits1, 0);
        
        if (order.shipTo.country === 'CA') {
            aggregatedData[key].canada += 1;
        } else if (order.shipTo.country === 'US') {
            aggregatedData[key].us += 1;
        } else {
            aggregatedData[key].intl += 1;
        }

        aggregatedData[key].regions.push({
            country: order.shipTo.country,
            stateProvince: order.shipTo.state,
        });

        for (const item of order._embedded['http://api.3plCentral.com/rels/orders/item']) {
            if (!aggregatedData[key].skus[item.itemIdentifier.sku]) {
                aggregatedData[key].skus[item.itemIdentifier.sku] = {
                    totalOrders: 0,
                    totalUnits: 0,
                    retailerId: item.shipTo.retailerId?.id || null,
                };
            }
            aggregatedData[key].skus[item.itemIdentifier.sku].totalOrders += 1;
            aggregatedData[key].skus[item.itemIdentifier.sku].totalUnits += item.qty;

        }
        
    }

    for (const key in aggregatedData) {
        aggregatedData[key].avgQtyPerOrder /= aggregatedData[key].totalOrders;
    }

    return aggregatedData;
};

const startInitialETL = async (): Promise<void> => {
    // const fiveYearsAgo = new Date();
    // fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    // const today = new Date();



    await extractData("2024-04-01T00:00:00", "2024-04-30T23:59:59", 100);
};

startInitialETL().catch(console.error);
