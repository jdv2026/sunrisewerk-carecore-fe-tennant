import { Component } from '@angular/core';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss',
})
export class StatsComponent {
    stats = [
        { value: '12,000+', label: 'Clinics Onboarded' },
        { value: '3.2M', label: 'Appointments Managed' },
        { value: '98.9%', label: 'Uptime SLA' },
        { value: '4.9 / 5', label: 'Customer Rating' },
    ];
}
