import { SignatureColor, SignatureFont } from "@/types/signature";

export const SIGNATURE_COLORS: SignatureColor[] = [
  { name: "black", label: "Black", color: "rgb(0, 0, 0)" },
  { name: "dark blue", label: "Dark Blue", color: "rgb(0, 0, 128)" },
  {
    name: "crimson",
    label: "Crimson",
    color: "#DC143C",
  },
];

export const SIGNATURE_FONTS: SignatureFont[] = [
  {
    name: "Dancing Script",
    variable: "var(--font-dancing-script)",
    family: "Dancing Script",
  },
  {
    name: "Parisienne",
    variable: "var(--font-parisienne)",
    family: "Parisienne",
  },
  {
    name: "Great Vibes",
    variable: "var(--font-great-vibes)",
    family: "Great Vibes",
  },
  {
    name: "Alex Brush",
    variable: "var(--font-alex-brush)",
    family: "Alex Brush",
  },
];
