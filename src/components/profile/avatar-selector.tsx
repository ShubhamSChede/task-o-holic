// src/components/profile/avatar-selector.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Avatar URLs from the provided list
const AVATAR_URLS = [
  "https://avatar.iran.liara.run/public/50",
  "https://avatar.iran.liara.run/public/22", 
  "https://avatar.iran.liara.run/public/45",
  "https://avatar.iran.liara.run/public/2",
  "https://avatar.iran.liara.run/public/7",
  "https://avatar.iran.liara.run/public/37",
  "https://avatar.iran.liara.run/public/58",
  "https://avatar.iran.liara.run/public/91",
  "https://avatar.iran.liara.run/public/86",
  "https://avatar.iran.liara.run/public/93",
  "https://avatar.iran.liara.run/public/98",
  "https://avatar.iran.liara.run/public/61"
];

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
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
  const [currentPage, setCurrentPage] = useState(0);

  const AVATARS_PER_PAGE = 6;
  const totalPages = Math.ceil(AVATAR_URLS.length / AVATARS_PER_PAGE);
  const currentAvatars = AVATAR_URLS.slice(
    currentPage * AVATARS_PER_PAGE,
    (currentPage + 1) * AVATARS_PER_PAGE
  );

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onAvatarSelect(avatarUrl);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Card className="border-purple-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-purple-800">Choose Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {currentAvatars.map((avatarUrl, index) => (
              <div
                key={avatarUrl}
                className={`relative cursor-pointer transition-all duration-200 ${
                  selectedAvatar === avatarUrl
                    ? 'ring-4 ring-purple-500 ring-offset-2 scale-105'
                    : 'hover:scale-105 hover:shadow-lg'
                }`}
                onClick={() => handleAvatarSelect(avatarUrl)}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={avatarUrl}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedAvatar === avatarUrl && (
                  <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center rounded-xl">
                    <div className="bg-purple-500 text-white rounded-full p-2">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentPage ? 'bg-purple-500' : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
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
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save Avatar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
