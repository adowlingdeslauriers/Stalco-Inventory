import cron from 'node-cron';
import { checkReplenishmentFlags } from '../services/replenishmentService.js';
import { sendEmail } from "../utils/smtp/emailSender.js"
import { fetchAndUpdateFlagsByClient } from "../3plApi/fetchingAPI.js"

// Array of IDs to process
const clientIds = ["39","1347", "84", "1337", "1244", "1241"]; // Add more IDs as needed



export const checkReplenishmentCronJob = () => {
// Schedule cron job to run everyday at 6am
cron.schedule('0 6 * * *', async () => {
    console.log('Running fetchAndUpdateFlagsByClient in parallel...');
    try {
      // Run fetchAndUpdateFlagsByClient in parallel for each ID
      const promises = clientIds.map(id => {
        console.log(`Running fetchAndUpdateFlagsByClient for ID ${id}...`);
        return fetchAndUpdateFlagsByClient(id);
      });
  
      // Wait for all promises to resolve
      await Promise.all(promises);
  
      console.log('All fetchAndUpdateFlagsByClient functions completed.');
  
      // Once all fetchAndUpdateFlagsByClient functions are completed, check replenishment flags
      console.log('Running checkReplenishmentFlags...');
      const replenishmentData = await checkReplenishmentFlags();
      if (replenishmentData && replenishmentData.length > 0) {
        console.log('Replenishment flags data:', replenishmentData);
        await sendEmail(replenishmentData);
      } else {
        console.log('No replenishment flags data found.');
      }
    } catch (error) {
      console.error('Error during cron job:', error);
    }
  });


}



