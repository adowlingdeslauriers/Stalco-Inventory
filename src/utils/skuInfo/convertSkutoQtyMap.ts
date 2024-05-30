export interface SkuQtyMap { [sku: string]: number }

export const convertToSkuQtyMap = (data: any): SkuQtyMap=> {
    const skuQtyMap: { [sku: string]: number } = {};
    data.forEach(item => {
        const sku = item.sku;
        const qtyPerPallet = item.qtyPerPallet;
        skuQtyMap[sku] = qtyPerPallet;
    });
    return skuQtyMap;
}
