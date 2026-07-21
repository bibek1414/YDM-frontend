"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useSignatureContext } from "./SignatureContext";
import SignatureCanvas from "react-signature-canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignatureColor, SignatureFont } from "@/types/signature";

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

export default function SignatureModal() {
  const {
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
  } = useSignatureContext();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("draw");

  const handleSave = async () => {
    if (activeTab === "draw" && signatureData) {
      setOpen(false);
    } else if (activeTab === "type" && typedSignature) {
      // Convert typed signature to image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 300;
        canvas.height = 100;
        ctx.font = `${typedSignatureFontSize}px ${selectedFont.family}`;
        ctx.fillText(typedSignature, 10, 50);
        const dataUrl = canvas.toDataURL("image/png");
        try {
          const file = await base64ToFile(dataUrl);
          onSignatureChange?.(file);
          setOpen(false);
        } catch (error) {
          console.error("Error converting typed signature to file:", error);
        }
      }
    } else if (activeTab === "upload" && uploadSignatureImg) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer w-full bg-gray-50 hover:bg-gray-100 transition">
        {signatureData ? (
          <img
            src={signatureData}
            alt="Signature"
            className="max-h-full max-w-full object-contain"
          />
        ) : typedSignature ? (
          <div
            style={{
              fontFamily: selectedFont.family,
              fontSize: `${typedSignatureFontSize}px`,
            }}
            className="max-h-full max-w-full object-contain"
          >
            {typedSignature}
          </div>
        ) : uploadSignatureImg ? (
          <img
            src={uploadSignatureImg}
            alt="Uploaded signature"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center">
            <Pencil className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-gray-500">Click to add signature</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Signature</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="draw"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="draw" className="space-y-4">
            <div className="flex gap-2">
              {colors.map((color: SignatureColor) => (
                <button
                  key={color.color}
                  className={`w-8 h-8 rounded-full ${
                    selectedColor === color.color
                      ? "ring-2 ring-offset-2 ring-primary"
                      : ""
                  }`}
                  style={{ backgroundColor: color.color }}
                  onClick={() => handleColorButtonClick(color.color)}
                />
              ))}
            </div>
            <div className="border rounded-lg p-4">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-[200px]",
                  style: { border: "1px solid #e5e7eb" },
                }}
                penColor={selectedColor}
                onEnd={handleCanvasEnd}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clearSignature}>
                Clear
              </Button>
              <Button onClick={handleSave} disabled={!signatureData}>
                Save
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="type" className="space-y-4">
            <div className="space-y-2">
              <Label>Font</Label>
              <Select
                value={selectedFont.name}
                onValueChange={(value) =>
                  setSelectedFont(
                    typedSignatureFonts.find((font: SignatureFont) => font.name === value) ||
                      typedSignatureFonts[0]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {typedSignatureFonts.map((font: SignatureFont) => (
                    <SelectItem key={font.name} value={font.name}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Signature Text</Label>
              <Input
                ref={typedSignatureRef}
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your signature"
              />
            </div>
            <div className="border rounded-lg p-4">
              <div
                style={{
                  fontFamily: selectedFont.family,
                  fontSize: `${typedSignatureFontSize}px`,
                }}
                className="min-h-[200px] flex items-center justify-center"
              >
                {typedSignature}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clearTypedSignature}>
                Clear
              </Button>
              <Button onClick={handleSave} disabled={!typedSignature}>
                Save
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Signature</Label>
              <Input
                ref={uploadSignatureRef}
                type="file"
                accept="image/*"
                onChange={handleUploadSignatureChange}
              />
            </div>
            {uploadSignatureImg && (
              <div className="border rounded-lg p-4">
                <img
                  src={uploadSignatureImg}
                  alt="Uploaded signature"
                  className="max-h-[200px] mx-auto"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleRemoveUploadedSignature}
                disabled={!uploadSignatureImg}
              >
                Remove
              </Button>
              <Button onClick={handleSave} disabled={!uploadSignatureImg}>
                Save
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
