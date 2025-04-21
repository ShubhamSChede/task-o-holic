// src/components/organization/org-join-form.tsx
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
import { Loader2 } from "lucide-react";

export default function OrgJoinForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Find organization by name and password
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, password')
        .eq('name', formData.name)
        .single();
      
      if (orgError) {
        if (orgError.code === 'PGRST116') {
          throw new Error('Organization not found');
        }
        throw orgError;
      }
      
      // Verify password
      if (org.password !== formData.password) {
        throw new Error('Incorrect password');
      }
      
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', org.id)
        .eq('user_id', userData.user.id)
        .single();
      
      if (existingMember) {
        throw new Error('You are already a member of this organization');
      }
      
      // Add user as a member
      const { error: joinError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userData.user.id,
          role: 'member',
        });
      
      if (joinError) throw joinError;
      
      router.push(`/organizations/${org.id}`);
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-700">
              Organization Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-700">
              Password *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-start space-x-4 px-6 pb-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Organization'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}