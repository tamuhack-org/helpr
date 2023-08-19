import { User } from '@prisma/client';
import Image from 'next/image';
import React, { useState } from 'react';
import { FormControl, FormLabel, Switch, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { mutate } from 'swr';

const UserInfo = (props: { user: User; resetReader: () => void }) => {
  const toast = useToast();

  const [isAdmin, setIsAdmin] = useState(props.user.admin);
  const [isMentor, setIsMentor] = useState(props.user.mentor);

  async function toggleStatus(role: string, currentRole: boolean) {
    if (role != 'mentor' && role != 'admin') return;

    await axios
      .post(`/api/users/${role}toggle`, {
        id: props.user.id,
        currentRole: currentRole,
      })
      .then(async function () {
        await mutate('/api/users/all');
        if (role === 'mentor') setIsMentor((prev) => !prev);
        if (role === 'admin') setIsAdmin((prev) => !prev);
        toast({
          title: 'Success!',
          description: `Successfully updated ${props.user.name}'s ${role} status.`,
          status: 'success',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(function (error) {
        console.log(error);
        toast({
          title: 'Error!',
          description: `Failed to update ${props.user.name}'s ${role} status.`,
          status: 'error',
          position: 'bottom-right',
          duration: 3000,
          isClosable: true,
        });
      });
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col items-center w-full gap-4">
        {props.user.image ? (
          <Image
            src={props.user.image}
            alt="user-image"
            className="rounded-full"
            width={96}
            height={96}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 36px, 50px"
          />
        ) : (
          <div className="w-12 rounded-full bg-gray-400" />
        )}
        <div className="flex flex-col w-full text-center">
          <h1 className="font-bold text-lg">{props.user.name}</h1>
          <p>{props.user.email}</p>
          <div className="flex flex-col mt-8 gap-1">
            <FormControl display="flex" justifyContent="space-between">
              <FormLabel>Mentor?</FormLabel>
              <Switch
                isChecked={isMentor}
                onChange={() => toggleStatus('mentor', isMentor)}
              />
            </FormControl>
            <FormControl display="flex" justifyContent="space-between">
              <FormLabel>Admin?</FormLabel>
              <Switch
                isChecked={isAdmin}
                onChange={() => toggleStatus('admin', isAdmin)}
              />
            </FormControl>
          </div>
        </div>
        <button className="underline" onClick={() => props.resetReader()}>
          Scan another user
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
