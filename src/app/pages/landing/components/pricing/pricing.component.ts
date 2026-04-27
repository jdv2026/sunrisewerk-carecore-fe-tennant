import { Component, signal } from '@angular/core';

interface Plan {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    desc: string;
    features: string[];
    cta: string;
    highlighted: boolean;
    badge?: string;
}

@Component({
    selector: 'app-pricing',
    imports: [],
    templateUrl: './pricing.component.html',
    styleUrl: './pricing.component.scss',
})
export class PricingComponent {
    yearly = signal(false);

    plans: Plan[] = [
        {
            name: 'Starter',
            monthlyPrice: 29,
            yearlyPrice: 23,
            desc: 'Perfect for solo practitioners and small clinics just getting started.',
            features: [
                '1 clinic location',
                'Up to 3 staff members',
                '500 appointments/month',
                'Email & SMS reminders',
                'Basic analytics',
                'Email support',
            ],
            cta: 'Start Free Trial',
            highlighted: false,
        },
        {
            name: 'Professional',
            monthlyPrice: 79,
            yearlyPrice: 63,
            desc: 'Ideal for growing clinics that need more power and automation.',
            features: [
                'Up to 3 clinic locations',
                'Unlimited staff',
                'Unlimited appointments',
                'Advanced reminders & follow-ups',
                'Full analytics & reports',
                'Patient portal access',
                'Priority support',
            ],
            cta: 'Start Free Trial',
            highlighted: true,
            badge: 'Most Popular',
        },
        {
            name: 'Enterprise',
            monthlyPrice: 199,
            yearlyPrice: 159,
            desc: 'For large hospital networks and multi-location clinic chains.',
            features: [
                'Unlimited clinic locations',
                'Unlimited staff & patients',
                'Custom integrations & API',
                'White-label options',
                'Dedicated account manager',
                'SLA guarantee',
                '24/7 phone support',
            ],
            cta: 'Contact Sales',
            highlighted: false,
        },
    ];
}
