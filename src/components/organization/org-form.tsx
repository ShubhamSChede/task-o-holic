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
import { Loader2, Copy, Check } from "lucide-react";
import type { Organization } from '@/types/supabase';

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
  const [copied, setCopied] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
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
          // @ts-expect-error - Supabase type inference issue with .insert()
          .insert(orgData)
          .select()
          .single();
        
        if (createError) throw createError;
        if (!org) throw new Error('Failed to create organization');
        
        // Type assertion: TypeScript doesn't recognize that error check throws
        const organization = org as unknown as Organization;
        
        // Add creator as a member with admin role
        const { error: memberError } = await supabase
          .from('organization_members')
          // @ts-expect-error - Supabase type inference issue with .insert()
          .insert({
            organization_id: organization.id,
            user_id: userData.user.id,
            role: 'admin',
          });
        
        if (memberError) throw memberError;
        
        router.push(`/organizations/${organization.id}`);
      } else if (props.mode === 'edit' && initialData) {
        // Update organization
        const { error: updateError } = await supabase
          .from('organizations')
          // @ts-expect-error - Supabase type inference issue with .update()
          .update(orgData)
          
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
        
        router.push(`/organizations/${initialData.id}`);
      }
      
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive" className="bg-red-950/60 text-red-300 border-red-500/40">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Organization Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400 resize-none"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400 pr-10"
                disabled={loading}
              />
              {formData.password && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="relative p-1 text-purple-500 hover:text-purple-700 transition-colors group"
                    disabled={loading}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-300" />
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-slate-100 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {copied ? 'Copied!' : 'Copy password'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Members will need this password to join the organization.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-start space-x-4 px-6 pb-6">
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
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
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}