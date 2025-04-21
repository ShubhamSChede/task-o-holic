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

type ProfileFormProps = {
  initialData: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  userEmail: string;
};

export default function ProfileForm({ initialData, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
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
            <Input
              id="avatar_url"
              name="avatar_url"
              type="text"
              value={formData.avatar_url}
              onChange={handleChange}
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
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