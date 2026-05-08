import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { LeavesService, Leave, LeaveType, LeaveStatus, CreateLeavePayload } from './leaves.service';

@Component({
    selector: 'app-leaves',
    imports: [SidebarComponent, FormsModule, TitleCasePipe],
    templateUrl: './leaves.component.html',
    styleUrl: './leaves.component.scss',
})
export class LeavesComponent implements OnInit {
    sidebarOpen  = signal(false);
    isLoading    = signal(true);
    loadError    = signal<string | null>(null);
    leaves       = signal<Leave[]>([]);

    showModal    = signal(false);
    isSubmitting = signal(false);
    submitError  = signal<string | null>(null);

    form = {
        type:       'sick' as LeaveType,
        start_date: '',
        end_date:   '',
        reason:     '',
    };

    totalCount    = computed(() => this.leaves().length);
    pendingCount  = computed(() => this.leaves().filter(l => l.status === 'pending').length);
    approvedCount = computed(() => this.leaves().filter(l => l.status === 'approved').length);
    rejectedCount = computed(() => this.leaves().filter(l => l.status === 'rejected').length);

    readonly leaveTypes: { value: LeaveType; label: string }[] = [
        { value: 'sick',      label: 'Sick Leave'      },
        { value: 'vacation',  label: 'Vacation'        },
        { value: 'emergency', label: 'Emergency Leave' },
        { value: 'other',     label: 'Other'           },
    ];

    readonly statusLabel: Record<LeaveStatus, string> = {
        pending:  'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    constructor(private leavesService: LeavesService) {}

    async ngOnInit(): Promise<void> {
        await this.load();
    }

    openModal(): void {
        this.form = { type: 'sick', start_date: '', end_date: '', reason: '' };
        this.submitError.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
    }

    async submitLeave(): Promise<void> {
        if (!this.form.start_date || !this.form.end_date || !this.form.reason.trim()) {
            this.submitError.set('Please fill in all fields.');
            return;
        }
        if (this.form.end_date < this.form.start_date) {
            this.submitError.set('End date must be on or after start date.');
            return;
        }
        this.isSubmitting.set(true);
        this.submitError.set(null);
        try {
            await this.leavesService.createLeave(this.form as CreateLeavePayload);
            this.showModal.set(false);
            await this.load();
        } catch (err: any) {
            this.submitError.set(err?.error?.message ?? 'Failed to submit leave request.');
        } finally {
            this.isSubmitting.set(false);
        }
    }

    formatDate(date: string): string {
        const safe = date.includes('T') ? date : `${date}T00:00:00`;
        return new Date(safe).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    private async load(): Promise<void> {
        this.isLoading.set(true);
        this.loadError.set(null);
        try {
            const res = await this.leavesService.getMyLeaves();
            this.leaves.set(res.payload ?? []);
        } catch {
            this.loadError.set('Failed to load leaves.');
            this.leaves.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }
}
