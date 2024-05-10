import Replenishment, { IReplenishment } from "../models/replensihmentModel.js"; 
import { InventoryResult } from "../utils/separateOffSiteInventory.js";

interface ClientData {
  Clayson?: number;
  WHL?: number;
}



/**
 * Updates the replenishment flags based on external API data for existing SKUs.
 * @param apiData Data from the external API.
 * @param clientId The client ID for which to check.
 */
export async function updateReplenishmentFlags(apiData: InventoryResult, clientId: string): Promise<void> {
    if (!apiData) {
        console.error('Error: apiData is undefined or null.');
        return;
    }

    console.log("Here is the APIdata", apiData);
    const skus = Object.keys(apiData);
    if (!skus.length) {
        return;
    }

    try {
        // Retrieve all replenishments at once
        const replenishments = await Replenishment.find({ sku: { $in: skus }, clientId }).then(res => new Map(res.map(item => [item.sku, item])));

        const updates = [];

        for (const [sku, clientData] of Object.entries(apiData)) {
            const replenishment = replenishments.get(sku);
            if (replenishment && clientData && clientData.Clayson !== undefined) {
                let needsSave = false;

                if (clientData.Clayson < replenishment.threshold && clientData.WHL > 0) {
                    replenishment.flag = true;
                    replenishment.qtyToReplenish = replenishment.threshold - clientData.Clayson;
                    needsSave = true;
                } else if (clientData.Clayson >= replenishment.threshold) {
                    replenishment.flag = false;
                    replenishment.qtyToReplenish = 0;
                    needsSave = true;
                }

                if (needsSave) {
                    updates.push(replenishment.save());
                }
            }
        }

        await Promise.all(updates);
        console.log("UPDATED ALL FLAGS");
    } catch (error) {
        console.error('Error updating replenishment flags:', error);
        throw error;
    }
}


export async function checkReplenishmentFlags(): Promise<IReplenishment[]> {
    try {
      const replenishments = await Replenishment.find({ flag: true });
      return replenishments;
    } catch (error) {
      console.error('Error fetching replenishment data:', error);
      throw error;
    }
  }
  


