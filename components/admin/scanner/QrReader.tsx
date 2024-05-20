import React, { useEffect, useState } from 'react';
import { MdQrCodeScanner } from 'react-icons/md';
import { QrScanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { User } from '@prisma/client';
import UserInfo from './UserInfo';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

const QrReader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>();

  function resetReader() {
    setEmail('');
    setUser(null);
  }

  useEffect(() => {
    async function lookupUser(email: string) {
      await axios
        .get(`/api/users/lookup?email=${email}`)
        .then(function (res) {
          if (!res?.data.user) {
            toast({
              title: 'User not found!',
              description: `Failed to find user with email ${email}.`,
              status: 'error',
              position: 'bottom-right',
              duration: 1000,
              isClosable: true,
            });
            resetReader();
          } else {
            setUser(res?.data.user);
          }
        })
        .catch(function (error) {
          console.log(error);
          toast({
            title: 'Error!',
            description: `Failed to look up user.`,
            status: 'error',
            position: 'bottom-right',
            duration: 1000,
            isClosable: true,
          });
        });
    }
    if (email !== '') lookupUser(email);
  }, [email, toast]);

  useEffect(() => {
    if (!isOpen) resetReader();
  }, [isOpen]);

  return (
    <>
      <button
        className="flex flex-row items-center justify-center text-center py-4 px-8 bg-blue-500 text-white font-bold rounded-xl cursor-pointer w-full gap-3"
        onClick={onOpen}
      >
        <MdQrCodeScanner size={24} />
        Scan User
      </button>
      <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {user ? 'User Information' : 'Scan QR Code'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="pb-4">
              {user ? (
                <UserInfo user={user} resetReader={resetReader} />
              ) : (
                <QrScanner
                  onDecode={(result) => setEmail(result)}
                  onError={(error) => console.log(error?.message)}
                />
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default QrReader;
