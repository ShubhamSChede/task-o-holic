// src/components/profile/profile-form.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert";
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import AvatarSelector from './avatar-selector';
import { useProfile } from '@/contexts/profile-context';
import type { Profile } from '@/types/supabase';

type ProfileFormProps = {
  initialData: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  userEmail: string;
};

// Helper to get full path for display from filename stored in DB
const getAvatarPath = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  // If already a full path, return as is (for backward compatibility)
  if (filename.startsWith('/')) return filename;
  // Otherwise prepend /avatars/
  return `/avatars/${filename}`;
};

// Helper to normalize avatar: extract filename from path if needed
const normalizeAvatar = (avatar: string | null | undefined): string => {
  if (!avatar) return '';
  // If it's a full path, extract just the filename
  if (avatar.includes('/')) {
    return avatar.split('/').pop() || '';
  }
  // Otherwise it's already a filename
  return avatar;
};

export default function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { refreshProfile } = useProfile();
  
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    avatar_url: normalizeAvatar(initialData.avatar_url),
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarSelect = (filename: string) => {
    // Just update local state, don't save yet
    setFormData((prev) => ({ ...prev, avatar_url: filename }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue with .update()
        .update({
          full_name: formData.full_name || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq('id', initialData.id);
      
      if (updateError) throw updateError;
      
      setSuccess('Profile updated successfully');
      // Refresh profile data to update sidebar
      await refreshProfile();
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Alerts */}
      <div className="mb-6">
        {error && (
          <Alert variant="destructive" className="bg-red-950/60 text-red-300 border-red-500/40">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info & Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="border-slate-700 bg-slate-900 text-slate-400"
                />
                <p className="text-xs text-slate-500">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-semibold text-slate-50">Account settings</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-slate-200">Change password</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    To change your password, log out and use the &quot;Forgot Password&quot; option on the login page.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-red-400">Delete Account</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Deleting your account is permanent and cannot be undone. All your data will be permanently deleted.
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete my account
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Avatar Selection */}
        <div className="lg:col-span-1">
          <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <Label className="text-slate-300 text-xs uppercase tracking-[0.14em]">
                  Avatar
                </Label>
                <div className="flex flex-col items-center space-y-3">
                  {formData.avatar_url ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-cyan-400/50">
                      <Image 
                        src={getAvatarPath(formData.avatar_url) || ''} 
                        alt="Avatar Preview" 
                        fill
                        sizes="96px"
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    </div>
                  ) : null}
                  <div 
                    className={`flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-cyan-400/10 text-2xl font-semibold text-cyan-400 ${formData.avatar_url ? 'hidden' : ''}`}
                  >
                    {formData.full_name?.charAt(0) || userEmail.charAt(0) || '?'}
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Click an avatar below to select
                  </p>
                </div>
              </div>
              
              {/* Avatar Selector */}
              <AvatarSelector
                currentAvatar={formData.avatar_url}
                onAvatarSelect={handleAvatarSelect}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unified Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 px-8 py-2"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving changes...
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </form>
  );
}