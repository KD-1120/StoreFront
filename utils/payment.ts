// Central payment processing utility for all storefronts
import { toast } from 'sonner';

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  storeId: string;
  orderId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export class PaymentProcessor {
  private static instance: PaymentProcessor;
  private stripePublicKey: string | null = null;
  private stripe: any = null;

  private constructor() {
    this.initializeStripe();
  }

  public static getInstance(): PaymentProcessor {
    if (!PaymentProcessor.instance) {
      PaymentProcessor.instance = new PaymentProcessor();
    }
    return PaymentProcessor.instance;
  }

  private async initializeStripe() {
    try {
      // Load Stripe.js dynamically
      const stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/';
      stripeScript.async = true;
      document.head.appendChild(stripeScript);

      stripeScript.onload = () => {
        // Initialize Stripe with public key (this would come from environment)
        this.stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
        if (window.Stripe && this.stripePublicKey) {
          this.stripe = window.Stripe(this.stripePublicKey);
        }
      };
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  public async processPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        throw new Error('Payment system not initialized');
      }

      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(paymentDetails.amount * 100), // Convert to cents
          currency: paymentDetails.currency.toLowerCase(),
          description: paymentDetails.description,
          customer_email: paymentDetails.customerEmail,
          store_id: paymentDetails.storeId,
          order_id: paymentDetails.orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { client_secret } = await response.json();

      // Confirm payment with Stripe
      const result = await this.stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: {
            // This would be populated by Stripe Elements in a real implementation
          },
          billing_details: {
            name: paymentDetails.customerName,
            email: paymentDetails.customerEmail,
          },
        },
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }

      return {
        success: true,
        paymentId: result.paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }

  public async processTestPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    // Simulate payment processing for demo/test purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        
        if (success) {
          resolve({
            success: true,
            paymentId: `test_payment_${Date.now()}`,
          });
        } else {
          resolve({
            success: false,
            error: 'Test payment failed - please try again',
          });
        }
      }, 2000); // Simulate network delay
    });
  }

  public showPaymentModal(paymentDetails: PaymentDetails, onSuccess: (result: PaymentResult) => void, onError: (error: string) => void) {
    // This would show a payment modal with Stripe Elements
    // For now, we'll use the test payment processor
    toast.info('Processing payment...', { duration: 2000 });
    
    this.processTestPayment(paymentDetails)
      .then((result) => {
        if (result.success) {
          toast.success('Payment successful!');
          onSuccess(result);
        } else {
          toast.error(result.error || 'Payment failed');
          onError(result.error || 'Payment failed');
        }
      })
      .catch((error) => {
        toast.error('Payment processing error');
        onError(error.message);
      });
  }
}

// Export singleton instance
export const paymentProcessor = PaymentProcessor.getInstance();

// Utility functions for common payment operations
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999; // Max $9,999.99
};

export const calculateTax = (subtotal: number, taxRate: number = 0.08): number => {
  return subtotal * taxRate;
};

export const calculateShipping = (subtotal: number, shippingRate: number = 5.99): number => {
  // Free shipping over $75
  return subtotal >= 75 ? 0 : shippingRate;
};