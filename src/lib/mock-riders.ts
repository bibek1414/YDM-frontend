export type Rider = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive";
  zone: string;
  joinedOn: string;
};

export const mockRiders: Rider[] = [
  {
    id: "R001",
    name: "suraj pariyar",
    phone: "9702459509",
    email: "nepsuraj64@gmail.com",
    address: "Sinamangal, Kathmandu",
    status: "Active",
    zone: "Kathmandu",
    joinedOn: "2025-01-15",
  },
  {
    id: "R002",
    name: "sanil maharjan",
    phone: "9840383000",
    email: "sanilmaharjan41@gmail.com",
    address: "Lalitpur, Patan",
    status: "Active",
    zone: "Lalitpur",
    joinedOn: "2025-02-20",
  },
  {
    id: "R003",
    name: "ram bahadur thapa",
    phone: "9851234567",
    email: "ramthapa@gmail.com",
    address: "Bhaktapur, Nepal",
    status: "Active",
    zone: "Bhaktapur",
    joinedOn: "2025-03-10",
  },
  {
    id: "R004",
    name: "bikram shrestha",
    phone: "9861234567",
    email: "bikramshrestha@gmail.com",
    address: "Baneshwor, Kathmandu",
    status: "Inactive",
    zone: "Kathmandu",
    joinedOn: "2025-04-05",
  },
  {
    id: "R005",
    name: "sita gurung",
    phone: "9840987654",
    email: "sitagurung@gmail.com",
    address: "Pokhara, Kaski",
    status: "Active",
    zone: "Pokhara",
    joinedOn: "2025-05-18",
  },
  {
    id: "R006",
    name: "krishna rai",
    phone: "9812345678",
    email: "krishnarai@gmail.com",
    address: "Butwal, Rupandehi",
    status: "Active",
    zone: "Butwal",
    joinedOn: "2025-06-01",
  },
];
