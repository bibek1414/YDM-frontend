export interface Contact {
  name: string;
  phone: string;
}

export interface Franchise {
  id: number;
  name: string;
  slug: string;
  newOrders?: number;
  contacts: Contact[];
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function fromSlug(slug: string): string {
  return franchises.find((f) => f.slug === slug)?.name ?? slug;
}

export function getFranchiseBySlug(slug: string): Franchise | undefined {
  return franchises.find((f) => f.slug === slug);
}

const rawFranchises = [
  {
    id: 1,
    name: "Sankhamul Franchise",
    newOrders: 24,
    contacts: [
      { name: "Sanjog Chhetri", phone: "9841751148" },
      { name: "Sapana Dhakal", phone: "9708065821" },
      { name: "Baliyo franchise", phone: "9709066929" },
      { name: "Vishal Dhakal", phone: "9866316114" },
    ],
  },
  {
    id: 2,
    name: "Yachu Jorpati",
    newOrders: 7,
    contacts: [{ name: "Yachu Jorpati", phone: "9851037188" }],
  },
  {
    id: 3,
    name: "main page",
    newOrders: 4,
    contacts: [{ name: "Barsha Manandhaar", phone: "9768422193" }],
  },
  {
    id: 4,
    name: "Lagankhel Franchise",
    newOrders: 1,
    contacts: [{ name: "Anju Singh", phone: "9768422152" }],
  },
  { id: 5, name: "Yachu Jhamsikhel", contacts: [{ name: "Yachu Jhamsikhel", phone: "9714528428" }] },
  { id: 6, name: "Gairidhara", contacts: [{ name: "Gairidhara", phone: "9768422160" }] },
  { id: 7, name: "Kritipur", contacts: [{ name: "Kritipur", phone: "9768422168" }] },
  { id: 8, name: "Balaju Franchise", contacts: [{ name: "Ram Shrestha", phone: "9841234567" }] },
  {
    id: 9,
    name: "Patan Franchise",
    newOrders: 3,
    contacts: [{ name: "Sita Maharjan", phone: "9803456789" }],
  },
  { id: 10, name: "Bhaktapur Central", contacts: [{ name: "Bikash Shrestha", phone: "9851234567" }] },
  { id: 11, name: "Thimi Franchise", contacts: [{ name: "Anita Tamang", phone: "9841987654" }] },
  {
    id: 12,
    name: "Kalanki Hub",
    newOrders: 2,
    contacts: [{ name: "Dipak Gurung", phone: "9808765432" }],
  },
  { id: 13, name: "Koteshwor Franchise", contacts: [{ name: "Priya Karki", phone: "9861234567" }] },
  { id: 14, name: "Baneshwor Point", contacts: [{ name: "Sujan Adhikari", phone: "9841567890" }] },
  {
    id: 15,
    name: "Ratnapark Franchise",
    newOrders: 5,
    contacts: [{ name: "Manoj Thapa", phone: "9803987654" }],
  },
  { id: 16, name: "Chabahil Hub", contacts: [{ name: "Sunita Rai", phone: "9861987654" }] },
];

export const franchises: Franchise[] = rawFranchises.map((f) => ({
  ...f,
  slug: toSlug(f.name),
}));
