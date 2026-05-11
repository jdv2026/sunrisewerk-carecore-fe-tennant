import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

export type StaffRole   = 'doctor' | 'nurse' | 'receptionist' | 'other';
export type StaffStatus = 'active' | 'on-leave' | 'inactive';

export interface StaffSchedule {
    id:         number;
    day:        string;
    start_time: string;
    end_time:   string;
}

export type LeaveType   = 'sick' | 'vacation' | 'emergency' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Leave {
    id:         number;
    type:       LeaveType;
    start_date: string;
    end_date:   string;
    reason:     string;
    status:     LeaveStatus;
    staff_id:   number;
}

export interface LeavesResponse {
    status:  number;
    message: string;
    payload: Leave[];
}

export interface Doctor {
    schedules: StaffSchedule[] | null;
}

export interface DoctorsAppointment {
    appointment_date: string;
    appointment_time: string;
}

export interface DoctorsResponse {
    status:  number;
    message: string;
    payload: {
        doctors:      Doctor[];
        appointments: DoctorsAppointment[];
    };
}

export interface StaffMember {
    id:          number;
    given_name:  string;
    family_name: string;
    role:        StaffRole;
    specialty:   string | null;
    status:      StaffStatus;
    email:       string;
    number:      string;
    schedules:   StaffSchedule[] | null;
}

export interface StaffResponse {
    status:  number;
    message: string;
    payload: StaffMember[];
}

@Injectable({ providedIn: 'root' })
export class StaffService {
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

    async addSchedule(staffEmail: string, day: string, start_time: string, end_time: string): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        await firstValueFrom(
            this.http.post(`${environment.laravelAdminBackendApi}staffs/schedule`, {
                email:         staffEmail,
                day,
                start_time,
                end_time,
                tennant_email: claims?.email      ?? '',
                clinic_name:   claims?.clinicName ?? '',
            }, { headers })
        );
    }

    async updateStatus(staffId: number, status: 'active' | 'inactive'): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const capitalized = status.charAt(0).toUpperCase() + status.slice(1);
        await firstValueFrom(
            this.http.patch(`${environment.laravelAdminBackendApi}staffs/${staffId}/status`, {
                status:        capitalized,
                tennant_email: claims?.email      ?? '',
                clinic_name:   claims?.clinicName ?? '',
            }, { headers })
        );
    }

    async deleteSchedule(scheduleId: number): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? {
            tennant_email: claims.email,
            clinic_name:   claims.clinicName,
        } : {} });
        await firstValueFrom(
            this.http.delete(`${environment.laravelAdminBackendApi}staffs/schedule/${scheduleId}`, { headers, params })
        );
    }

    async getLeaves(staffId: number): Promise<LeavesResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? {
            email:       claims.email,
            clinic_name: claims.clinicName,
        } : {} });
        return firstValueFrom(
            this.http.get<LeavesResponse>(`${environment.laravelAdminBackendApi}leaves/${staffId}`, { headers, params })
        );
    }

    async getDoctors(): Promise<DoctorsResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? {
            email:       claims.email,
            clinic_name: claims.clinicName,
        } : {} });
        return firstValueFrom(
            this.http.get<DoctorsResponse>(`${environment.laravelAdminBackendApi}staffs/doctors`, { headers, params })
        );
    }

    async getStaffs(): Promise<StaffResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? {
            email:       claims.email,
            clinic_name: claims.clinicName,
        } : {} });
        return firstValueFrom(
            this.http.get<StaffResponse>(`${environment.laravelAdminBackendApi}staffs`, { headers, params })
        );
    }
}
