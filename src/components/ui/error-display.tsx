'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorDisplay({ error, onRetry, title = "Something went wrong" }: ErrorDisplayProps) {
  return (
    <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.9)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
          <AlertTriangle className="h-6 w-6 text-amber-300" />
        </div>
        <CardTitle className="text-lg font-semibold text-slate-50">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-slate-300">
          {error}
        </p>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
