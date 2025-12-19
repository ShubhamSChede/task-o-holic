// src/components/profile/profile-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardFooter 
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

export default function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { refreshProfile } = useProfile();
  
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    avatar_url: initialData.avatar_url || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
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
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="border-purple-200 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive" className="bg-red-50 text-red-500 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 text-green-500 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="border-purple-200 bg-gray-50 text-purple-900"
            />
            <p className="text-sm text-purple-500">
              Email cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-purple-700">
              Full Name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar_url" className="text-purple-700">
              Avatar URL
            </Label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar Preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                    onError={(e) => {
                      // Show fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg border-2 border-purple-200 ${formData.avatar_url ? 'hidden' : ''}`}
                >
                  {formData.full_name?.charAt(0) || userEmail.charAt(0) || '?'}
                </div>
              </div>
              <div className="flex-1">
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
                  disabled={loading}
                />
                <p className="text-xs text-purple-500 mt-1">
                  Enter a valid image URL (JPG, PNG, GIF)
                </p>
              </div>
            </div>
          </div>
          
          {/* Avatar Selector */}
          <AvatarSelector
            currentAvatar={formData.avatar_url}
            onAvatarSelect={(avatarUrl) => setFormData(prev => ({ ...prev, avatar_url: avatarUrl }))}
          />
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}