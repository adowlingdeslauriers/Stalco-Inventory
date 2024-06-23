export const dataTransformationOrdersDashboardFilter = (data) => {
    const { orders, regionShipped, customers } = data;
  
 // Helper function to get unique and sorted values
 const getUniqueSortedValues = (array, key) => {
    return [...new Set(array.map(item => item[key]).filter(value => value !== undefined && value !== null))].sort();
  };

  // Transform countryOptions
  const countryOptions = getUniqueSortedValues(regionShipped, 'country').map(country => ({
    value: country,
    label: country // Assuming country codes are used directly as labels
  }));

  // Transform stateOptions
  const stateOptions = getUniqueSortedValues(regionShipped, 'state_province').map(state => ({
    value: state,
    label: state // Assuming state/province codes are used directly as labels
  }));

  // Filter customers whose IDs are in the orders data
  const customerIdsInOrders = getUniqueSortedValues(orders, 'client_id');
  const customerNameOptions = customers
    .filter(customer => customerIdsInOrders.includes(customer.client_id))
    .sort((a, b) => {
      if (a.clientname && b.clientname) {
        return a.clientname.localeCompare(b.clientname);
      }
      return 0; // Handle cases where clientname might be null or undefined
    })
    .map(customer => ({
      value: customer.client_id,
      label: customer.clientname
    }));

  return {
    countryOptions,
    stateOptions,
    customerNameOptions
  };
}
  
  

  