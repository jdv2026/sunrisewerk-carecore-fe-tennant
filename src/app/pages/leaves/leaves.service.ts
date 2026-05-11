import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

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

export interface CreateLeavePayload {
    type:       LeaveType;
    start_date: string;
    end_date:   string;
    reason:     string;
}

@Injectable({ providedIn: 'root' })
export class LeavesService {
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

	async getMyLeaves(): Promise<LeavesResponse> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        const params = new HttpParams({ fromObject: claims ? {
            email:       claims.email,
            clinic_name: claims.clinicName,
        } : {} });
        return firstValueFrom(
			this.http.get<LeavesResponse>(`${environment.laravelStaffBackendApi}non-tennant/leaves`, { headers, params })
        );
    }

    async createLeave(data: CreateLeavePayload): Promise<void> {
        const [headers, claims] = await Promise.all([
            this.getHeaders(),
            this.authService.getTokenClaims(),
        ]);
        await firstValueFrom(
            this.http.post(`${environment.laravelStaffBackendApi}non-tennant/leaves`, {
                staff_email: claims?.email ?? '',
                type:        data.type,
                start_date:  data.start_date,
                end_date:    data.end_date,
                reason:      data.reason,
            }, { headers })
        );
    }
}
