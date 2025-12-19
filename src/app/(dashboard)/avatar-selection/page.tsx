// src/app/(dashboard)/avatar-selection/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import Loader from '@/components/Loader';
import { useProfile } from '@/contexts/profile-context';

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

export default function AvatarSelectionPage() {
  const router = useRouter();
  const supabase = createClient();
  const { refreshProfile } = useProfile();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const AVATARS_PER_PAGE = 6;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [router, supabase]);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar || !user) return;
    
    setIsLoading(true);
    try {
      const updateData: { avatar_url: string } = { avatar_url: selectedAvatar };
      const { error } = await supabase
        .from('profiles')
        .update(updateData as any)
        .eq('id', user.id);

          if (error) throw error;

          // Refresh profile data to update sidebar
          await refreshProfile();
          router.push('/dashboard');
          router.refresh();
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const totalPages = Math.ceil(AVATAR_URLS.length / AVATARS_PER_PAGE);
  const currentAvatars = AVATAR_URLS.slice(
    currentPage * AVATARS_PER_PAGE,
    (currentPage + 1) * AVATARS_PER_PAGE
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl border-purple-200 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">👤</span>
            </div>
            <h1 className="text-4xl font-bold text-purple-800 mb-2">
              Choose Your Avatar
            </h1>
            <p className="text-purple-600 text-lg">
              Select an avatar to personalize your profile
            </p>
          </div>

          {/* Avatar Grid with Side-sliding Animation */}
          <div className="relative mb-8">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className={`grid grid-cols-2 md:grid-cols-3 gap-6 transition-transform duration-300 ease-in-out ${
                  isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {currentAvatars.map((avatarUrl, index) => (
                  <div
                    key={`${currentPage}-${index}`}
                    className={`relative cursor-pointer transition-all duration-300 transform ${
                      selectedAvatar === avatarUrl
                        ? 'ring-4 ring-purple-500 ring-offset-4 scale-110 shadow-2xl'
                        : 'hover:scale-105 hover:shadow-xl'
                    }`}
                    onClick={() => handleAvatarSelect(avatarUrl)}
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    {selectedAvatar === avatarUrl && (
                      <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center rounded-2xl">
                        <div className="bg-purple-500 text-white rounded-full p-3 shadow-lg animate-pulse">
                          <Check className="h-8 w-8" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation with Enhanced Styling */}
            <div className="flex justify-center items-center space-x-6 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex space-x-3">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentPage(i);
                        setIsAnimating(false);
                      }, 150);
                    }}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      i === currentPage 
                        ? 'bg-purple-500 scale-125 shadow-lg' 
                        : 'bg-purple-200 hover:bg-purple-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Action Buttons with Enhanced Styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg font-medium transition-all duration-200"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={!selectedAvatar || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  Save Avatar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
