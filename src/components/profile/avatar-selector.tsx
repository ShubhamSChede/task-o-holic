// src/components/profile/avatar-selector.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Local avatar filenames from public/avatars (stored in DB as just filename)
const AVATAR_FILENAMES = [
  "9434619.jpg",
  "9434937.jpg",
  "9439685.jpg",
  "9439726.jpg",
  "9439775.jpg",
  "9442242.jpg"
];

// Helper to get full path for display
const getAvatarPath = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  // If already a full path, return as is (for backward compatibility)
  if (filename.startsWith('/')) return filename;
  // Otherwise prepend /avatars/
  return `/avatars/${filename}`;
};

interface AvatarSelectorProps {
  currentAvatar?: string | null;
  onAvatarSelect: (avatarUrl: string) => void;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export default function AvatarSelector({ 
  currentAvatar, 
  onAvatarSelect, 
  onSave,
  showSaveButton = false 
}: AvatarSelectorProps) {
  // Normalize currentAvatar: if it's a path, extract filename; if it's a filename, use as is
  const normalizeAvatar = (avatar: string | null | undefined): string | null => {
    if (!avatar) return null;
    // If it's a full path, extract just the filename
    if (avatar.includes('/')) {
      return avatar.split('/').pop() || null;
    }
    // Otherwise it's already a filename
    return avatar;
  };

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(normalizeAvatar(currentAvatar));
  const [currentPage, setCurrentPage] = useState(0);

  const AVATARS_PER_PAGE = 6;
  const totalPages = Math.ceil(AVATAR_FILENAMES.length / AVATARS_PER_PAGE);
  const currentAvatars = AVATAR_FILENAMES.slice(
    currentPage * AVATARS_PER_PAGE,
    (currentPage + 1) * AVATARS_PER_PAGE
  );

  const handleAvatarSelect = (filename: string) => {
    setSelectedAvatar(filename);
    // Pass filename to parent (will be stored in DB)
    onAvatarSelect(filename);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <CardHeader>
        <CardTitle className="text-slate-50">Choose avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {currentAvatars.map((filename, index) => {
              const avatarPath = getAvatarPath(filename);
              return (
                <div
                  key={filename}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedAvatar === filename
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105'
                      : 'hover:scale-105 hover:shadow-lg'
                  }`}
                  onClick={() => handleAvatarSelect(filename)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900">
                    {avatarPath && (
                      <Image
                        src={avatarPath}
                        alt={`Avatar ${index + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {selectedAvatar === filename && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-cyan-400/10">
                      <div className="rounded-full bg-cyan-400 p-2 text-slate-950">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentPage ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Save Button */}
        {showSaveButton && onSave && (
          <div className="flex justify-center">
            <Button
              onClick={onSave}
              disabled={!selectedAvatar}
              className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
            >
              Save avatar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
