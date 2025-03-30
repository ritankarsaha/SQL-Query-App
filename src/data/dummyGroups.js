

export const dummyGroups = [
  {
    id: 'customers',
    groupName: 'Customers Queries',
    queries: [
      {
        id: 'cust_all',
        name: 'Select All from Customers',
        sql: 'SELECT * FROM Customers;',
      },
      // {
      //   id: 'cust_germany',
      //   name: 'Select Customers from Germany',
      //   sql: "SELECT * FROM Customers WHERE country='Germany';",
      // },
    ],
  },
  {
    id: 'products',
    groupName: 'Products Queries',
    queries: [
      {
        id: 'prod_all',
        name: 'Select All from Products',
        sql: 'SELECT * FROM Products;',
      },
      // {
      //   id: 'prod_filtered',
      //   name: 'Select Products with UnitPrice > 18 and UnitStock > 15',
      //   sql: 'SELECT * FROM Products WHERE unitPrice > 18 AND unitsInStock > 15;',
      // },
    ],
  },
  {
    id: 'orders',
    groupName: 'Orders Queries',
    queries: [
      {
        id: 'ord_all',
        name: 'Select All from Orders',
        sql: 'SELECT * FROM Orders;',
      },
      // {
      //   id: 'ord_ships',
      //   name: 'Select Orders with Freight > 10 and ShipCountry in (France, Germany, Brazil, Belgium)',
      //   sql: "SELECT * FROM Orders WHERE freight > 10 AND shipCountry IN ('France', 'Germany', 'Brazil', 'Belgium');",
      // },
    ],
  },
]
