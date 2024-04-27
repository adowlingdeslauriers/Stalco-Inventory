// Assuming you're using ES Modules. If not, you can still use require syntax with type annotations.
import mongoose from 'mongoose';
import Replenishment, { IReplenishment } from "../models/replensihmentModel.js"; // Ensure you export IReplenishment

interface ClientData {
  Clayson?: number;
  WHL?: number;
}

interface APIData {
  [sku: string]: ClientData;
}

/**
 * Updates the replenishment flags based on external API data for existing SKUs.
 * @param apiData Data from the external API.
 * @param clientId The client ID for which to check.
 */
async function updateReplenishmentFlags(apiData: APIData, clientId: string): Promise<void> {
  // Iterate over each SKU in the API data
  for (const [sku, clientData] of Object.entries(apiData)) {
    // Proceed only if Clayson data exists for this SKU
    if (clientData.Clayson !== undefined) {
      try {
        // Fetch the corresponding replenishment document
        const replenishment = await Replenishment.findOne({ sku, client: clientId }) as IReplenishment | null;

        if (replenishment) {
          // Compare the quantity and update the flag if necessary
          if (clientData.Clayson < replenishment.threshold) {
            // Only update the flag if it's not already set to true
            if (!replenishment.flag) {
              replenishment.flag = true;
              await replenishment.save();
              console.log(`Flag updated for SKU: ${sku}`);
            }
          }
        } else {
          console.log(`No replenishment entry found for SKU: ${sku} and client: ${clientId}`);
        }
      } catch (error) {
        console.error(`Error processing SKU ${sku}:`, error);
      }
    }
  }
}

// Example usage
const apiData: APIData = {
  'Box #16': { Clayson: 2925, WHL: 3500 },
  // Add other SKUs as needed
};
const clientId = 'Clayson';

updateReplenishmentFlags(apiData, clientId);
