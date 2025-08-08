import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MerchantSignupDialog } from './MerchantSignupDialog';
import { AuthDialog } from './AuthDialog';
import { useAuth } from '../contexts/AuthContext';
import { Check, Store, Zap, BarChart3, Globe, CreditCard, Shield } from 'lucide-react';

export function LandingPage() {
  const { user, loading } = useAuth();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const testStorefront = () => {
    window.location.href = '?store=demo';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-semibold">StoreFront</h1>
              <Badge variant="secondary">SaaS</Badge>
            </div>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setIsLoginOpen(true)}>
                    Sign In
                  </Button>
                  <Button onClick={() => setIsSignupOpen(true)}>
                    Start Free Trial
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={testStorefront}>
                Demo Store
              </Button>
            </div>
            {/* Mobile burger */}
            <button
              className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile full-screen menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center transition-all duration-300">
            <button
              className="absolute top-6 right-6 p-2 rounded focus:outline-none"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col gap-6 text-center w-full max-w-xs mx-auto">
              {user ? (
                <Button size="lg" variant="ghost" className="w-full" onClick={() => { window.location.href = '/dashboard'; setMobileMenuOpen(false); }}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="ghost" className="w-full" onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }}>
                    Sign In
                  </Button>
                  <Button size="lg" className="w-full" onClick={() => { setIsSignupOpen(true); setMobileMenuOpen(false); }}>
                    Start Free Trial
                  </Button>
                </>
              )}
              <Button size="lg" variant="outline" className="w-full" onClick={() => { testStorefront(); setMobileMenuOpen(false); }}>
                Demo Store
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
            {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Build Your Online Store in Minutes
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create a beautiful, professional storefront with our easy-to-use platform. 
              No coding required, fully customizable, and ready to sell.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => setIsSignupOpen(true)}
                    className="px-8 py-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => setIsLoginOpen(true)}
                    className="px-8 py-3 text-lg hover:bg-accent/50"
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-8 py-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
            {!user && (
              <div className="mt-8 text-sm text-muted-foreground">
                14-day free trial • No credit card required • Cancel anytime
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4 font-bold">Everything You Need to Sell Online</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Professional e-commerce features built for modern businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Lightning Fast Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Create your store in under 5 minutes. Choose your domain, customize your design, and start selling immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Custom Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Get your own branded subdomain (yourstore.storefront.com) or connect your custom domain for maximum credibility.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Accept payments safely with built-in SSL encryption and PCI compliance. Support for all major payment methods.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Track your performance with detailed analytics. Monitor sales, customer behavior, and inventory levels.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Manage your products, track stock levels, and get notified when items are running low.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Your store looks perfect on all devices. Responsive design ensures customers can shop anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start free, scale as you grow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="text-2xl font-semibold">Free</div>
                <p className="text-sm text-muted-foreground">Perfect for testing</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Up to 10 products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">StoreFront subdomain</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic analytics</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Start Free
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary relative">
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Most Popular</Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-2xl font-semibold">$29<span className="text-sm font-normal">/month</span></div>
                <p className="text-sm text-muted-foreground">For growing businesses</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Unlimited products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Custom domain</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Email support</span>
                </div>
                <Button className="w-full mt-6">
                  Start Trial
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="text-2xl font-semibold">$99<span className="text-sm font-normal">/month</span></div>
                <p className="text-sm text-muted-foreground">For large stores</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Custom integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Dedicated account manager</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to Start Selling?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join businesses now selling with StoreFront. Create your store today and start accepting orders in minutes.
          </p>
          <Button size="lg" onClick={() => setIsSignupOpen(true)}>
            Create Your Store Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Store className="w-6 h-6 text-primary" />
                <span className="font-semibold">StoreFront</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The easiest way to create your online store.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Features</div>
                <div>Pricing</div>
                <div>Integrations</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Documentation</div>
                <div>Help Center</div>
                <div>Blog</div>
                <div>Community</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>About</div>
                <div>Contact</div>
                <div>Privacy</div>
                <div>Terms</div>
              </div>
            </div>
          </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              © 2025 StoreFront. All rights reserved.
            </div>
        </div>
      </footer>

      <MerchantSignupDialog
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
      />
      
      <AuthDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}