import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

export interface DashboardClinic {
    name: string;
    specialties: string;
    street_addr: string;
    city_addr: string;
    province_addr: string;
    country_addr: string;
    phone: string;
    email: string;
    lat: string;
    lng: string;
}

export interface DashboardStats {
    todays_appointments: number;
    total_patients: number;
    active_staffs: number;
}

export interface AppointmentPatient {
    given_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export interface LatestAppointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    notes: string | null;
    status: string;
    patient: AppointmentPatient | null;
}

export interface DashboardPayload {
    clinic: DashboardClinic;
    stats: DashboardStats;
    confirmed_appointments_today: LatestAppointment[];
}

export interface DashboardResponse {
    status: number;
    message: string;
    payload: DashboardPayload;
}

export interface DashboardLeave {
    id:          number;
    type:        string;
    start_date:  string;
    end_date:    string;
    reason:      string;
    status:      string;
    staff_id:    number;
    given_name:  string;
    family_name: string;
}

export interface LeavesListResponse {
    status:  number;
    message: string;
    payload: DashboardLeave[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private async getHeaders(): Promise<HttpHeaders> {
        const token = await this.authService.getAccessToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        });
    }

    async approveLeave(id: number): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        await firstValueFrom(
            this.http.patch(`${environment.laravelAdminBackendApi}leaves/${id}/confirm`, {
                tennant_email: claims?.email      ?? '',
                clinic_name:   claims?.clinicName ?? '',
            }, { headers })
        );
    }

    async rejectLeave(id: number): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        await firstValueFrom(
            this.http.patch(`${environment.laravelAdminBackendApi}leaves/${id}/reject`, {
                tennant_email: claims?.email      ?? '',
                clinic_name:   claims?.clinicName ?? '',
            }, { headers })
        );
    }

    async getLeaves(): Promise<LeavesListResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? { email: claims.email, clinic_name: claims.clinicName } : {} });
        return firstValueFrom(
            this.http.get<LeavesListResponse>(`${environment.laravelAdminBackendApi}leaves`, { headers, params })
        );
    }

    async getDashboard(): Promise<DashboardResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? { email: claims.email, clinic_name: claims.clinicName } : {} });
        return firstValueFrom(
            this.http.get<DashboardResponse>(`${environment.laravelAdminBackendApi}dashboard`, { headers, params })
        );
    }
}
