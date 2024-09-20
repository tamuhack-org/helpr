import React from 'react';
import { User } from '@prisma/client';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { mutate } from 'swr';

export const AdminStatus = ({ user }: { user: User }) => {
  const toast = useToast();

  //role is either 'mentor' or 'admin'
  //currentRole is the current status of the role
  async function toggleStatus(role: string, currentRole: boolean) {
    if (role != 'mentor' && role != 'admin') return;

    await axios
      .post(`/api/users/${role}toggle`, {
        id: user.id,
        currentRole: currentRole,
      })
      .then(async function () {
        await mutate('/api/users/all');
        toast({
          title: 'Success!',
          description: `Successfully updated ${user.name}'s ${role} status.`,
          status: 'success',
        });
      })
      .catch(function (error) {
        console.log(error);
        toast({
          title: 'Error!',
          description: `Failed to update ${user.name}'s ${role} status.`,
          status: 'error',
        });
      });
  }

  return (
    <div>
      <div className="flex items-center flex-shrink-0">
        <a
          onClick={() => toggleStatus('mentor', user.mentor)}
          className={`${
            user.mentor
              ? 'bg-blue-500 text-white border-2 border-blue-500'
              : 'border-2 border-gray-300'
          } py-2 px-4 mr-2 rounded-md text-xs sm:text-sm font-medium cursor-pointer`}
        >
          MENTOR
        </a>
        <a
          onClick={() => toggleStatus('admin', user.admin)}
          className={`${
            user.admin
              ? 'bg-blue-500 text-white border-2 border-blue-500'
              : 'border-2 border-gray-300'
          } py-2 px-4 rounded-md text-xs sm:text-sm font-medium cursor-pointer`}
        >
          ADMIN
        </a>
      </div>
    </div>
  );
};
