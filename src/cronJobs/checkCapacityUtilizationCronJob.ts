// import mongoose from 'mongoose';
// import cron from 'node-cron';
// import Capacity from '../models/capacityModel.js';
// import CapacityUtilization, { ICapacityUtilization } from '../models/capacityUtilizationModel.js';



// // Define a plain object type for utilization data
// interface IPlainCapacityUtilization {
//     clientId: string;
//     clientName: string;
//     week: Date;
//     claysonQty: number;
//     whlQty: number;
//     totalQty: number;
//     utilizationPercentage: number;
//   }
  
//   // Function to calculate and save capacity utilization
//   const calculateAndSaveCapacityUtilization = async () => {
//     try {
//       // Fetch all clients' capacities
//       const clientsCapacities = await Capacity.find();
  
//       // Prepare an array to hold all the utilization data
//       const utilizationDataArray: IPlainCapacityUtilization[] = clientsCapacities.map((clientCapacity) => ({
//         clientId: clientCapacity.clientId,
//         clientName: clientCapacity.clientName,
//         week: new Date(), // Current date
//         claysonQty: clientCapacity.claysonQty,
//         whlQty: clientCapacity.whlQty,
//         totalQty: clientCapacity.totalQty,
//         utilizationPercentage: (clientCapacity.totalQty / 1000) * 100, // Example calculation
//       }));
  
//       // Perform a batch insert of all utilization data
//       await CapacityUtilization.insertMany(utilizationDataArray);
  
//       console.log('Capacity utilization data updated successfully.');
//     } catch (error) {
//       console.error('Error updating capacity utilization data:', error);
//     } finally {
//       // Close the mongoose connection
//       mongoose.connection.close();
//     }
//   };
// // Schedule the task to run on the 7th day of every month at 00:00 (midnight)
// cron.schedule('0 0 7 * *', () => {
//   console.log('Running capacity utilization update job...');
//   calculateAndSaveCapacityUtilization().catch((err) => console.error('Error running utilization update job:', err));
// });
