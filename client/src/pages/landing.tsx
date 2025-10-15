import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Leaf, MessageCircle, Pill, Calendar, Sparkles, Shield, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">AyurChat</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative px-4 py-20 md:px-6 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Your Ayurvedic
                  <span className="block text-primary">Wellness Companion</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Experience personalized Ayurvedic guidance powered by AI. Get expert advice on natural remedies, 
                  symptom checking, and holistic health practices rooted in ancient wisdom.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <span className="inline-block">
                    <Button size="lg" className="gap-2" data-testid="button-hero-start" asChild>
                      <span className="cursor-pointer flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Start Your Journey
                      </span>
                    </Button>
                  </span>
                </Link>
                <Link href="/login">
                  <span className="inline-block">
                    <Button size="lg" variant="outline" data-testid="button-hero-login" asChild>
                      <span className="cursor-pointer">Sign In</span>
                    </Button>
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative bg-card rounded-2xl p-8 shadow-xl border">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI-Powered Insights</p>
                        <p className="text-xs text-muted-foreground">Ancient wisdom meets modern technology</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Safe & Natural</p>
                        <p className="text-xs text-muted-foreground">Evidence-based Ayurvedic practices</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">24/7 Availability</p>
                        <p className="text-xs text-muted-foreground">Get guidance anytime you need</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Holistic Wellness Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need for your Ayurvedic wellness journey in one place
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover-elevate transition-all duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">AI Chat Consultation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chat with our AI-powered Ayurvedic assistant for personalized wellness guidance and answers to your health questions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover-elevate transition-all duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Herbal Remedies</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discover natural Ayurvedic remedies tailored to your specific health concerns and constitutional type.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover-elevate transition-all duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Symptom Analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get insights into your symptoms from an Ayurvedic perspective with AI-powered analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover-elevate transition-all duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Appointment Scheduling</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Connect with certified Ayurvedic practitioners for in-depth consultations and treatment plans.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <Card className="border-2">
            <CardContent className="p-12">
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Begin Your Wellness Journey Today
                </h2>
                <p className="text-muted-foreground text-lg">
                  Join thousands discovering the power of Ayurvedic wisdom combined with modern AI technology.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" data-testid="button-cta-start">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" data-testid="button-cta-login">
                      Sign In
                    </Button>
                  </Link>
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
                © 2025 AyurChat. Empowering wellness naturally.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered Ayurvedic guidance for your holistic health journey
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
