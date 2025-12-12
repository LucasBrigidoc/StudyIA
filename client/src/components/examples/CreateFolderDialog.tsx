import { useState } from "react";
import { CreateFolderDialog } from "../CreateFolderDialog";
import { Button } from "@/components/ui/button";

export default function CreateFolderDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Criar Pasta</Button>
      <CreateFolderDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(name) => console.log("Folder created:", name)}
      />
    </>
  );
}
