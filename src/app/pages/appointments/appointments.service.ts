import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'complete' | 'cancelled';
export type ApiFilter = 'this_week' | 'this_month' | 'all';

export interface AppointmentPatient {
    given_name: string;
    last_name:  string;
    email:      string;
    phone:      string;
}

export interface Appointment {
    id:               number;
    appointment_date: string;
    appointment_time: string;
    status:           AppointmentStatus;
    notes:            string | null;
    patient:          AppointmentPatient | null;
}

export interface AppointmentsResponse {
    status:  number;
    message: string;
    payload: Appointment[];
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
    private http        = inject(HttpClient);
    private authService = inject(AuthService);

    private async getHeaders(): Promise<HttpHeaders> {
        const token = await this.authService.getAccessToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        });
    }

    async confirmAppointment(id: number): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const url = claims?.isStaff
            ? `${environment.laravelStaffBackendApi}non-tennant/appointments/${id}/confirm`
            : `${environment.laravelAdminBackendApi}appointments/${id}/confirm`;
        const body = claims?.isStaff
            ? { email: claims.email }
            : { tennant_email: claims?.email ?? '', clinic_name: claims?.clinicName ?? '' };
        await firstValueFrom(this.http.patch(url, body, { headers }));
    }

    async getAppointments(filter?: ApiFilter): Promise<AppointmentsResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        let params = new HttpParams({ fromObject: claims ? { email: claims.email, clinic_name: claims.clinicName } : {} });
        if (filter) params = params.set('filter', filter);
        return firstValueFrom(
            this.http.get<AppointmentsResponse>(`${environment.laravelAdminBackendApi}appointments`, { headers, params })
        );
    }

    async getStaffAppointments(filter?: ApiFilter): Promise<AppointmentsResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        let params = new HttpParams();
        if (claims?.email) params = params.set('email', claims.email);
        if (filter) params = params.set('filter', filter);
        return firstValueFrom(
            this.http.get<AppointmentsResponse>(`${environment.laravelStaffBackendApi}non-tennant/staffs/appointments`, { headers, params })
        );
    }
}
