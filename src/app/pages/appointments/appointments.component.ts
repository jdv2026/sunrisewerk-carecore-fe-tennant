import { Component, OnInit, computed, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { AppointmentsService, Appointment, AppointmentStatus, ApiFilter } from './appointments.service';
import { AuthService } from '../../core/auth/auth.service';

export type FilterType = 'today' | 'week' | 'month' | 'all';

const TODAY = new Date().toISOString().split('T')[0];

const API_FILTER_MAP: Record<FilterType, ApiFilter | undefined> = {
    today: undefined,
    week:  'this_week',
    month: 'this_month',
    all:   'all',
};

@Component({
    selector: 'app-appointments',
    imports: [SidebarComponent],
    templateUrl: './appointments.component.html',
    styleUrl: './appointments.component.scss',
})
export class AppointmentsComponent implements OnInit {
    sidebarOpen   = signal(false);
    isLoading     = signal(true);
    activeFilter  = signal<FilterType>('today');
    search        = signal('');
    confirmingId  = signal<number | null>(null);
    confirmError  = signal<string | null>(null);

    appointments = signal<Appointment[]>([]);

    filtered = computed(() => {
        const q    = this.search().toLowerCase().trim();
        const f    = this.activeFilter();
        let list   = this.appointments();

        if (f === 'today') list = list.filter(a => a.appointment_date.split('T')[0] === TODAY);

        if (q) list = list.filter(a => {
            const name = a.patient
                ? `${a.patient.given_name} ${a.patient.last_name}`.toLowerCase()
                : '';
            return name.includes(q) || (a.notes ?? '').toLowerCase().includes(q);
        });

        return list;
    });

    todayCount     = computed(() => this.appointments().filter(a => a.appointment_date.split('T')[0] === TODAY).length);
    confirmedCount = computed(() => this.filtered().filter(a => a.status === 'confirmed').length);
    pendingCount   = computed(() => this.filtered().filter(a => a.status === 'pending').length);
    cancelledCount = computed(() => this.filtered().filter(a => a.status === 'cancelled').length);

    readonly filters: { label: string; value: FilterType }[] = [
        { label: 'Today',      value: 'today' },
        { label: 'This Week',  value: 'week'  },
        { label: 'This Month', value: 'month' },
        { label: 'All',        value: 'all'   },
    ];

    readonly statusLabel: Record<AppointmentStatus, string | undefined> = {
        confirmed: 'Confirmed',
        pending:   'Pending',
        completed: 'Completed',
        complete:  'Completed',
        cancelled: 'Cancelled',
    };

    private isStaff = false;

    constructor(
        private apptService: AppointmentsService,
        private authService: AuthService,
    ) {}

    async ngOnInit(): Promise<void> {
        const claims = await this.authService.getTokenClaims();
        this.isStaff = claims?.isStaff ?? false;
        await this.load();
    }

    async onFilterChange(filter: FilterType): Promise<void> {
        this.activeFilter.set(filter);
        await this.load();
    }

    patientName(a: Appointment): string {
        if (!a.patient) return 'Unknown Patient';
        return `${a.patient.given_name ?? ''} ${a.patient.last_name ?? ''}`.trim();
    }

    initials(a: Appointment): string {
        if (!a.patient) return '?';
        const f = a.patient.given_name?.[0] ?? '';
        const l = a.patient.last_name?.[0]  ?? '';
        return (f + l).toUpperCase() || '?';
    }

    formatDate(date: string): string {
        const safe = date.includes('T') ? date : `${date}T00:00:00`;
        return new Date(safe).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    formatTime(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    async confirmAppointment(appt: Appointment): Promise<void> {
        this.confirmingId.set(appt.id);
        this.confirmError.set(null);
        try {
            await this.apptService.confirmAppointment(appt.id);
            await this.load();
        } catch (err: any) {
            this.confirmError.set(err?.error?.message ?? 'Failed to confirm appointment.');
        } finally {
            this.confirmingId.set(null);
        }
    }

    private async load(): Promise<void> {
        this.isLoading.set(true);
        try {
            const apiFilter = API_FILTER_MAP[this.activeFilter()];
            const res = this.isStaff
                ? await this.apptService.getStaffAppointments(apiFilter)
                : await this.apptService.getAppointments(apiFilter);
            this.appointments.set(res.payload ?? []);
        } catch {
            this.appointments.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }
}
