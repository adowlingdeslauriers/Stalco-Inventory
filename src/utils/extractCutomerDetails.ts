//to filter out the inactive customers. 
const extractCustomerDetails = (data) => { 
    const deactivatedCustomers = data.filter(item => item.deactivated === false);
    return deactivatedCustomers;
};

export default extractCustomerDetails;