import cron from 'node-cron';
import { startOrdersETL } from '../ETL/OrdersETL.js';


export const dailyETLCronJob = () => {
    cron.schedule('30 4 * * *', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
    
        const today = new Date();
    
        try {
            await startOrdersETL(yesterday.toISOString(), today.toISOString(), 100);
            console.log('Daily ETL completed successfully');
        } catch (error) {
            console.error('An error occurred during the ETL process', error);
        }
    });
}



// export const exampleRun = async () => {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);

//     console.log("HERE IS the date", yesterday)
//     const today = new Date();

//     try {
//         await startOrdersETL(yesterday.toISOString(), today.toISOString(), 100);
//         console.log('Daily ETL completed successfully');
//     } catch (error) {
//         console.error('An error occurred during the ETL process', error);
//     }
// }