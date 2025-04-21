// src/components/organization/org-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type OrgFormProps = {
  mode: 'create';
} | {
  mode: 'edit';
  initialData: {
    id: string;
    name: string;
    description?: string;
    password: string;
  };
};

export default function OrgForm(props: OrgFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const initialData = props.mode === 'edit' ? props.initialData : null;
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    password: initialData?.password || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      const orgData = {
        name: formData.name,
        description: formData.description || null,
        password: formData.password,
        created_by: userData.user.id,
      };
      
      if (props.mode === 'create') {
        // Create organization
        const { data: org, error: createError } = await supabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single();
        
        if (createError) throw createError;
        if (!org) throw new Error('Failed to create organization');
        
        // Add creator as a member with admin role
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: userData.user.id,
            role: 'admin',
          });
        
        if (memberError) throw memberError;
        
        router.push(`/organizations/${org.id}`);
      } else if (props.mode === 'edit' && initialData) {
        // Update organization
        const { error: updateError } = await supabase
          .from('organizations')
          .update(orgData)
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
        
        router.push(`/organizations/${initialData.id}`);
      }
      
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
            <Label htmlFor="description" className="text-purple-700">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500 resize-none"
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
            <p className="mt-1 text-xs text-purple-500">
              Members will need this password to join the organization.
            </p>
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
                Saving...
              </>
            ) : (
              props.mode === 'create' 
                ? 'Create Organization' 
                : 'Update Organization'
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