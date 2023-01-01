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
  useToast,
} from '@chakra-ui/react';

export default function InfoModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  function copyToClipboard() {
    navigator.clipboard.writeText('hello@tamuhack.com');
    const id = 'email-toast';
    if (!toast.isActive(id)) {
      toast({
        id,
        title: 'Email copied to clipboard!',
        status: 'success',
        position: 'bottom-right',
        duration: 3000,
        isClosable: true,
      });
    }
  }

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
              HelpR is currently under development. If you experience any
              problems, please reach out to TAMUhack at{' '}
              <a
                className="underline cursor-pointer font-medium"
                onClick={() => copyToClipboard()}
              >
                hello@tamuhack.com
              </a>{' '}
              or reach out to{' '}
              <a
                href="https://abhishekmore.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                a team member.
              </a>
            </p>
            <p className="my-4 text-gray-700">
              If you are a mentor, please see a member of the TAMUhack team to
              check in and receive mentor privileges.
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
