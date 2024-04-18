const separateOffSiteInventory = (data) => {
    const result = {};
    let claysonTotal = 0;
    let whlTotal = 0;

    data.forEach(item => {
        const nameKey = item.locationIdentifier.nameKey.name;
        const qty = item.available;
        const key = nameKey.includes('-') ? 'Clayson' : 'WHL';

        if (result[item.itemIdentifier.sku]) {
            result[item.itemIdentifier.sku][key] = (result[item.itemIdentifier.sku][key] || 0) + qty;
        } else {
            result[item.itemIdentifier.sku] = { [key]: qty };
        }

        if (key === 'Clayson') {
            claysonTotal += qty;
        } else if (key === 'WHL') {
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
