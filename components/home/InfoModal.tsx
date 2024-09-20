import React from 'react';
import { VscInfo } from 'react-icons/vsc';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { QRCode } from 'react-qrcode-logo';

export const InfoModal = ({ email }: { email: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <VscInfo className="scale-125 cursor-pointer" onClick={onOpen}>
        Open Modal
      </VscInfo>
      <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>About HelpR</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p className="text-gray-700">
              HelpR allows hackathon participants to request mentoring during
              the event. Submit a ticket and a mentor will arrive shortly!
            </p>
            <p className="my-4 text-gray-700">
              If you are a mentor, please show your QR code to a TAMUhack team
              member to check in and receive mentor privileges.
            </p>
            <div className="h-auto mx-auto max-w-[128px] w-full mb-4">
              <QRCode
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={email}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
