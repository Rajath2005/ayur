import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Leaf, MessageCircle, Camera, Send, Upload, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">AyuDost AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!user ? (
              <>
                <Link href="/login">
                  <span className="inline-block">
                    <Button variant="ghost" data-testid="button-login" asChild>
                      <span className="cursor-pointer">Login</span>
                    </Button>
                  </span>
                </Link>
                <Link href="/register">
                  <span className="inline-block">
                    <Button data-testid="button-register" asChild>
                      <span className="cursor-pointer">Get Started</span>
                    </Button>
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <span className="inline-block">
                  <Button data-testid="button-dashboard" asChild>
                    <span className="cursor-pointer">Dashboard</span>
                  </Button>
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative px-4 py-12 md:px-6 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Chat & Analyze Your Way to
                  <span className="block text-primary">Ayurvedic Wellness</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Get instant AI-powered Ayurvedic guidance. Chat about your symptoms or upload an image for personalized insights.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <span className="inline-block w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-dashboard" asChild>
                        <span className="cursor-pointer flex items-center justify-center gap-2">
                          <ArrowRight className="h-5 w-5" />
                          Go to Dashboard
                        </span>
                      </Button>
                    </span>
                  </Link>
                ) : (
                  <Link href="/login">
                    <span className="inline-block w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-signin" asChild>
                        <span className="cursor-pointer flex justify-center">Sign In</span>
                      </Button>
                    </span>
                  </Link>
                )}
                <Link href={user ? "/dashboard" : "/login"}>
                  <span className="inline-block w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-hero-chat" asChild>
                      <span className="cursor-pointer flex items-center justify-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Chat With AI
                      </span>
                    </Button>
                  </span>
                </Link>
                <Link href={user ? "/dashboard" : "/login"}>
                  <span className="inline-block w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-hero-image" asChild>
                      <span className="cursor-pointer flex items-center justify-center gap-2">
                        <Camera className="h-5 w-5" />
                        Try Image Analysis
                      </span>
                    </Button>
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column - Chat UI Mockup */}
            <div className="flex items-center justify-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-3xl" />
                <div className="relative bg-card rounded-3xl shadow-2xl border overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-primary/5 p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AyuDost AI</p>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-3 h-64">
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-3 py-2 max-w-[80%]">
                        <p className="text-sm">Hello! I can help with Ayurvedic guidance. What symptoms are you experiencing?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl px-3 py-2 max-w-[80%]">
                        <p className="text-sm">I have been feeling tired and having headaches</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-3 py-2 max-w-[80%]">
                        <p className="text-sm">Based on Ayurveda, this could indicate Vata imbalance. Try warm oil massage and...</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t bg-background/50">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
                      <input
                        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground border-0 outline-none"
                        placeholder="Type symptoms or upload image..."
                        disabled
                      />
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <Send className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-10 md:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Get personalized Ayurvedic guidance in three simple steps
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            <Card className="border-2 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg md:text-xl">Step 1: Chat Instantly</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Chat and describe symptoms using our NLP-powered Ayurvedic chatbot for instant analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg md:text-xl">Step 2: Upload a Photo</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Upload an image of visible symptoms (skin, tongue, eyes) for AI-powered visual analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 md:p-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg md:text-xl">Step 3: Get Your Guidance</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Receive personalized Ayurvedic guidance, remedies, and lifestyle recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-32">
        <div className="container px-4 md:px-6">
          <Card className="border-2">
            <CardContent className="p-6 md:p-12">
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
                  Begin Your Wellness Journey Today
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Join thousands discovering the power of Ayurvedic wisdom combined with modern AI technology.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  {user ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="w-full sm:w-auto" data-testid="button-cta-dashboard">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="w-full sm:w-auto" data-testid="button-cta-start">
                          Get Started Free
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-cta-login">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 AyuDost AI. Empowering wellness naturally.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered Ayurvedic guidance for your holistic health journey
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              AyuDost AI provides AI-generated wellness guidance and is not a medical diagnostic tool. Always consult a certified practitioner.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
