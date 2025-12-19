// src/components/frequent-task/frequent-task-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type FrequentTaskFormProps = {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    priority?: string;
    tags?: string[];
  };
  organizations: {
    id: string;
    name: string;
  }[];
  preSelectedOrgId?: string;
  mode: 'create' | 'edit';
};

export default function FrequentTaskForm({ 
  initialData, 
  organizations,
  preSelectedOrgId,
  mode 
}: FrequentTaskFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || '',
    tags: initialData?.tags?.join(', ') || '',
    organization_id: preSelectedOrgId || initialData?.id || (organizations[0]?.id || ''),
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Check if user is the creator of the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('created_by')
        // @ts-ignore - Supabase type inference issue with .eq()
        .eq('id', formData.organization_id)
        .single();
      
      if (orgError) throw orgError;
      if (!org || (org as { created_by: string }).created_by !== userData.user.id) {
        throw new Error('Only the organization creator can manage frequent tasks');
      }
      
      if (mode === 'create') {
        const taskData = {
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority || null,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : null,
          organization_id: formData.organization_id,
          created_by: userData.user.id,
        };
        
        const { error: createError } = await supabase
          .from('frequent_tasks')
          // @ts-ignore - Supabase type inference issue with .insert()
          .insert(taskData);
        
        if (createError) throw createError;
      } else if (mode === 'edit' && initialData?.id) {
        const taskData = {
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority || null,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : null,
        };
        
        const { error: updateError } = await supabase
          .from('frequent_tasks')
          // @ts-ignore - Supabase type inference issue with .update()
          .update(taskData)
          // @ts-ignore - Supabase type inference issue with .eq()
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
      }
      
      router.push(`/organizations/${formData.organization_id}`);
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
            <Label htmlFor="title" className="text-purple-700">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
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
            <Label htmlFor="priority" className="text-purple-700">
              Priority
            </Label>
            <Select
              value={formData.priority || "none"}
              onValueChange={(value) => handleSelectChange('priority', value === "none" ? "" : value)}
              disabled={loading}
            >
              <SelectTrigger className="border-purple-200 text-purple-900 focus:ring-purple-500">
                <SelectValue placeholder="-- Select Priority --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Select Priority --</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-purple-700">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="work, project, meeting"
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization_id" className="text-purple-700">
              Organization *
            </Label>
            <Select
              value={formData.organization_id}
              onValueChange={(value) => handleSelectChange('organization_id', value)}
              disabled={loading || !!preSelectedOrgId}
            >
              <SelectTrigger className="border-purple-200 text-purple-900 focus:ring-purple-500">
                <SelectValue placeholder="-- Select Organization --" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-start space-x-4 px-6 pb-6">
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
              mode === 'create' ? 'Create Template' : 'Update Template'
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