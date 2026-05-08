import { Component, signal } from '@angular/core';

interface Plan {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    desc: string;
    features: string[];
    cta: string;
    ctaLink: string;
    highlighted: boolean;
    badge?: string;
    salesContact?: boolean;
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
            name: 'Basic',
            monthlyPrice: 29,
            yearlyPrice: 23,
            desc: 'Perfect for solo practitioners and small clinics just getting started.',
            features: [
                '1 clinic location',
                'Up to 3 staff members',
                '500 appointments/month',
                'Email & SMS reminders',
                'Patient portal access',
                'Full analytics & reports',
                'Email support',
            ],
            cta: 'Start Free Trial',
            ctaLink: '/auth/register',
            highlighted: false,
        },
        {
            name: 'Professional',
            monthlyPrice: 79,
            yearlyPrice: 63,
            desc: 'Ideal for growing clinics that need more power and automation.',
            features: [
                '1 clinic location',
                'Unlimited staff',
                'Unlimited appointments',
                'Email & SMS reminders',
                'Full analytics & reports',
                'Patient portal access',
                'Online Consultations video calls/chat',
                'Priority support',
            ],
            cta: 'Start Free Trial',
            ctaLink: '/auth/register',
            highlighted: true,
            badge: 'Most Popular',
        },
    ];
}
