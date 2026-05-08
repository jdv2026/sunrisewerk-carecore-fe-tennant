import { Component } from '@angular/core';

@Component({
    selector: 'app-how-it-works',
    templateUrl: './how-it-works.component.html',
    styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
    steps = [
        {
            number: '01',
            icon: 'rocket_launch',
            title: 'Set Up Your Clinic',
            desc: 'Create your clinic profile, add your staff, set working hours, and configure services in under 10 minutes.',
        },
        {
            number: '02',
            icon: 'group_add',
            title: 'Invite Patients',
            desc: 'Share your booking link or embed the scheduler on your website. Patients book appointments instantly — no calls needed.',
        },
        {
            number: '03',
            icon: 'verified',
            title: 'Run Your Practice',
            desc: 'Manage your schedule, send reminders, track payments, and view reports — all from one unified dashboard.',
        },
    ];
}
