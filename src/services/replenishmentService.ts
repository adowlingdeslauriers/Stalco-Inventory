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
    console.log("Here is the APIdata" , apiData)
    if (apiData) {
      try {
        for (const [sku, clientData] of Object.entries(apiData)) {
          if (clientData && clientData.Clayson !== undefined) {
            const replenishment = await Replenishment.findOne({ sku, clientId }) as IReplenishment | null;
  
            if (replenishment) {
              if (clientData.Clayson < replenishment.threshold &&  clientData.WHL > 0) {
                replenishment.flag = true;
                replenishment.qtyToReplenish = replenishment.threshold - clientData.Clayson;
                await replenishment.save();
                console.log(`Flag updated for SKU: ${sku}`);
              } else if (clientData.Clayson > replenishment.threshold){
                replenishment.flag = false;
                replenishment.qtyToReplenish = 0;
                await replenishment.save();

              }
              console.log("UPDATED ALL FLAGs");
            } 
          }
        }
      } catch (error) {
        console.error('Error updating replenishment flags:', error);
        throw error;
      }
    } else {
      console.error('Error: apiData is undefined or null.');
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
  


