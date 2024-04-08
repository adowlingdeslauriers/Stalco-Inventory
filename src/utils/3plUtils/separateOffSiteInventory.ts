//to separate WHL and Clayson inventory. 
const separateOffSiteInventory = (data) => {
    const finalResult = {};
    data.forEach(item => {
        const nameKey = item.locationIdentifier.nameKey.name;
        const qty = item.received;
        const key = nameKey.includes('-') ? 'Clayson' : 'WHL';

        if (finalResult[item.itemIdentifier.sku]) {
            finalResult[item.itemIdentifier.sku][key] = (finalResult[item.itemIdentifier.sku][key] || 0) + qty;
        } else {
            finalResult[item.itemIdentifier.sku] = { [key]: qty };
        }
    });
    return finalResult;
};

export default separateOffSiteInventory;