// src/app/(dashboard)/avatar-selection/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import Loader from '@/components/Loader';
import { useProfile } from '@/contexts/profile-context';

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

export default function AvatarSelectionPage() {
  const router = useRouter();
  const supabase = createClient();
  const { refreshProfile } = useProfile();
  type SupabaseUser = {
    id: string;
  };
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
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

  const handleAvatarSelect = (filename: string) => {
    setSelectedAvatar(filename);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar || !user) return;
    
    setIsLoading(true);
    try {
      // Save only the filename to database
      const updateData: { avatar_url: string } = { avatar_url: selectedAvatar };
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue with .update()
        .update(updateData)
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

  const totalPages = Math.ceil(AVATAR_FILENAMES.length / AVATARS_PER_PAGE);
  const currentAvatars = AVATAR_FILENAMES.slice(
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-5xl border-slate-800/80 bg-slate-950/80 shadow-[0_24px_70px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10">
              <span className="text-2xl font-semibold">👤</span>
            </div>
            <h1 className="mb-2 text-4xl font-semibold text-slate-50">
              Choose your avatar
            </h1>
            <p className="text-base text-slate-400">
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
                {currentAvatars.map((filename, index) => {
                  const avatarPath = getAvatarPath(filename);
                  return (
                    <div
                      key={`${currentPage}-${index}`}
                      className={`relative cursor-pointer transition-all duration-300 transform ${
                        selectedAvatar === filename
                          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-2xl'
                          : 'hover:scale-105 hover:shadow-xl'
                      }`}
                      onClick={() => handleAvatarSelect(filename)}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
                        {avatarPath && (
                          <Image
                            src={avatarPath}
                            alt={`Avatar ${index + 1}`}
                            fill
                            sizes="150px"
                            className="object-cover transition-transform duration-300 hover:scale-110"
                          />
                        )}
                      </div>
                      {selectedAvatar === filename && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-cyan-400/10">
                          <div className="rounded-full bg-cyan-400 p-3 text-slate-950 shadow-lg">
                            <Check className="h-8 w-8" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation with Enhanced Styling */}
            <div className="flex justify-center items-center space-x-6 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
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
                    className={`h-4 w-4 rounded-full transition-all duration-200 ${
                      i === currentPage 
                        ? 'bg-cyan-400 scale-125 shadow-lg' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Action Buttons with Enhanced Styling */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="border-slate-700 bg-slate-900 px-8 py-3 text-lg font-medium text-slate-200 transition-all duration-200 hover:bg-slate-800"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={!selectedAvatar || isLoading}
              className="bg-cyan-400 px-8 py-3 text-lg font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span className="ml-2">Saving…</span>
                </>
              ) : (
                <>
                  Save avatar
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
