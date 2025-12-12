import { useState } from "react";
import { FolderDetailModal } from "../FolderDetailModal";
import { Button } from "@/components/ui/button";

export default function FolderDetailModalExample() {
  const [open, setOpen] = useState(false);

  const mockFolder = {
    id: "1",
    name: "Cálculo III - Integrais",
    createdAt: new Date(),
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir Pasta</Button>
      <FolderDetailModal
        folder={mockFolder}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
