import React from "react";

// ShadCn
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

// Components
import SignatureFontSelector from "../components/SignatureFontSelector";

// Contexts
import { useSignatureContext } from "../SignatureContext";

// Icons
import { Check, Eraser } from "lucide-react";

// Types
import { SignatureTabs } from "@/types/signature";
import { Button } from "@/components/ui/button";

type TypeSignatureProps = {
  handleSaveSignature: () => void;
};

const TypeSignature = ({ handleSaveSignature }: TypeSignatureProps) => {
  const {
    typedSignatureFontSize,
    selectedFont,
    setSelectedFont,
    typedSignature,
    setTypedSignature,
    typedSignatureRef,
    typedSignatureFonts,
    clearTypedSignature,
  } = useSignatureContext();

  return (
    <TabsContent value={SignatureTabs.TYPE}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-4 p-0">
          <div className="space-y-2">
            <Input
              id="typed-signature"
              ref={typedSignatureRef}
              className="bg-transparent text-center"
              style={{
                fontSize: `${typedSignatureFontSize}px`,
                fontFamily: selectedFont.family,
              }}
              type="text"
              placeholder="Signature"
              value={typedSignature}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTypedSignature(e.target.value);
              }}
            />
          </div>

          {/* Preview container */}
          <div className="border rounded-lg p-4 min-h-[100px] flex items-center justify-center">
            <div
              style={{
                fontSize: `${typedSignatureFontSize}px`,
                fontFamily: selectedFont.family,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {typedSignature || "Preview"}
            </div>
          </div>
        </CardContent>
        <div className="flex justify-between gap-2 pt-2">
          <SignatureFontSelector
            typedSignatureFonts={typedSignatureFonts}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
          />

          {typedSignature && (
            <Button
              title="Clear signature"
              variant="outline"
              onClick={clearTypedSignature}
            >
              Clear
              <Eraser />
            </Button>
          )}

          <Button
            title="Save changes"
            disabled={!typedSignature}
            onClick={handleSaveSignature}
          >
            Done
            <Check />
          </Button>
        </div>
      </Card>
    </TabsContent>
  );
};

export default TypeSignature;
