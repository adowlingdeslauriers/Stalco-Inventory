const separateOffSiteInventory = (data) => {
    const result = {};
    let claysonTotal = 0;
    let whlTotal = 0;

    data.forEach(({ locationIdentifier, available, itemIdentifier }) => {
        const nameKey = locationIdentifier.nameKey.name.toLowerCase();
        const qty = available;
        const key = nameKey.includes('-') && !nameKey.includes('whl') ? 'Clayson' : 
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
