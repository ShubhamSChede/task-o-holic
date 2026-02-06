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
    <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive" className="bg-red-950/60 text-red-300 border-red-500/40">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={loading}
                    className={cn(
                      "w-full justify-start text-left font-normal border-slate-700 bg-slate-900 text-slate-50 hover:bg-slate-800",
                      !formData.due_date && "text-slate-500"
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
              <Label htmlFor="priority" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
                Priority
              </Label>
              <Select
                value={formData.priority || "none"}
                onValueChange={(value) => handleSelectChange('priority', value === "none" ? "" : value)}
                disabled={loading}
              >
                <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-50 focus:ring-cyan-400">
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
            <Label htmlFor="tags" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="work, personal, project"
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_id" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Organization
            </Label>
            <Select
              value={formData.organization_id || (isOrgSpecific && organizations.length === 1 ? organizations[0].id : "personal")}
              onValueChange={(value) => handleSelectChange('organization_id', value === "personal" ? "" : value)}
              disabled={loading}
            >
              <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-50 focus:ring-cyan-400">
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
              className="text-cyan-300 border-slate-700 bg-slate-900 focus:ring-cyan-400"
            />
            <Label
              htmlFor="is_complete"
              className="text-sm font-normal text-slate-300"
            >
              Mark as complete
            </Label>
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
              mode === 'create' ? 'Create Task' : 'Update Task'
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