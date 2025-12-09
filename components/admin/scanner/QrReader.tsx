import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@prisma/client';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MdQrCodeScanner } from 'react-icons/md';
import UserInfo from './UserInfo';

const QrReader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>();

  const resetReader = () => {
    setEmail('');
    setUser(null);
  };

  useEffect(() => {
    async function lookupUser(email: string) {
      await axios
        .get(`/api/users/lookup?email=${email}`)
        .then(function (res) {
          if (!res?.data.user) {
            toast({
              title: 'User not found!',
              description: `Failed to find user with email ${email}.`,
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
                <Scanner
                  onScan={(detectedCodes) => {
                    if (detectedCodes.length > 0) {
                      setEmail(detectedCodes[0].rawValue);
                    }
                  }}
                  onError={(error) => console.log(error)}
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
