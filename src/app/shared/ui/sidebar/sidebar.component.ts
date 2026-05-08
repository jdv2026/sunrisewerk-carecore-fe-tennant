import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { OnboardingService } from '../../../core/onboarding/onboarding.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, ConfirmModalComponent],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
    @Input() open = false;
    @Output() closeRequest = new EventEmitter<void>();

    userName = signal('');
    clinicName = signal('');
    userRole = signal('');
    showLogoutModal = signal(false);
    isStaff = signal(false);

    readonly adminNavItems: NavItem[] = [
        { label: 'Dashboard',    icon: 'dashboard',        route: '/dashboard'    },
        { label: 'Appointments', icon: 'calendar_month',   route: '/appointments' },
        { label: 'Patients',     icon: 'people',           route: '/patients',     disabled: true },
        { label: 'Staff',        icon: 'medical_services', route: '/staff'                        },
        { label: 'Reports',      icon: 'bar_chart',        route: '/reports',      disabled: true },
        { label: 'Settings',     icon: 'settings',         route: '/settings',     disabled: true },
    ];

    readonly staffNavItems: NavItem[] = [
        { label: 'Dashboard',    icon: 'dashboard',      route: '/staff-dashboard' },
        { label: 'Appointments', icon: 'calendar_month', route: '/appointments'    },
        { label: 'Leaves',       icon: 'event_busy',     route: '/leaves'          },
        { label: 'Profile',      icon: 'person',         route: '/profile'         },
    ];

    get navItems(): NavItem[] {
        return this.isStaff() ? this.staffNavItems : this.adminNavItems;
    }

    constructor(
        private authService: AuthService,
        private onboardingService: OnboardingService,
        private router: Router,
    ) {}

    async ngOnInit(): Promise<void> {
        const claims = await this.authService.getTokenClaims();
        if (!claims) return;
        this.userName.set(`${claims.givenName} ${claims.familyName}`.trim());
        this.isStaff.set(claims.isStaff);
        if (!claims.isStaff) {
            try {
                const res = await this.onboardingService.fetchUserAttributes(claims.email);
                this.clinicName.set(res.data.clinic_name ?? '');
                this.userRole.set(res.data.role ?? '');
            } catch {}
        } else {
            this.clinicName.set(claims.clinicName);
            this.userRole.set('Staff');
        }
    }

    close() { this.closeRequest.emit(); }

    logout() { this.showLogoutModal.set(true); }

    async confirmLogout() {
        await this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
