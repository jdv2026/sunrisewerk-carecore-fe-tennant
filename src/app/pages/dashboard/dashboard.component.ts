import { Component, OnInit, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { DashboardService, DashboardClinic, DashboardStats, LatestAppointment, DashboardLeave } from './dashboard.service';
import { AddPatientModalComponent } from './add-patient-modal/add-patient-modal.component';
import { NewAppointmentModalComponent } from './new-appointment-modal/new-appointment-modal.component';
import { AddStaffModalComponent } from './add-staff-modal/add-staff-modal.component';

@Component({
    selector: 'app-dashboard',
    imports: [SidebarComponent, AddPatientModalComponent, NewAppointmentModalComponent, AddStaffModalComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    sidebarOpen      = signal(false);
    isLoading        = signal(true);
    showAddPatient      = signal(false);
    showNewAppointment  = signal(false);
    showAddStaff        = signal(false);

    clinic       = signal<DashboardClinic | null>(null);
    stats        = signal<DashboardStats | null>(null);
    appointments = signal<LatestAppointment[]>([]);
    upcomingLeaves   = signal<DashboardLeave[]>([]);
    isLoadingLeaves  = signal(true);
    leavesError      = signal(false);
    actioningLeave   = signal<{ id: number; action: 'approve' | 'reject' } | null>(null);
    leaveActionError = signal<string | null>(null);

    today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    readonly leaveTypeLabel: Record<string, string> = {
        sick:      'Sick Leave',
        vacation:  'Vacation',
        emergency: 'Emergency',
        other:     'Other',
    };

    readonly leaveStatusLabel: Record<string, string> = {
        pending:  'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    readonly statusLabel: Record<string, string> = {
        confirmed: 'Confirmed',
        pending:   'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    constructor(private dashboardService: DashboardService) {}

    async ngOnInit(): Promise<void> {
        this.loadLeaves();
        await this.loadDashboard();
        this.isLoading.set(false);
    }

    clinicLocation(): string {
        const c = this.clinic();
        if (!c) return '';
        return [c.city_addr, c.province_addr, c.country_addr].filter(Boolean).join(', ');
    }

    patientName(appt: LatestAppointment): string {
        const p = appt.patient;
        if (!p) return 'Unknown Patient';
        return `${p.given_name ?? ''} ${p.last_name ?? ''}`.trim();
    }

    initials(appt: LatestAppointment): string {
        const p = appt.patient;
        if (!p) return '?';
        const first = p.given_name?.[0] ?? '';
        const last  = p.last_name?.[0]  ?? '';
        return (first + last).toUpperCase() || '?';
    }

    formatTime(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${m} ${ampm}`;
    }

    formatDate(date: string): string {
        const safe = date.includes('T') ? date : `${date}T00:00:00`;
        return new Date(safe).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    onPatientSaved(): void {
        this.showAddPatient.set(false);
        this.loadDashboard();
    }

    onAppointmentSaved(): void {
        this.showNewAppointment.set(false);
        this.loadDashboard();
    }

    onStaffSaved(): void {
        this.showAddStaff.set(false);
        this.loadDashboard();
    }

    staffName(leave: DashboardLeave): string {
        return `${leave.given_name ?? ''} ${leave.family_name ?? ''}`.trim() || `Staff #${leave.staff_id}`;
    }

    staffInitials(leave: DashboardLeave): string {
        const f = leave.given_name?.[0]  ?? '';
        const l = leave.family_name?.[0] ?? '';
        return (f + l).toUpperCase() || '?';
    }

    formatLeaveDate(date: string): string {
        if (!date) return '—';
        const safe = date.includes('T') ? date : `${date}T00:00:00`;
        return new Date(safe).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    async approveLeave(leave: DashboardLeave): Promise<void> {
        this.actioningLeave.set({ id: leave.id, action: 'approve' });
        this.leaveActionError.set(null);
        try {
            await this.dashboardService.approveLeave(leave.id);
            await this.loadLeaves();
        } catch (err: any) {
            this.leaveActionError.set(err?.error?.message ?? 'Failed to approve leave.');
        } finally {
            this.actioningLeave.set(null);
        }
    }

    async rejectLeave(leave: DashboardLeave): Promise<void> {
        this.actioningLeave.set({ id: leave.id, action: 'reject' });
        this.leaveActionError.set(null);
        try {
            await this.dashboardService.rejectLeave(leave.id);
            await this.loadLeaves();
        } catch (err: any) {
            this.leaveActionError.set(err?.error?.message ?? 'Failed to reject leave.');
        } finally {
            this.actioningLeave.set(null);
        }
    }

    private async loadLeaves(): Promise<void> {
        try {
            const todayStr      = new Date().toISOString().split('T')[0];
            const fourWeeksStr  = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const res = await this.dashboardService.getLeaves();
            const filtered = (res.payload ?? []).filter(l => {
                const start = l.start_date.split('T')[0];
                const end   = l.end_date.split('T')[0];
                return start <= fourWeeksStr && end >= todayStr;
            }).sort((a, b) => a.start_date.localeCompare(b.start_date));
            this.upcomingLeaves.set(filtered);
        } catch {
            this.leavesError.set(true);
            this.upcomingLeaves.set([]);
        } finally {
            this.isLoadingLeaves.set(false);
        }
    }

    private async loadDashboard(): Promise<void> {
        try {
            const res = await this.dashboardService.getDashboard();
            this.clinic.set(res.payload.clinic ?? null);
            this.stats.set(res.payload.stats ?? null);
            this.appointments.set(res.payload.confirmed_appointments_today ?? []);
        } catch {}
    }
}
