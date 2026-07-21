"use client";

import React, {
  MutableRefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

// Signature Canvas
import SignatureCanvas from "react-signature-canvas";
import { SIGNATURE_COLORS, SIGNATURE_FONTS } from "../variable";

// Variables

export interface SignatureColor {
  name: string;
  color: string;
  label: string;
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

// Types

interface SignatureContextType {
  signatureData: string;
  signatureRef: MutableRefObject<SignatureCanvas | null> | null;
  colors: SignatureColor[];
  selectedColor: string;
  handleColorButtonClick: (color: string) => void;
  clearSignature: () => void;
  handleCanvasEnd: () => void;
  typedSignature: string;
  setTypedSignature: (value: string) => void;
  typedSignatureRef: MutableRefObject<HTMLInputElement | null> | null;
  typedSignatureFonts: SignatureFont[];
  selectedFont: SignatureFont;
  setSelectedFont: (value: SignatureFont) => void;
  typedSignatureFontSize: number;
  clearTypedSignature: () => void;
  uploadSignatureRef: MutableRefObject<HTMLInputElement | null> | null;
  uploadSignatureImg: string;
  handleUploadSignatureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveUploadedSignature: () => void;
  onSignatureChange?: (signature: File | null) => void;
}

const defaultSignatureContext: SignatureContextType = {
  signatureData: "",
  signatureRef: null,
  colors: [],
  selectedColor: "",
  handleColorButtonClick: () => {},
  clearSignature: () => {},
  handleCanvasEnd: () => {},
  typedSignature: "",
  setTypedSignature: () => {},
  typedSignatureRef: null,
  typedSignatureFonts: [],
  selectedFont: {} as SignatureFont,
  setSelectedFont: () => {},
  typedSignatureFontSize: 0,
  clearTypedSignature: () => {},
  uploadSignatureRef: null,
  uploadSignatureImg: "",
  handleUploadSignatureChange: () => {},
  handleRemoveUploadedSignature: () => {},
};

export const SignatureContext = createContext<SignatureContextType>(
  defaultSignatureContext,
);

export const useSignatureContext = () => {
  return useContext(SignatureContext);
};

type SignatureContextProviderProps = {
  children: React.ReactNode;
  onSignatureChange?: (signature: File | null) => void;
  initialSignature?: string;
};

// Convert base64 to File
const base64ToFile = async (base64String: string): Promise<File> => {
  // Remove the data URL prefix (e.g., "data:image/png;base64,")
  const base64Data = base64String.split(",")[1];

  // Convert base64 to blob
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: "image/png" });

  // Create File object
  return new File([blob], `signature_${Date.now()}.png`, { type: "image/png" });
};

export const SignatureContextProvider = ({
  children,
  onSignatureChange,
  initialSignature = "",
}: SignatureContextProviderProps) => {
  // Signature in base64 or as string
  const [signatureData, setSignatureData] = useState(initialSignature);

  // Signature
  const signatureRef = useRef<SignatureCanvas | null>(null);

  // Colors
  const colors: SignatureColor[] = SIGNATURE_COLORS;
  const [selectedColor, setSelectedColor] = useState<string>(colors[0].color);

  // Keep internal state in sync when initialSignature prop changes (e.g., edit mode prefill)
  useEffect(() => {
    setSignatureData(initialSignature || "");
  }, [initialSignature]);

  /**
   * Sets selected signature color
   */
  const handleColorButtonClick = (color: string) => {
    setSelectedColor(color);
  };

  /**
   * Clears drawn signature canvas
   */
  const clearSignature = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData("");
      onSignatureChange?.(null);
    }
  }, [onSignatureChange]);

  /**
   * Fires every time canvas drawing stops
   */
  const handleCanvasEnd = useCallback(async () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL("image/png");
      setSignatureData(dataUrl);
      try {
        const file = await base64ToFile(dataUrl);
        onSignatureChange?.(file);
      } catch (error) {
        console.error("Error converting signature to file:", error);
        onSignatureChange?.(null);
      }
    }
  }, [onSignatureChange]);

  /**
   * * TYPED SIGNATURE
   */

  // Value in typed input
  const [typedSignature, setTypedSignature] =
    useState<string>(initialSignature);

  // Typed signature input ref
  const typedSignatureRef = useRef<HTMLInputElement | null>(null);

  // All available fonts for typed signature input
  const typedSignatureFonts: SignatureFont[] = SIGNATURE_FONTS;

  const [selectedFont, setSelectedFont] = useState<SignatureFont>(
    typedSignatureFonts[0],
  );

  /**
   * Font size calculator for typed signature
   */
  const calculateFontSize = (text: string) => {
    const maxWidth = 300; // Maximum width for the signature
    // const maxHeight = 50; // Maximum height for the signature
    const baseFontSize = 40; // Base font size

    if (!text) return baseFontSize;

    // Create a temporary canvas to measure text
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseFontSize;

    // Start with base font size
    let fontSize = baseFontSize;
    ctx.font = `${fontSize}px ${selectedFont.family}`;

    // Get text metrics
    let metrics = ctx.measureText(text);

    // Adjust font size if text is too wide
    while (metrics.width > maxWidth && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `${fontSize}px ${selectedFont.family}`;
      metrics = ctx.measureText(text);
    }

    return fontSize;
  };

  /**
   * Memoized typed signature font size
   */
  const typedSignatureFontSize = useMemo(
    () => calculateFontSize(typedSignature),
    [typedSignature],
  );

  /**
   * Clears typed signature
   */
  const clearTypedSignature = () => {
    setTypedSignature("");
    onSignatureChange?.(null);
  };

  /**
   * * UPLOAD SIGNATURE
   */
  const uploadSignatureRef = useRef<HTMLInputElement | null>(null);
  const [uploadSignatureImg, setUploadSignatureImg] = useState<string>("");

  /**
   * Function that fires every time signature file input changes
   */
  const handleUploadSignatureChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files![0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target!.result as string;
        setUploadSignatureImg(base64String);
        try {
          const signatureFile = await base64ToFile(base64String);
          onSignatureChange?.(signatureFile);
        } catch (error) {
          console.error("Error converting signature to file:", error);
          onSignatureChange?.(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Function that removes uploaded signature
   */
  const handleRemoveUploadedSignature = () => {
    setUploadSignatureImg("");
    onSignatureChange?.(null);

    if (uploadSignatureRef.current) {
      uploadSignatureRef.current.value = "";
    }
  };

  return (
    <SignatureContext.Provider
      value={{
        signatureData,
        signatureRef,
        colors,
        selectedColor,
        handleColorButtonClick,
        clearSignature,
        handleCanvasEnd,
        typedSignature,
        setTypedSignature,
        typedSignatureRef,
        typedSignatureFonts,
        selectedFont,
        setSelectedFont,
        typedSignatureFontSize,
        clearTypedSignature,
        uploadSignatureRef,
        uploadSignatureImg,
        handleUploadSignatureChange,
        handleRemoveUploadedSignature,
        onSignatureChange,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
};
