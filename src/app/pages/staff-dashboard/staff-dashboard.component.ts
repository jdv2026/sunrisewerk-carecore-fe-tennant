import { Component, OnInit, computed, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { AppointmentsService, Appointment } from '../appointments/appointments.service';
import { LeavesService, Leave } from '../leaves/leaves.service';

const TODAY = new Date().toISOString().split('T')[0];

@Component({
    selector: 'app-staff-dashboard',
    imports: [SidebarComponent],
    templateUrl: './staff-dashboard.component.html',
    styleUrl: './staff-dashboard.component.scss',
})
export class StaffDashboardComponent implements OnInit {
    sidebarOpen  = signal(false);
    isLoading    = signal(true);

    appointments = signal<Appointment[]>([]);
    leaves       = signal<Leave[]>([]);

    todayAppointments = computed(() =>
        this.appointments().filter(a => a.appointment_date.split('T')[0] === TODAY)
    );
    upcomingCount = computed(() =>
        this.appointments().filter(a => a.appointment_date.split('T')[0] > TODAY).length
    );
    pendingLeaves = computed(() =>
        this.leaves().filter(l => l.status === 'pending').length
    );
    approvedLeaves = computed(() =>
        this.leaves().filter(l => l.status === 'approved').length
    );

    constructor(
        private apptService: AppointmentsService,
        private leavesService: LeavesService,
    ) {}

    async ngOnInit(): Promise<void> {
        try {
            const [apptRes, leavesRes] = await Promise.all([
                this.apptService.getStaffAppointments('all'),
                this.leavesService.getMyLeaves(),
            ]);
            this.appointments.set(apptRes.payload ?? []);
            this.leaves.set(leavesRes.payload ?? []);
        } catch {
            this.appointments.set([]);
            this.leaves.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }

    patientName(a: Appointment): string {
        if (!a.patient) return 'Unknown Patient';
        return `${a.patient.given_name ?? ''} ${a.patient.last_name ?? ''}`.trim();
    }

    initials(a: Appointment): string {
        if (!a.patient) return '?';
        return ((a.patient.given_name?.[0] ?? '') + (a.patient.last_name?.[0] ?? '')).toUpperCase() || '?';
    }

    formatTime(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }
}
