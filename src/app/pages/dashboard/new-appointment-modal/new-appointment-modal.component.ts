import { Component, OnInit, computed, output, signal, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { DatePickerComponent } from '../../../shared/ui/date-picker/date-picker.component';
import { TimePickerComponent } from '../../../shared/ui/time-picker/time-picker.component';
import { StaffService, Doctor, DoctorsAppointment } from '../../staff/staff.service';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const entered = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entered >= today ? null : { notFuture: true };
}

function generateSlots(startHour: number, endHour: number): string[] {
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < endHour) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const ALL_SLOTS  = generateSlots(7, 20);

@Component({
    selector: 'app-new-appointment-modal',
    imports: [ReactiveFormsModule, DatePickerComponent, TimePickerComponent],
    templateUrl: './new-appointment-modal.component.html',
    styleUrl: './new-appointment-modal.component.scss',
})
export class NewAppointmentModalComponent implements OnInit {
    saved     = output<void>();
    cancelled = output<void>();

    isLoading       = signal(false);
    error           = signal<string | null>(null);
    isSlotsLoading  = signal(true);
    slotsError      = signal(false);
    doctors         = signal<Doctor[]>([]);
    bookedSlots     = signal<DoctorsAppointment[]>([]);
    selectedDate    = signal('');
    bookingSuccess  = signal(false);
    bookedDetail    = signal<{ email: string; date: string; time: string; notes: string } | null>(null);

    readonly minDate  = new Date().toISOString().split('T')[0];
    readonly allSlots = ALL_SLOTS;

    private fb           = inject(FormBuilder);
    private http         = inject(HttpClient);
    private authService  = inject(AuthService);
    private staffService = inject(StaffService);

    form = this.fb.group({
        email:            ['', [Validators.required, Validators.email]],
        appointment_date: ['', [Validators.required, futureDateValidator]],
        appointment_time: ['', [Validators.required]],
        notes:            [''],
    });

    get email()           { return this.form.get('email')!; }
    get appointmentDate() { return this.form.get('appointment_date')!; }
    get appointmentTime() { return this.form.get('appointment_time')!; }

    disabledSlots = computed((): Set<string> => {
        if (this.isSlotsLoading()) return new Set(ALL_SLOTS);

        const date = this.selectedDate();
        if (!date) return new Set(ALL_SLOTS);

        const dayOfWeek = DAY_NAMES[new Date(date + 'T00:00:00').getDay()];
        const doctors   = this.doctors();
        const booked    = this.bookedSlots();

        return new Set(ALL_SLOTS.filter(slot => {
            const slotFull = slot + ':00';
            const doctorAvailable = doctors.some(doc =>
                (doc.schedules ?? []).some(s =>
                    s.day === dayOfWeek && s.start_time <= slotFull && slotFull < s.end_time
                )
            );
            const alreadyBooked = booked.some(a =>
                a.appointment_date === date && a.appointment_time.startsWith(slot + ':')
            );
            return !doctorAvailable || alreadyBooked;
        }));
    });

    async ngOnInit(): Promise<void> {
        try {
            const res = await this.staffService.getDoctors();
            this.doctors.set(res.payload?.doctors ?? []);
            this.bookedSlots.set(res.payload?.appointments ?? []);
        } catch {
            this.slotsError.set(true);
            this.doctors.set([]);
            this.bookedSlots.set([]);
        } finally {
            this.isSlotsLoading.set(false);
        }
    }

    onDateSelected(date: string): void {
        this.appointmentDate.setValue(date);
        this.appointmentDate.markAsTouched();
        this.selectedDate.set(date);
        if (this.appointmentTime.value && this.disabledSlots().has(this.appointmentTime.value)) {
            this.appointmentTime.setValue('');
        }
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.isLoading.set(true);
        this.error.set(null);

        try {
            const [token, claims] = await Promise.all([
                this.authService.getAccessToken(),
                this.authService.getTokenClaims(),
            ]);
            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            });
            const body = {
                ...this.form.value,
                tennant_email: claims?.email      ?? '',
                clinic_name:   claims?.clinicName ?? '',
            };
            await firstValueFrom(
                this.http.post(`${environment.laravelAdminBackendApi}appointments`, body, { headers })
            );
            this.bookedDetail.set({
                email: this.form.value.email        ?? '',
                date:  this.form.value.appointment_date ?? '',
                time:  this.form.value.appointment_time ?? '',
                notes: this.form.value.notes        ?? '',
            });
            this.bookingSuccess.set(true);
        } catch (err: any) {
            this.error.set(err?.error?.message ?? 'Failed to book appointment. Please try again.');
        } finally {
            this.isLoading.set(false);
        }
    }

    formatDateDisplay(date: string): string {
        if (!date) return '';
        return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
    }

    formatTimeDisplay(time: string): string {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    done(): void { this.saved.emit(); }

    dismiss(): void { this.cancelled.emit(); }
}
