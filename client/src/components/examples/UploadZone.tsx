import { useState } from "react";
import { UploadZone } from "../UploadZone";

export default function UploadZoneExample() {
  const [text, setText] = useState("");

  return (
    <div className="max-w-lg">
      <UploadZone
        onFilesChange={(files) => console.log("Files changed:", files)}
        onTextChange={setText}
        extractedText={text}
        isProcessing={false}
      />
    </div>
  );
}
