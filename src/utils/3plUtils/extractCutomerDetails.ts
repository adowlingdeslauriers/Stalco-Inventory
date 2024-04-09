//to separate WHL and Clayson inventory. 
const extractCustomerDetails = (data) => { 
    const deactivatedCustomers = data.filter(item => item.deactivated === false);
    return deactivatedCustomers;
};

export default extractCustomerDetails;