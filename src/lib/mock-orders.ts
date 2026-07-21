export const mockOrders = [
  {
    id: 1,
    orderedOn: { date: "24 Jun 2026", time: "02:15 pm" },
    customer: {
      name: "Bibek Bhattarai",
      phone: "(9860425440)",
      address: "AchhamSanfeBagar, Achham"
    },
    trackingCode: "VPS2606KTMH5CS",
    weight: "1",
    status: "Order Placed",
    price: {
      collection: "295",
      delivery: "295"
    }
  },
  {
    id: 2,
    orderedOn: { date: "24 Jun 2026", time: "01:31 pm" },
    customer: {
      name: "Satish Shakya",
      phone: "(9803341347)",
      address: "Amuwa, Bhairahawa"
    },
    trackingCode: "RJW2605KTMD6XZ",
    weight: "1",
    status: "Order Placed",
    price: {
      collection: "35,000",
      delivery: "250"
    }
  },
  {
    id: 3,
    orderedOn: { date: "16 Mar 2026", time: "10:55 am" },
    customer: {
      name: "Ashely Delacruz",
      phone: "(3132323323)",
      address: "Amlekhgunj, Amlekhgunj"
    },
    trackingCode: "GKY2603KTMV48H",
    weight: "1",
    status: "Cancelled",
    price: {
      collection: "889",
      delivery: "100"
    }
  }
];
