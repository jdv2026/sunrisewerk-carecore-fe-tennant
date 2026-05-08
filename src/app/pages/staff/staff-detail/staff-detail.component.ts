import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';
import { StaffService, StaffMember, StaffRole, StaffStatus, Leave, LeaveType, LeaveStatus } from '../staff.service';

@Component({
    selector: 'app-staff-detail',
    imports: [SidebarComponent, ReactiveFormsModule],
    templateUrl: './staff-detail.component.html',
    styleUrl: './staff-detail.component.scss',
})
export class StaffDetailComponent implements OnInit {
    sidebarOpen      = signal(false);
    isLoading        = signal(true);
    staff            = signal<StaffMember | null>(null);
    showAddForm      = signal(false);
    isSaving         = signal(false);
    deletingId       = signal<number | null>(null);
    deleteError      = signal<string | null>(null);
    scheduleError    = signal<string | null>(null);
    isUpdatingStatus = signal(false);
    statusError      = signal<string | null>(null);
    isLoadingLeaves  = signal(true);
    leavesError      = signal<string | null>(null);
    leaves           = signal<Leave[]>([]);

    readonly leaveTypeLabel: Record<LeaveType, string | undefined> = {
        sick:      'Sick Leave',
        vacation:  'Vacation',
        emergency: 'Emergency',
        other:     'Other',
    };

    readonly leaveStatusLabel: Record<LeaveStatus, string | undefined> = {
        pending:  'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    readonly days = [
        'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
    ];

    readonly roleLabel: Record<StaffRole, string> = {
        doctor:       'Doctor',
        nurse:        'Nurse',
        receptionist: 'Receptionist',
        other:        'Other',
    };

    readonly roleColors: Record<StaffRole, string> = {
        doctor:       'blue',
        nurse:        'green',
        receptionist: 'purple',
        other:        'gray',
    };

    readonly statusLabel: Record<StaffStatus, string | undefined> = {
        'active':   'Active',
        'on-leave': 'On Leave',
        'inactive': 'Inactive',
    };

    readonly dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

    private fb           = inject(FormBuilder);
    private route        = inject(ActivatedRoute);
    private router       = inject(Router);
    private staffService = inject(StaffService);

    scheduleForm = this.fb.group({
        day:        ['', Validators.required],
        start_time: ['', Validators.required],
        end_time:   ['', Validators.required],
    });

    get day()       { return this.scheduleForm.get('day')!; }
    get startTime() { return this.scheduleForm.get('start_time')!; }
    get endTime()   { return this.scheduleForm.get('end_time')!; }

    async ngOnInit(): Promise<void> {
        await Promise.all([this.loadStaff(), this.loadLeaves()]);
    }

    async addSchedule(): Promise<void> {
        if (this.scheduleForm.invalid) { this.scheduleForm.markAllAsTouched(); return; }
        const s = this.staff();
        if (!s) return;

        const { day, start_time, end_time } = this.scheduleForm.value;
        if (start_time! >= end_time!) {
            this.scheduleError.set('End time must be after start time.');
            return;
        }

        this.isSaving.set(true);
        this.scheduleError.set(null);
        try {
            await this.staffService.addSchedule(s.email, day!, start_time!, end_time!);
            this.scheduleForm.reset();
            this.showAddForm.set(false);
            await this.loadStaff();
        } catch (err: any) {
            this.scheduleError.set(err?.error?.message ?? 'Failed to add schedule.');
        } finally {
            this.isSaving.set(false);
        }
    }

    async deleteSchedule(scheduleId: number): Promise<void> {
        if (!scheduleId) {
            this.deleteError.set('Schedule ID is missing — cannot delete.');
            return;
        }
        this.deletingId.set(scheduleId);
        this.deleteError.set(null);
        try {
            await this.staffService.deleteSchedule(scheduleId);
            await this.loadStaff();
        } catch (err: any) {
            this.deleteError.set(err?.error?.message ?? 'Failed to delete schedule.');
        } finally {
            this.deletingId.set(null);
        }
    }

    async updateStatus(status: 'active' | 'inactive'): Promise<void> {
        const s = this.staff();
        if (!s || s.status === status) return;
        this.isUpdatingStatus.set(true);
        this.statusError.set(null);
        try {
            await this.staffService.updateStatus(s.id, status);
            await this.loadStaff();
        } catch (err: any) {
            this.statusError.set(err?.error?.message ?? 'Failed to update status.');
        } finally {
            this.isUpdatingStatus.set(false);
        }
    }

    cancelAdd(): void {
        this.scheduleForm.reset();
        this.scheduleError.set(null);
        this.showAddForm.set(false);
    }

    fullName(s: StaffMember): string {
        return `${s.given_name} ${s.family_name}`.trim();
    }

    initials(s: StaffMember): string {
        return ((s.given_name?.[0] ?? '') + (s.family_name?.[0] ?? '')).toUpperCase() || '?';
    }

    formatDay(day: string): string {
        return day.charAt(0).toUpperCase() + day.slice(1);
    }

    formatTime(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    sortedSchedules(s: StaffMember) {
        return [...(s.schedules ?? [])].sort(
            (a, b) => this.dayOrder.indexOf(a.day) - this.dayOrder.indexOf(b.day)
        );
    }

    goBack(): void {
        this.router.navigate(['/staff']);
    }

    formatLeaveDate(date: string): string {
        if (!date) return '—';
        const safe = date.includes('T') ? date : `${date}T00:00:00`;
        return new Date(safe).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    private async loadLeaves(): Promise<void> {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        try {
            const res = await this.staffService.getLeaves(id);
            this.leaves.set(res.payload ?? []);
        } catch {
            this.leavesError.set('Failed to load leave records.');
        } finally {
            this.isLoadingLeaves.set(false);
        }
    }

    private async loadStaff(): Promise<void> {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        try {
            const res = await this.staffService.getStaffs();
            this.staff.set((res.payload ?? []).find(s => s.id === id) ?? null);
        } catch {
            this.staff.set(null);
        } finally {
            this.isLoading.set(false);
        }
    }
}
