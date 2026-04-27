import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface OnboardingPayload {
    username: string;
    given_name: string;
    family_name: string;
    email: string;
    clinic_name: string;
    clinic_street_addr?: string;
    clinic_province_addr?: string;
    clinic_city_addr?: string;
    clinic_country_addr: string;
    clinic_domain_name: string;
    phone: string;
    role: string;
    specialties: string;
    clinic_lat: string;
    clinic_lng: string;
    clinic_logo_url?: string;
}

export interface UserAttributes {
    given_name?: string;
	email?: string;
    family_name?: string;
    clinic_name?: string;
    clinic_street_addr?: string;
    clinic_province_addr?: string;
    clinic_city_addr?: string;
    clinic_country_addr?: string;
    clinic_domain_name?: string;
    phone?: string;
    role?: string;
    specialties?: string;
}

export interface fetchUserResponse {
	message: string;
	data: UserAttributes
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private async getHeaders(): Promise<HttpHeaders> {
        const token = await this.authService.getAccessToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        });
    }

    async fetchUserAttributes(email: string): Promise<fetchUserResponse> {
        const headers = await this.getHeaders();
        return firstValueFrom(
            this.http.get<fetchUserResponse>(`${environment.backendApi}user/fetch`, { headers, params: { email } })
        );
    }

    async getLogoUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
        const headers = await this.getHeaders();
        return firstValueFrom(
            this.http.post<{ uploadUrl: string; fileUrl: string }>(
                `${environment.backendApi}upload-logo`,
                { filename, contentType },
                { headers }
            )
        );
    }

    async submitOnboarding(payload: OnboardingPayload): Promise<void> {
        const headers = await this.getHeaders();
        return firstValueFrom(
            this.http.post<void>(`${environment.backendApi}user/update-attributes`, payload, { headers })
        );
    }
}
