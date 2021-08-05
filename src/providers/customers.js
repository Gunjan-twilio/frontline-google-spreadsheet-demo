// Map between customer address and worker identity
// Used to determine to which worker route a new conversation with a particular customer
//
// {
//     customerAddress: workerIdentity
// }
//
// Example:
//     {
//         'whatsapp:+12345678': 'john@example.com'
//     }
const config = require('../config');
console.log("customers start");
const customersToWorkersMap = {};
const { GoogleSpreadsheet } = require("google-spreadsheet");

let customers = [];
const retrieveCustomersFromGoogleSheets = async () => {
  customers = [];
  const doc = new GoogleSpreadsheet(config.google.spreadsheet_key);
  console.log(config.google.private_key);
  // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  await doc.useServiceAccountAuth({
    client_email: config.google.client_email,
    private_key: config.google.private_key, 
  });
  await doc.loadInfo();
  console.log(doc.title);
  const sheet = doc.sheetsByIndex[0];
  console.log(sheet.title);
  console.log(sheet.rowCount);
  let workerCustomers = [];
  const rows = await sheet.getRows();

  for (let i = 0; i < sheet.rowCount; i++) {
    if (rows[i] == undefined || rows[i].Customer_Id == undefined) continue;
    const customer = {
      customer_id: rows[i].Customer_Id,
      display_name: rows[i].Display_Name,
      channels: [
        { type: "email", value: rows[i].Email },
        { type: "sms", value: rows[i].SMS },
        { type: "whatsapp", value: rows[i].WhatsApp },
      ],
      links: [
        {
          type: "Facebook",
          value: "https://facebook.com",
          display_name: "Social Media Profile",
        },
      ],
      worker: "gugupta@twilio.com",
    };
    customers.push(customer);
  }
};
customers.sort((a,b) => (a.display_name > b.display_name) ? 1 : ((b.display_name > a.display_name) ? -1 : 0))
const findWorkerForCustomer = async (customerNumber) =>
  customersToWorkersMap[customerNumber];

const findRandomWorker = async () => {
  const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  const workers = Object.values(customersToWorkersMap).filter(onlyUnique);
  const randomIndex = Math.floor(Math.random() * workers.length);

  return workers[randomIndex];
};

const getCustomersList = async (worker, pageSize, anchor) => {
  console.log("Total number of customers " + customers.length);
  // Initialize the sheet - doc ID is the long id in the sheets URL

  await retrieveCustomersFromGoogleSheets();

  const workerCustomers = customers.filter(
    (customer) => customer.worker === worker
  );
  console.log(
    "Total number of customers mapped to worker " + workerCustomers.length
  );

  const list = workerCustomers.map((customer) => ({
    display_name: customer.display_name,
    customer_id: customer.customer_id,
    avatar: customer.avatar,
  }));
  list.sort(function (a, b) {
    if (a.display_name < b.display_name) {
      return -1;
    }
    if (a.display_name > b.display_name) {
      return 1;
    }
    return 0;
  });
  if (!pageSize) {
    return list;
  }

  if (anchor) {
    const lastIndex = list.findIndex(
      (c) => String(c.customer_id) === String(anchor)
    );
    const nextIndex = lastIndex + 1;
    return list.slice(nextIndex, nextIndex + pageSize);
  } else {
    return list.slice(0, pageSize);
  }
};

const getCustomerByNumber = async (customerNumber) => {
  if (customers.length == 0) {
    await retrieveCustomersFromGoogleSheets();
  }
  return customers.find((customer) =>
    customer.channels.find(
      (channel) => String(channel.value) === String(customerNumber)
    )
  );
};

const getCustomerById = async (customerId) => {
  if (customers.length == 0) {
    await retrieveCustomersFromGoogleSheets();
  }
  return customers.find(
    (customer) => String(customer.customer_id) === String(customerId)
  );
};

module.exports = {
  customersToWorkersMap,
  findWorkerForCustomer,
  findRandomWorker,
  getCustomerById,
  getCustomersList,
  getCustomerByNumber,
};
