// import cron from 'node-cron';
// import { extractData } from '../ETL/initialOrdersETL.js';


// cron.schedule('0 0 * * *', async () => {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);

//     const today = new Date();

//     try {
//         await extractData(yesterday.toISOString(), today.toISOString(), 100);
//         console.log('Daily ETL completed successfully');
//     } catch (error) {
//         console.error('An error occurred during the ETL process', error);
//     }
// });