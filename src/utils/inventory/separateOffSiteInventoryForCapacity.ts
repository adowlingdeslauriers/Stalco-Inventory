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

export interface InventoryResult {
    [key: string]: {
        Clayson?: number;
        noOfPalletsClayson?: number;
        WHL?: number;
        noOfPalletsWHL?: number;
    };
}

interface InventorySummary {
    Total: number;
    Clayson: number;
    WHL: number;
    ClaysonPalletsTotal: number;
    WhlPalletsTotal: number;
}

export interface SeparatedInventory {
    summary: InventorySummary;
    detail: InventoryResult;
}

const separateOffSiteInventory = (data: InventoryData[], capacityData: { [key: string]: number }): SeparatedInventory => {

    const result: InventoryResult = {};
    let claysonTotal = 0;
    let whlTotal = 0;
    let claysonPalletsTotal = 0;
    let whlPalletsTotal = 0;

    data.forEach(({ locationIdentifier, available, itemIdentifier }) => {
        if (!locationIdentifier?.nameKey) {
            console.warn('Invalid locationIdentifier detected, skipping item:', itemIdentifier.sku);
            return;
        }

        const nameKey = locationIdentifier.nameKey.name.toLowerCase();
        const quantity = available;
        const sku = itemIdentifier.sku;

        // Simplify the assignment of the key by grouping similar conditions
        const isClayson = nameKey.includes('-') && !nameKey.includes('whl') ||
                          nameKey.includes('prints') || nameKey.includes('packaging') || nameKey.includes('triage');
        const key = isClayson ? 'Clayson' : 'WHL';

        // Initialize the SKU record if not already initialized
        const skuRecord = result[sku] = result[sku] || {};
        const currentQuantity = skuRecord[key] || 0;
        skuRecord[key] = currentQuantity + quantity;

        // Calculate the number of pallets for Clayson or WHL
        if (capacityData[sku]) {
            if (isClayson) {
                const currentPallets = skuRecord['noOfPalletsClayson'] || 0;
                skuRecord['noOfPalletsClayson'] = currentPallets + quantity / capacityData[sku];
                claysonPalletsTotal += quantity / capacityData[sku];
            } else {
                const currentPallets = skuRecord['noOfPalletsWHL'] || 0;
                skuRecord['noOfPalletsWHL'] = currentPallets + quantity / capacityData[sku];
                whlPalletsTotal += quantity / capacityData[sku];
            }
        }

        // Increment total counters
        if (isClayson) {
            claysonTotal += quantity;
        } else {
            whlTotal += quantity;
        }
    });

    return {
        summary: {
            Total: claysonTotal + whlTotal,
            Clayson: claysonTotal,
            WHL: whlTotal,
            ClaysonPalletsTotal: claysonPalletsTotal,
            WhlPalletsTotal: whlPalletsTotal
        },
        detail: result
    };
};

export default separateOffSiteInventory;
