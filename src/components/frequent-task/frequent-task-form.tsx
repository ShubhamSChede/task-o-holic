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

  // Gemini AI helper state (suggests title + description)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<{
    title: string
    description: string
  } | null>(null)
  
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
          // @ts-expect-error - Supabase type inference issue with .insert()
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
          // @ts-expect-error - Supabase type inference issue with .update()
          .update(taskData)
          
          .eq('id', initialData.id);
        
        if (updateError) throw updateError;
      }
      
      router.push(`/organizations/${formData.organization_id}`);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    const trimmedPrompt = aiInput.trim()
    const fallbackPrompt =
      trimmedPrompt || formData.description.trim() || formData.title.trim()

    if (!fallbackPrompt) return

    setAiLoading(true)
    setAiError(null)

    try {
      const tagsArr =
        formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []

      const payload = {
        prompt: fallbackPrompt,
        context: {
          priority: formData.priority || null,
          tags: tagsArr.length ? tagsArr : null,
          due_date: null,
        },
      }

      const res = await fetch('/api/gemini/task-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Failed to generate suggestion')
      }

      const json = (await res.json()) as { title: string; description: string }
      setAiSuggestion({ title: json.title, description: json.description })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate suggestion'
      setAiError(message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAcceptAISuggestion = () => {
    if (!aiSuggestion) return
    setFormData((prev) => ({
      ...prev,
      title: aiSuggestion.title,
      description: aiSuggestion.description,
    }))
    setAiSuggestion(null)
    setAiError(null)
  }
  
  return (
    <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive" className="bg-red-950/60 text-red-300 border-red-500/40">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* AI Helper */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
            <Label className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              AI helper
            </Label>
            <p className="mt-2 text-sm text-slate-400">
              Describe the template you want. Generate suggestions, then click <span className="text-slate-200 font-medium">Accept</span> to autofill.
            </p>

            <div className="mt-3 space-y-2">
              <Textarea
                id="ai_task_idea"
                name="ai_task_idea"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                rows={2}
                placeholder="e.g., A template for weekly sprint planning with clear action items."
                className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400 resize-none"
                disabled={loading || aiLoading}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={loading || aiLoading}
                  className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate title & description'
                  )}
                </Button>

                {aiSuggestion ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAcceptAISuggestion}
                    className="border-cyan-400/50 bg-slate-900/30 text-cyan-200 hover:bg-slate-800/40"
                    disabled={loading || aiLoading}
                  >
                    Accept
                  </Button>
                ) : null}

                {aiSuggestion ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAiSuggestion(null)
                      setAiError(null)
                    }}
                    className="border-slate-700 bg-slate-900/30 text-slate-200 hover:bg-slate-800/40"
                    disabled={loading || aiLoading}
                  >
                    Dismiss
                  </Button>
                ) : null}
              </div>

              {aiError ? (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-2 text-sm text-red-200">
                  {aiError}
                </div>
              ) : null}
            </div>

            {aiSuggestion ? (
              <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-300">
                  Preview
                </div>
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-semibold text-slate-50">
                    {aiSuggestion.title}
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">
                    {aiSuggestion.description}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          
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
                <SelectValue placeholder="-- Select priority --" />
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
            <Label htmlFor="tags" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Tags (comma separated)
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="work, project, meeting"
              className="border-slate-700 bg-slate-900 text-slate-50 focus-visible:ring-cyan-400"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organization_id" className="text-slate-300 text-xs uppercase tracking-[0.14em]">
              Organization *
            </Label>
            <Select
              value={formData.organization_id}
              onValueChange={(value) => handleSelectChange('organization_id', value)}
              disabled={loading || !!preSelectedOrgId}
            >
              <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-50 focus:ring-cyan-400">
                <SelectValue placeholder="-- Select organization --" />
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
            className="mt-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              mode === 'create' ? 'Create template' : 'Update template'
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