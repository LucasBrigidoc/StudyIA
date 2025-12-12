import { useState } from "react";
import { FolderSelector } from "../FolderSelector";

export default function FolderSelectorExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-md">
      <FolderSelector
        selectedFolderId={selected}
        onSelect={setSelected}
        onCreateNew={() => console.log("Create new folder clicked")}
      />
    </div>
  );
}
