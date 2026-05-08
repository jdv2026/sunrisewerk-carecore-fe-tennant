import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

export interface SolutionData {
    tag: string;
    headline: string;
    headlineAccent: string;
    subtitle: string;
    heroIcon: string;
    benefits: { icon: string; title: string; description: string }[];
    stats: { value: string; label: string }[];
    testimonial: { quote: string; author: string; role: string };
    ctaLabel: string;
}

export const SOLUTIONS: Record<string, SolutionData> = {
    'solo-practitioners': {
        tag: 'Solo Practitioners',
        headline: 'Run your practice',
        headlineAccent: 'without the admin chaos.',
        subtitle: 'CareCore gives independent practitioners everything they need to manage appointments, patients, and billing — so you can practice medicine, not paperwork.',
        heroIcon: 'person',
        benefits: [
            { icon: 'calendar_month', title: 'One-click scheduling', description: 'Let patients book online 24/7. Your calendar syncs automatically and blocks off your unavailable times.' },
            { icon: 'notifications_active', title: 'Automated reminders', description: 'Reduce no-shows with SMS and email reminders sent automatically before every appointment.' },
            { icon: 'person_search', title: 'Complete patient profiles', description: 'All your patient history, visit notes, and documents in one place — accessible instantly during consultations.' },
            { icon: 'bar_chart', title: 'Simple revenue tracking', description: 'Know exactly how much you earned, which services are most popular, and where your time is going.' },
        ],
        stats: [
            { value: '70%', label: 'Reduction in no-shows' },
            { value: '3 hrs', label: 'Admin time saved per day' },
            { value: '2 min', label: 'Average setup time' },
            { value: '5,000+', label: 'Solo practitioners on CareCore' },
        ],
        testimonial: {
            quote: 'I used to spend my evenings managing my schedule and following up on appointments. CareCore handles all of it. I have my evenings back.',
            author: 'Dr. Maria Santos',
            role: 'Family Medicine, Manila',
        },
        ctaLabel: 'Start Your Free Trial',
    },
    'multi-clinic': {
        tag: 'Multi-Clinic Networks',
        headline: 'One dashboard for',
        headlineAccent: 'every location.',
        subtitle: 'Manage staff, schedules, and performance across all your clinic branches from a single, unified platform. Scale without losing control.',
        heroIcon: 'domain',
        benefits: [
            { icon: 'map', title: 'Centralized branch management', description: 'View and manage all locations from one dashboard. Set schedules, assign staff, and monitor performance per branch.' },
            { icon: 'people', title: 'Cross-clinic staff management', description: 'Assign staff to multiple locations, manage shift conflicts, and track utilization across your network.' },
            { icon: 'bar_chart', title: 'Network-wide analytics', description: 'Compare performance across branches. Identify your best-performing locations and replicate what works.' },
            { icon: 'sync', title: 'Real-time sync', description: 'All branches stay in sync in real time. Patients can book at any location and see accurate availability instantly.' },
        ],
        stats: [
            { value: '500+', label: 'Multi-clinic networks' },
            { value: '40%', label: 'Less time on coordination' },
            { value: '99.9%', label: 'Platform uptime' },
            { value: 'Unlimited', label: 'Branches supported' },
        ],
        testimonial: {
            quote: 'We manage 7 clinics across 3 cities. Before CareCore, we had a spreadsheet for each one. Now everything is in one place and I can see what\'s happening everywhere in seconds.',
            author: 'Carlos Reyes',
            role: 'Operations Director, MedPlus Network',
        },
        ctaLabel: 'Scale Your Network',
    },
    'hospitals': {
        tag: 'Hospitals',
        headline: 'Enterprise-grade tools',
        headlineAccent: 'for complex care teams.',
        subtitle: 'CareCore gives hospitals the scheduling infrastructure, access controls, and compliance tools needed to coordinate large teams and high patient volumes.',
        heroIcon: 'local_hospital',
        benefits: [
            { icon: 'supervisor_account', title: 'Role-based access control', description: 'Fine-grained permissions for doctors, nurses, administrators, and billing staff. Everyone sees only what they need.' },
            { icon: 'calendar_month', title: 'High-volume scheduling', description: 'Handle hundreds of appointments per day across dozens of departments without conflicts or double-bookings.' },
            { icon: 'lock', title: 'HIPAA-compliant infrastructure', description: 'End-to-end encryption, full audit logs, and Business Associate Agreements available to meet compliance requirements.' },
            { icon: 'integration_instructions', title: 'API & integrations', description: 'Connect CareCore to your existing EMR, billing, or lab systems via REST API. No data silos.' },
        ],
        stats: [
            { value: '200+', label: 'Hospitals on CareCore' },
            { value: '1M+', label: 'Appointments managed monthly' },
            { value: '100%', label: 'Audit log coverage' },
            { value: '<2s', label: 'Average response time' },
        ],
        testimonial: {
            quote: 'Implementing CareCore across our 4 departments reduced scheduling conflicts by 85% in the first month. The audit logs alone saved us weeks of manual compliance work.',
            author: 'Dr. Ana Dela Cruz',
            role: 'Chief Medical Officer, Sunrise General Hospital',
        },
        ctaLabel: 'Request a Demo',
    },
    'telehealth': {
        tag: 'Telehealth',
        headline: 'See patients anywhere,',
        headlineAccent: 'manage everything in one place.',
        subtitle: 'CareCore bridges in-person and virtual care. Schedule video consultations, send secure pre-visit forms, and manage remote patients alongside your in-clinic schedule.',
        heroIcon: 'video_call',
        benefits: [
            { icon: 'video_call', title: 'Virtual appointment scheduling', description: 'Schedule telehealth sessions the same way you schedule in-person visits. Patients get a join link automatically.' },
            { icon: 'assignment', title: 'Pre-visit digital forms', description: 'Send intake forms and consent documents before the visit. Patients complete them on their phone — no paper.' },
            { icon: 'sync_alt', title: 'Unified in-person + virtual calendar', description: 'Manage all appointment types in one view. No more switching between systems.' },
            { icon: 'security', title: 'Secure and compliant', description: 'All telehealth sessions and patient data are encrypted and handled in compliance with healthcare privacy regulations.' },
        ],
        stats: [
            { value: '3x', label: 'More patients reached' },
            { value: '60%', label: 'Less travel for patients' },
            { value: '4.9★', label: 'Patient satisfaction score' },
            { value: '0', label: 'Extra software needed' },
        ],
        testimonial: {
            quote: 'Our rural patients used to miss follow-ups because of the commute. With CareCore\'s telehealth scheduling, follow-up rates increased by 55% in three months.',
            author: 'Dr. James Villanueva',
            role: 'Internal Medicine, CareLink Clinics',
        },
        ctaLabel: 'Start Seeing Patients Virtually',
    },
};

@Component({
    selector: 'app-solution-page',
    imports: [RouterLink],
    templateUrl: './solution-page.component.html',
    styleUrl: './solution-page.component.scss',
})
export class SolutionPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    solution!: SolutionData;
    year = new Date().getFullYear();

    ngOnInit() {
        const key = this.route.snapshot.data['solution'] as string;
        this.solution = SOLUTIONS[key];
    }
}
