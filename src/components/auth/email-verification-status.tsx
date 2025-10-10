// src/components/auth/email-verification-status.tsx
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

interface EmailVerificationStatusProps {
  userEmail?: string;
  onResendVerification?: () => void;
}

export default function EmailVerificationStatus({ 
  userEmail, 
  onResendVerification 
}: EmailVerificationStatusProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setIsVerified(null);
          return;
        }

        setIsVerified(user.email_confirmed_at !== null);
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsVerified(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [supabase]);

  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      if (onResendVerification) {
        onResendVerification();
      }
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-purple-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-sm text-purple-600">Checking verification status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isVerified === null) {
    return null; // Don't show anything if we can't determine status
  }

  if (isVerified) {
    return (
      <Card className="border-green-200 shadow-sm bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Email verified successfully!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 shadow-sm bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-orange-800 font-medium">
              Email verification required
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Please check your email and click the verification link to activate your account.
            </p>
            {userEmail && (
              <Button
                onClick={handleResendVerification}
                variant="outline"
                size="sm"
                className="mt-2 border-orange-200 text-orange-600 hover:bg-orange-100"
              >
                <Mail className="h-3 w-3 mr-1" />
                Resend Verification Email
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
