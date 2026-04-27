import { Component } from '@angular/core';

interface Feature {
    icon: string;
    title: string;
    desc: string;
    color: string;
}

@Component({
    selector: 'app-features',
    templateUrl: './features.component.html',
    styleUrl: './features.component.scss',
})
export class FeaturesComponent {
    features: Feature[] = [
        {
            icon: 'calendar_month',
            title: 'Smart Appointment Scheduling',
            desc: 'Drag-and-drop calendar with conflict detection, recurring appointments, and real-time availability sync across your entire staff.',
            color: '#0EA5E9',
        },
        {
            icon: 'person_search',
            title: 'Patient Management',
            desc: 'Centralized patient profiles with medical history, visit notes, documents, and seamless communication tools.',
            color: '#6366F1',
        },
        {
            icon: 'domain',
            title: 'Multi-Clinic Support',
            desc: 'Manage multiple branches from a single dashboard. Assign staff, set schedules, and monitor performance per location.',
            color: '#10B981',
        },
        {
            icon: 'notifications_active',
            title: 'Automated Reminders',
            desc: 'Reduce no-shows by up to 70% with SMS and email reminders sent automatically before every appointment.',
            color: '#F59E0B',
        },
        {
            icon: 'bar_chart',
            title: 'Analytics & Reports',
            desc: 'Visual dashboards showing appointment trends, revenue breakdown, staff utilization, and patient retention metrics.',
            color: '#EC4899',
        },
        {
            icon: 'lock',
            title: 'HIPAA-Compliant Security',
            desc: 'End-to-end encryption, role-based access control, and full audit logs to keep patient data safe and compliant.',
            color: '#8B5CF6',
        },
    ];
}
