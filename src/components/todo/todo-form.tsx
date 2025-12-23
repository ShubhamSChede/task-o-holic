// src/components/todo/todo-form.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import type { FrequentTask } from '@/types/supabase';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

type TodoFormProps = {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    due_date?: string;
    priority?: string;
    tags?: string[];
    organization_id?: string;
    is_complete?: boolean;
  };
  organizations: {
    id: string;
    name: string;
  }[];
  mode: 'create' | 'edit';
};

export default function TodoForm({ initialData, organizations, mode }: TodoFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
    priority: initialData?.priority || '',
    tags: initialData?.tags?.join(', ') || '',
    organization_id: initialData?.organization_id || '',
    is_complete: initialData?.is_complete || false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for template and organization parameters when the component mounts
  useEffect(() => {
    const loadTemplateData = async () => {
      const templateId = searchParams.get('template');
      const orgId = searchParams.get('org');
      
      if (templateId && mode === 'create') {
        setLoading(true);
        try {
          // Fetch the template data
          const { data: template, error } = await supabase
            .from('frequent_tasks')
            .select('*')
            
            .eq('id', templateId)
            .single();
          
          if (error) throw error;

          const typedTemplate = template as unknown as FrequentTask;
          
          // Pre-fill the form with template data
          setFormData(prev => ({
            ...prev,
            title: typedTemplate.title,
            description: typedTemplate.description || '',
            priority: typedTemplate.priority || '',
            tags: typedTemplate.tags?.join(', ') || '',
            organization_id: typedTemplate.organization_id || '',
          }));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error loading template';
          console.error(errorMessage);
        } finally {
          setLoading(false);
        }
      } else if (orgId && mode === 'create') {
        // Pre-select organization if org parameter is provided
        setFormData(prev => ({
          ...prev,
          organization_id: orgId,
        }));
      }
    };
    
    loadTemplateData();
  }, [searchParams, supabase, mode]);

  // Check if we're in organization-specific mode (has org parameter)
  const isOrgSpecific = searchParams.get('org') !== null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, due_date: date }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_complete: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const todoData = {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        priority: formData.priority || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        organization_id: formData.organization_id || null,
        is_complete: formData.is_complete,
        created_by: userData.user.id,
      };

      if (mode === 'create') {
        const { error: createError } = await supabase
          .from('todos')
          // @ts-expect-error - Supabase type inference issue with .insert()
          .insert(todoData);
        if (createError) throw createError;
      } else if (mode === 'edit' && initialData?.id) {
        const { error: updateError } = await supabase
          .from('todos')
          // @ts-expect-error - Supabase type inference issue with .update()
          .update(todoData)
          
          .eq('id', initialData.id);
        if (updateError) throw updateError;
      }

      router.push('/todo');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-200">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-purple-700">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={loading}
                    className={cn(
                      "w-full justify-start text-left font-normal border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      formatDate(formData.due_date)
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={handleDateChange}
                  />
                </PopoverContent>
              </Popover>
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
              placeholder="work, personal, project"
              className="border-purple-200 text-purple-900 focus-visible:ring-purple-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_id" className="text-purple-700">
              Organization
            </Label>
            <Select
              value={formData.organization_id || (isOrgSpecific && organizations.length === 1 ? organizations[0].id : "personal")}
              onValueChange={(value) => handleSelectChange('organization_id', value === "personal" ? "" : value)}
              disabled={loading}
            >
              <SelectTrigger className="border-purple-200 text-purple-900 focus:ring-purple-500">
                <SelectValue placeholder={isOrgSpecific && organizations.length === 1 ? organizations[0].name : "-- Personal Task --"} />
              </SelectTrigger>
              <SelectContent>
                {!isOrgSpecific && <SelectItem value="personal">-- Personal Task --</SelectItem>}
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_complete"
              checked={formData.is_complete}
              onCheckedChange={handleCheckboxChange}
              disabled={loading}
              className="text-purple-600 border-purple-300 focus:ring-purple-500"
            />
            <Label
              htmlFor="is_complete"
              className="text-sm text-purple-700 font-normal"
            >
              Mark as complete
            </Label>
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
              mode === 'create' ? 'Create Task' : 'Update Task'
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