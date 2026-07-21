export interface SignatureColor {
  name: string;
  label: string;
  color: string;
}

export interface SignatureFont {
  name: string;
  family: string;
  variable: string;
}

export enum SignatureTabs {
  DRAW = "draw",
  TYPE = "type",
  UPLOAD = "upload",
}
