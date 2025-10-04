import {
  Button,
} from "@heroui/button";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/modal";

export default function FilterPopup({ isOpen, onOpenChange }) {  // Recebe isOpen e onOpenChange como props
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="z-[1000]">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
            <ModalBody>
              <p>
                FILTROS
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Action
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}