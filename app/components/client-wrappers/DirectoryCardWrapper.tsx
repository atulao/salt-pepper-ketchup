'use client';

import React from 'react';
import DirectoryCard from '../DirectoryCard';
import { Map, Landmark, Library, Coffee, FerrisWheel, Utensils } from 'lucide-react';

const DirectoryCardWrapper: React.FC = () => {
  return (
    <>
      <DirectoryCard
        title="Buildings Directory"
        description="Information about campus buildings and facilities"
        icon={Map}
        href="/buildings"
      />
      {/* Add more directory cards in the future */}
    </>
  );
};

export default DirectoryCardWrapper; 