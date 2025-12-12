import { FolderCard } from "../FolderCard";

export default function FolderCardExample() {
  const mockFolder = {
    id: "1",
    name: "Cálculo III - Integrais",
    createdAt: new Date(),
  };

  return (
    <div className="max-w-xs">
      <FolderCard
        folder={mockFolder}
        onOpen={(f) => console.log("Open folder:", f.name)}
        onDelete={(f) => console.log("Delete folder:", f.name)}
      />
    </div>
  );
}
