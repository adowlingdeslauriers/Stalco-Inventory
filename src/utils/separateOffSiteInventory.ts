interface LocationIdentifier {
    nameKey: {
        name: string;
    };
}

interface ItemIdentifier {
    sku: string;
}

interface InventoryData {
    locationIdentifier: LocationIdentifier;
    available: number;
    itemIdentifier: ItemIdentifier;
}

interface InventoryResult {
    [key: string]: {
        [key: string]: number;
    };
}

interface InventorySummary {
    Total: number;
    Clayson: number;
    WHL: number;
}

interface SeparatedInventory {
    summary: InventorySummary;
    detail: InventoryResult;
}

const separateOffSiteInventory = (data: InventoryData[]): SeparatedInventory => {
    const result: InventoryResult = {};
    let claysonTotal: number = 0;
    let whlTotal: number = 0;

    data.forEach(({ locationIdentifier, available, itemIdentifier }) => {
        const nameKey: string = locationIdentifier.nameKey.name.toLowerCase();
        const qty: number = available;
        const key: string =
            nameKey.includes('-') && !nameKey.includes('whl') ? 'Clayson' :
            nameKey.includes('prints') || nameKey.includes('packaging') ? 'Clayson' : 'WHL';

        result[itemIdentifier.sku] = result[itemIdentifier.sku] || {};
        result[itemIdentifier.sku][key] = (result[itemIdentifier.sku][key] || 0) + qty;

        if (key === 'Clayson') {
            claysonTotal += qty;
        } else {
            whlTotal += qty;
        }
    });

    return {
        summary: {
            Total: claysonTotal + whlTotal,
            Clayson: claysonTotal,
            WHL: whlTotal
        },
        detail: result
    };
};

export default separateOffSiteInventory;
