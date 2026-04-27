import { Component } from '@angular/core';

@Component({
    selector: 'app-testimonials',
    templateUrl: './testimonials.component.html',
    styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
    testimonials = [
        {
            quote: 'CareCore cut our no-show rate by 65% in the first month. The automated reminders alone paid for the subscription.',
            name: 'Dr. Sarah Mendez',
            role: 'General Practitioner, MedPlus Clinic',
            avatar: 'SM',
            avatarColor: '#0EA5E9',
        },
        {
            quote: "We manage 4 branches from one dashboard. What used to take 3 staff members now runs on autopilot. It's been a game changer.",
            name: 'Mark Reyes',
            role: 'Operations Manager, HealthFirst Group',
            avatar: 'MR',
            avatarColor: '#6366F1',
        },
        {
            quote: 'The patient portal is incredibly intuitive. Our patients love booking online, and our front desk finally has time to breathe.',
            name: 'Dr. Anya Patel',
            role: "Pediatrician, Sunshine Children's Clinic",
            avatar: 'AP',
            avatarColor: '#10B981',
        },
    ];
}
