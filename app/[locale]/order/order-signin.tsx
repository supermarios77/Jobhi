"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Mail } from "lucide-react";

interface OrderSignInProps {
  onSignInSuccess: () => void;
  locale: string;
}

export function OrderSignIn({ onSignInSuccess, locale }: OrderSignInProps) {
  const t = useTranslations("order");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setCheckingSession(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is already signed in
        onSignInSuccess();
      }
    } catch (err) {
      console.error("Error checking session:", err);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError(t("emailRequired"));
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Send magic link email
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/order`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      // Email sent successfully
      setEmailSent(true);
      
      // Start polling for session
      pollForSession();
    } catch (err: any) {
      setError(err.message || t("signInError"));
      setIsLoading(false);
    }
  };

  const pollForSession = () => {
    const supabase = createClient();
    const maxAttempts = 60; // Poll for up to 2 minutes (60 * 2 seconds)
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
          clearInterval(interval);
          onSignInSuccess();
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError(t("sessionTimeout"));
        }
      } catch (err) {
        console.error("Error polling for session:", err);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }
    }, 2000); // Check every 2 seconds
  };

  if (checkingSession) {
    return (
      <div className="bg-background min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">{t("checkingSession")}</p>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="bg-background min-h-screen py-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                <Mail className="w-10 h-10 text-accent" />
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-normal text-foreground tracking-widest uppercase">
              {t("checkYourEmail")}
            </h1>
            
            <p className="text-base text-text-secondary tracking-wide">
              {t("magicLinkSent", { email })}
            </p>
            
            <p className="text-sm text-text-secondary tracking-wide">
              {t("clickLinkToSignIn")}
            </p>
            
            <div className="pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="text-xs tracking-widest uppercase"
              >
                {t("useDifferentEmail")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-8 max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl lg:text-4xl font-normal text-foreground tracking-widest uppercase">
            {t("title")}
          </h1>
          <p className="text-base text-text-secondary tracking-wide max-w-xl mx-auto">
            {t("signInToViewOrders")}
          </p>
          
          <form
            onSubmit={handleSignIn}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-foreground bg-background text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-foreground transition-all text-sm tracking-wide disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="px-8 py-3 text-xs tracking-widest uppercase"
            >
              {isLoading ? t("sending") : t("sendMagicLink")}
            </Button>
          </form>
          
          {error && (
            <div className="max-w-md mx-auto">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}
          
          <p className="text-xs text-text-secondary tracking-wide max-w-md mx-auto pt-4">
            {t("magicLinkDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}

