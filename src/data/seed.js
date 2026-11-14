export const categories = [
  "Medicine",
  "Head",
  "Hand",
  "Dental Care",
  "Skin Care",
  "Eye Care",
  "Vitamins & Supplements",
  "Orthopedic Products",
  "Baby Care",
];

const names = [
  "Alex Shatov",
  "Philip Harbach",
  "Mirko Fisuk",
  "Olga Semklo",
  "Burak Long",
  "Emma Wilson",
  "James Parker",
  "Sofia Martin",
  "Oliver Brown",
  "Mia Davis",
  "Noah Taylor",
  "Isabella Clark",
  "Liam Harris",
  "Amelia Lewis",
  "Ethan Walker",
  "Charlotte Hall",
  "Lucas Allen",
  "Harper Young",
  "Mason King",
  "Evelyn Wright",
  "Henry Scott",
  "Abigail Green",
  "Leo Adams",
  "Emily Baker",
  "Daniel Nelson",
];

const emails = [
  "alexshatov@gmail.com",
  "philip.h@gmail.com",
  "mirkofisuk@gmail.com",
  "olga.s@cool.design",
  "longburak@gmail.com",
];

const addresses = [
  "Mirpur-1",
  "Dhonmondi",
  "Uttara-6",
  "Gulshan-1",
  "Mirpur-12",
];
const companies = ["Square", "Acme", "Beximco", "ACI", "Unilever"];
const spending = [2890.66, 2767.04, 2996, 1220.66, 1890.66];
const amounts = [6952.53, 8527.58, 2698.5, 9852.64, 1736.9];
const prices = [890.66, 340.16, 530.76, 280.57, 567.34];
const quantities = [12, 19, 9, 14, 10];
const statuses = [
  "Completed",
  "Confirmed",
  "Pending",
  "Cancelled",
  "Processing",
];
const createdAt = Date.UTC(2023, 7, 1, 12);

const productRows = [
  ["Moringa", "Medicine", 12, "Square", 89.66],
  ["Antibiotic 250 mg", "Medicine", 19, "Acme", 34.16],
  ["Headache Relief", "Head", 9, "Beximco", 53.76],
  ["Pharmacy Hand Cream", "Hand", 14, "ACI", 28.57],
  ["Magnesium", "Vitamins & Supplements", 10, "Unilever", 56.34],
  ["Vitamin C 1000 mg", "Vitamins & Supplements", 42, "Square", 18.5],
  ["Gentle Cleanser", "Skin Care", 24, "Acme", 12.75],
  ["Sensitive Toothpaste", "Dental Care", 31, "Beximco", 6.9],
  ["Lubricating Eye Drops", "Eye Care", 18, "ACI", 14.2],
  ["Baby Moisturizing Lotion", "Baby Care", 22, "Unilever", 11.45],
  ["Wrist Support", "Orthopedic Products", 8, "Square", 22],
  ["Antiseptic Solution", "Medicine", 35, "Acme", 9.8],
  ["Hand Sanitizer", "Hand", 64, "Beximco", 4.6],
  ["Daily Sunscreen SPF 50", "Skin Care", 20, "ACI", 21.5],
  ["Omega 3", "Vitamins & Supplements", 16, "Unilever", 26.9],
  ["Digital Thermometer", "Medicine", 13, "Square", 15.75],
  ["Dental Floss", "Dental Care", 45, "Acme", 3.4],
  ["Cooling Head Wrap", "Head", 7, "Beximco", 19.9],
  ["Baby Gentle Wash", "Baby Care", 17, "ACI", 8.85],
  ["Ankle Support", "Orthopedic Products", 11, "Unilever", 24.5],
  ["Vitamin D3", "Vitamins & Supplements", 38, "Square", 16.2],
  ["Saline Eye Wash", "Eye Care", 21, "Acme", 7.95],
  ["Hydrating Face Cream", "Skin Care", 15, "Beximco", 17.6],
  ["Travel First Aid Kit", "Medicine", 6, "ACI", 29.9],
  ["Soft Toothbrush", "Dental Care", 50, "Unilever", 4.25],
];

export function createSeedData() {
  const customers = names.map((name, index) => ({
    id: `customer-${index + 1}`,
    name,
    email:
      emails[index] ?? `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
    address: addresses[index % addresses.length],
    phone: `+880173698${[5253, 5275, 5214, 5264, 4514][index % 5] + Math.floor(index / 5)}`,
    registerDate: "2023-08-01",
    spent: spending[index % spending.length],
    avatar: index % 5,
    createdAt: createdAt - index * 60000,
  }));

  return {
    products: productRows.map(
      ([name, category, stock, supplier, price], index) => ({
        id: `product-${index + 1}`,
        name,
        category,
        stock,
        supplier,
        price,
        createdAt: createdAt - index * 60000,
      }),
    ),
    suppliers: names.map((name, index) => ({
      id: `supplier-${index + 1}`,
      name,
      address: addresses[index % addresses.length],
      company: companies[index % companies.length],
      deliveryDate: "2023-08-01",
      amount: amounts[index % amounts.length],
      status: index % 5 === 4 ? "Deactive" : "Active",
      createdAt: createdAt - index * 60000,
    })),
    customers,
    orders: customers.map((customer, index) => ({
      id: `order-${index + 1}`,
      customerId: customer.id,
      name: customer.name,
      address: customer.address,
      products: quantities[index % quantities.length],
      date: "2023-07-31",
      price: prices[index % prices.length],
      status: statuses[index % statuses.length],
      avatar: customer.avatar,
    })),
    transactions: [
      {
        id: "transaction-1",
        title: "Qonto billing",
        amount: -49.88,
        type: "Expense",
      },
      {
        id: "transaction-2",
        title: "Cruip.com Market Ltd 70 Wilson St London",
        amount: 249.88,
        type: "Income",
      },
      {
        id: "transaction-3",
        title: "Notion Labs Inc",
        amount: 99.99,
        type: "Income",
      },
      {
        id: "transaction-4",
        title: "Market Cap Ltd",
        amount: 1200.88,
        type: "Income",
      },
      {
        id: "transaction-5",
        title: "App.com Market Ltd 70 Wilson St London",
        amount: 99.99,
        type: "Error",
      },
      {
        id: "transaction-6",
        title: "App.com Market Ltd 70 Wilson St London",
        amount: -49.88,
        type: "Expense",
      },
    ],
  };
}
