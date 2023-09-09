import { Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import React from 'react'

const MiniUsersDisplay = ({ role, number }: { role: string; number: number }) => {
  return (
    <div className="flex flex-shrink-0 gap-4 border-[1px] border-gray-200 rounded-lg text-sm p-4">
      <Stat>
        <StatLabel>{role}</StatLabel>
        <StatNumber>{number}</StatNumber>
      </Stat>
    </div>
  );
};

export default MiniUsersDisplay