import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

// Tipando as props do componente
interface FilterPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FilterPopup({
  isOpen,
  onOpenChange,
}: FilterPopupProps) {
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");

  const handleApply = () => {
    console.log("Start Date/Time:", startDateTime);
    console.log("End Date/Time::", endDateTime);
    onOpenChange(false); // Fecha o modal
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="z-[1000]">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Filters</ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="startDateTime">Start Date/Time:</label>
                <input
                  id="startDateTime"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="endDateTime">End Date/Time:</label>
                <input
                  id="endDateTime"
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2">
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleApply}>
                Apply
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
