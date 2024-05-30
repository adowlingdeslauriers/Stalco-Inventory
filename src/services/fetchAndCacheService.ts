import { convertToSkuQtyMap, SkuQtyMap } from '../utils/skuInfo/convertSkutoQtyMap.js';
import SkuInfo, { ISKUINFO } from '../models/skuInfoModel.js';
import { cache } from '../cache/cache.js';

export const fetchAndCacheSkuInfoData = async (): Promise<SkuQtyMap> => {
    const cacheKey: string = "skuInfoData";

    // Try to get data from the cache
    let skuInfoData: SkuQtyMap | undefined = cache.get(cacheKey);

    if (!skuInfoData) {
        // Data is not in the cache, fetch it from the database
        const fetchedSkuInfoData: ISKUINFO[] = await SkuInfo.find();
        skuInfoData = convertToSkuQtyMap(fetchedSkuInfoData);

        // Store the fetched data in the cache
        cache.set(cacheKey, skuInfoData);
    } else {
        console.log("SkuInfoData retrieved from cache");
    }

    return skuInfoData!;
};
