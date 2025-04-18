'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface DirectoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

const DirectoryCard: React.FC<DirectoryCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  className = '',
}) => {
  return (
    <Link href={href}>
      <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${className}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <Icon className="h-5 w-5 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{description}</p>
          
          <div className="mt-auto">
            <span className="inline-flex items-center text-blue-600 font-medium hover:underline">
              Explore
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DirectoryCard; 