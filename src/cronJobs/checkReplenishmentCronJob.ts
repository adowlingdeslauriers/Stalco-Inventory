// import cron from 'node-cron';
// import { checkReplenishmentFlags } from '../services/replenishmentService.js';
// import { sendEmail } from "../utils/emailSender.js"

// // Schedule cron job to run every 12 hours
// cron.schedule('0 */12 * * *', async () => {
//   console.log('Running checkReplenishmentFlags...');
//   try {
//     const replenishmentData = await checkReplenishmentFlags();
//     console.log('Replenishment flags data:', replenishmentData);
//     await sendEmail(replenishmentData);
//   } catch (error) {
//     console.error('Error during cron job:', error);
//   }
// });
