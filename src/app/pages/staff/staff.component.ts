import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { StaffService, StaffMember, StaffRole, StaffStatus } from './staff.service';

export type StaffFilter = 'all' | StaffRole;

@Component({
    selector: 'app-staff',
    imports: [SidebarComponent, RouterModule],
    templateUrl: './staff.component.html',
    styleUrl: './staff.component.scss',
})
export class StaffComponent implements OnInit {
    sidebarOpen  = signal(false);
    isLoading    = signal(true);
    activeFilter = signal<StaffFilter>('all');
    search       = signal('');

    staff = signal<StaffMember[]>([]);

    filtered = computed(() => {
        const f = this.activeFilter();
        const q = this.search().toLowerCase().trim();
        let list = this.staff();
        if (f !== 'all') list = list.filter(s => s.role === f);
        if (q) list = list.filter(s =>
            `${s.given_name} ${s.family_name}`.toLowerCase().includes(q) ||
            (s.specialty ?? '').toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
        return list;
    });

    totalCount   = computed(() => this.staff().length);
    doctorCount  = computed(() => this.staff().filter(s => s.role === 'doctor').length);
    nurseCount   = computed(() => this.staff().filter(s => s.role === 'nurse').length);
    supportCount = computed(() => this.staff().filter(s => s.role === 'receptionist' || s.role === 'other').length);

    readonly filters: { label: string; value: StaffFilter }[] = [
        { label: 'All',           value: 'all'          },
        { label: 'Doctors',       value: 'doctor'       },
        { label: 'Nurses',        value: 'nurse'        },
        { label: 'Receptionists', value: 'receptionist' },
        { label: 'Other',         value: 'other'        },
    ];

    readonly statusLabel: Record<StaffStatus, string | undefined> = {
        'active':   'Active',
        'on-leave': 'On Leave',
        'inactive': 'Inactive',
    };

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

    constructor(private staffService: StaffService) {}

    async ngOnInit(): Promise<void> {
        try {
            const res = await this.staffService.getStaffs();
            this.staff.set(res.payload ?? []);
        } catch {
            this.staff.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }

    fullName(s: StaffMember): string {
        return `${s.given_name} ${s.family_name}`.trim();
    }

    initials(s: StaffMember): string {
        return ((s.given_name?.[0] ?? '') + (s.family_name?.[0] ?? '')).toUpperCase() || '?';
    }

    formatTime(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    formatDay(day: string): string {
        return day.charAt(0).toUpperCase() + day.slice(1);
    }
}
