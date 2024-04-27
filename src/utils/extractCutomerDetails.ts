interface Customer {
    deactivated: boolean;
    // Add other properties if needed
}

const extractCustomerDetails = (data: Customer[]): Customer[] => {
    const deactivatedCustomers: Customer[] = data.filter(item => item.deactivated === false);
    return deactivatedCustomers;
};

export default extractCustomerDetails;
