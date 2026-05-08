import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import * as L from 'leaflet';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OnboardingService } from '../../core/onboarding/onboarding.service';
import { ConfirmModalComponent } from '../../shared/ui/confirm-modal/confirm-modal.component';
import { PHONE_PREFIXES } from '../../core/data/phone-prefixes';
import { COUNTRIES } from '../../core/data/countries';
import 'leaflet/dist/leaflet.css';

interface Step {
    number: number;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-onboarding',
    imports: [ReactiveFormsModule, ConfirmModalComponent],
    templateUrl: './onboarding.component.html',
    styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit, OnDestroy {
    currentStep = signal(1);
    totalSteps = 4;
    isLoading = signal(false);
    isFetching = signal(true);
    showLogoutModal = signal(false);
    showSubmitModal = signal(false);
    showErrorModal = signal(false);
    errorMessage = signal<string | null>(null);

    steps: Step[] = [
        { number: 1, icon: 'person',        label: 'Your Profile'   },
        { number: 2, icon: 'local_hospital', label: 'Clinic Details' },
        { number: 3, icon: 'rate_review',    label: 'Review'         },
        { number: 4, icon: 'check_circle',   label: "You're All Set" },
    ];

    progress = computed(() => this.currentStep() >= this.totalSteps ? 100 : Math.round(((this.currentStep() - 1) / this.totalSteps) * 100));

    profileForm!: FormGroup;
    clinicForm!: FormGroup;

    tokenClaims: { givenName: string; familyName: string; email: string } | null = null;


    specialties = [
        'General Practice', 'Pediatrics', 'Dentistry', 'Dermatology',
        'Cardiology', 'Orthopedics', 'OB-GYN', 'Ophthalmology',
        'ENT', 'Psychiatry', 'Neurology', 'Other',
    ];

    roleOther = signal('');
    roleOtherTouched = signal(false);

    phonePrefix = signal('+63');
    phonePrefixes = PHONE_PREFIXES;
    countries = COUNTRIES;

    provinces = signal<string[]>([]);
    provincesLoading = signal(false);
    cities = signal<string[]>([]);
    citiesLoading = signal(false);

    private map: L.Map | null = null;
    private countryLayer: L.GeoJSON | null = null;
    private streetDebounce: ReturnType<typeof setTimeout> | null = null;
    private pin: L.Marker | null = null;

    selectedSpecialties = signal<string[]>([]);
    specialtyDraft = signal('');
    specialtyCustom = signal('');
    specialtyTouched = signal(false);
    specialtiesCharCount = computed(() => this.selectedSpecialties().join(',').length);
    specialtiesAtLimit = computed(() => this.specialtiesCharCount() >= 500);

    pinMode = signal(false);
    pinnedCoords = signal<{ lat: number; lng: number } | null>(null);
    pinTouched = signal(false);

    clinicLogo = signal<File | null>(null);
    clinicLogoPreview = signal<string | null>(null);
    clinicLogoError = signal<string | null>(null);

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private onboardingService: OnboardingService,
    ) {
        effect(() => {
            if (this.currentStep() === 2 && !this.isFetching()) {
                setTimeout(() => this.initMap(), 100);
            } else {
                this.destroyMap();
            }
        });
    }

	async ngOnInit(): Promise<void> {
        this.profileForm = this.fb.group({
            firstName: [{ value: '', disabled: true }],
            lastName:  [{ value: '', disabled: true }],
            role:      ['', Validators.required],
            phone:     ['', [Validators.required, Validators.pattern(/^[\d\s\-()]{5,15}$/)]],
        });

        this.clinicForm = this.fb.group({
            clinicName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            country:    ['', Validators.required],
            province:   [''],
            city:       [''],
            street:     ['', Validators.maxLength(100)],
        });

        const claims = await this.authService.getTokenClaims();
        if (claims) {
            this.tokenClaims = claims;
            this.profileForm.patchValue({
                firstName: claims.givenName,
                lastName:  claims.familyName,
            });
        }

        const email = this.tokenClaims?.email;
        if (!email) {
            this.isFetching.set(false);
            return;
        }

        try {
            await this.onboardingService.fetchUserAttributes(email);
            this.router.navigate(['/dashboard']);
        } catch {
            // 404 means user hasn't submitted yet — continue with onboarding
        } finally {
            this.isFetching.set(false);
        }
    }

    ngOnDestroy(): void {
        this.destroyMap();
    }

    private destroyMap(): void {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.countryLayer = null;
            this.pin = null;
        }
        this.pinMode.set(false);
    }

    private placePin(lat: number, lng: number): void {
        if (this.pin && this.map) {
            this.map.removeLayer(this.pin);
        }
        const icon = L.divIcon({
            className: '',
            html: '<span class="material-icons-round" style="font-size:32px;color:#ef4444;line-height:1;display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))">location_on</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
        this.pin = L.marker([lat, lng], { icon }).addTo(this.map!);
        this.pinnedCoords.set({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
        this.pinTouched.set(false);
        this.map!.flyTo([lat, lng], 13, { duration: 1.2 });
    }

    togglePinMode(): void {
        this.pinMode.update(v => !v);
        if (this.map) {
            this.map.getContainer().style.cursor = this.pinMode() ? 'crosshair' : '';
        }
    }

    onLogoChange(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.clinicLogoError.set(null);
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.clinicLogoError.set('Please upload an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            this.clinicLogoError.set('File size must be under 2MB.');
            return;
        }
        this.clinicLogo.set(file);
        const reader = new FileReader();
        reader.onload = (e) => this.clinicLogoPreview.set(e.target?.result as string);
        reader.readAsDataURL(file);
    }

    removeLogo(): void {
        this.clinicLogo.set(null);
        this.clinicLogoPreview.set(null);
        this.clinicLogoError.set(null);
    }

    removePin(): void {
        if (this.pin && this.map) {
            this.map.removeLayer(this.pin);
            this.pin = null;
        }
        this.pinnedCoords.set(null);
    }

    private initMap() {
        if (this.map) return;
        const el = document.getElementById('clinic-map');
        if (!el) return;

        this.map = L.map('clinic-map', {
            center: [20, 0],
            zoom: 2,
            maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
            maxBoundsViscosity: 1.0,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            if (!this.pinMode()) return;
            this.placePin(e.latlng.lat, e.latlng.lng);
            this.pinMode.set(false);
            this.map!.getContainer().style.cursor = '';
        });

        if (this.pinnedCoords()) {
            const { lat, lng } = this.pinnedCoords()!;
            this.placePin(lat, lng);
        }

        this.clinicForm.get('country')!.valueChanges.subscribe(country => {
            if (country) {
                this.flyToRegion(country);
                this.fetchProvinces(country);
                this.clinicForm.get('province')!.setValue('', { emitEvent: false });
                this.clinicForm.get('city')!.setValue('', { emitEvent: false });
                this.provinces.set([]);
                this.cities.set([]);
            }
        });

        this.clinicForm.get('province')!.valueChanges.subscribe(province => {
            const country = this.clinicForm.get('country')!.value;
            if (province && country) {
                this.flyToRegion(`${province}, ${country}`);
                this.fetchCities(country, province);
                this.clinicForm.get('city')!.setValue('', { emitEvent: false });
                this.cities.set([]);
            }
        });

        this.clinicForm.get('city')!.valueChanges.subscribe(city => {
            const country = this.clinicForm.get('country')!.value;
            const province = this.clinicForm.get('province')!.value;
            if (city && country) this.flyToRegion(`${city}, ${province}, ${country}`);
        });

        this.clinicForm.get('street')!.valueChanges.subscribe(street => {
            if (this.streetDebounce) clearTimeout(this.streetDebounce);
            const city    = this.clinicForm.get('city')!.value;
            const province = this.clinicForm.get('province')!.value;
            const country = this.clinicForm.get('country')!.value;
            if (street && country) {
                this.streetDebounce = setTimeout(() => {
                    this.flyToRegion(`${street}, ${city}, ${province}, ${country}`);
                }, 600);
            }
        });
    }

    private async fetchProvinces(country: string): Promise<void> {
        this.provincesLoading.set(true);
        this.provinces.set([]);
        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country }),
            });
            const json = await res.json();
            const states: { name: string }[] = json?.data?.states ?? [];
            this.provinces.set(states.map(s => s.name));
        } catch {
            this.provinces.set([]);
        } finally {
            this.provincesLoading.set(false);
        }
    }

    private async fetchCities(country: string, state: string): Promise<void> {
        this.citiesLoading.set(true);
        this.cities.set([]);
        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country, state }),
            });
            const json = await res.json();
            const list: string[] = json?.data ?? [];
            this.cities.set(list);
        } catch {
            this.cities.set([]);
        } finally {
            this.citiesLoading.set(false);
        }
    }

    private async flyToRegion(query: string): Promise<void> {
        if (!this.map) return;
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&polygon_geojson=1`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.length) return;

            const { boundingbox, geojson } = data[0];

            if (this.countryLayer) {
                this.map.removeLayer(this.countryLayer);
                this.countryLayer = null;
            }

            if (geojson) {
                this.countryLayer = L.geoJSON(geojson, {
                    style: {
                        color: '#0ea5e9',
                        weight: 2,
                        opacity: 1,
                        fillColor: '#0ea5e9',
                        fillOpacity: 0.15,
                    },
                }).addTo(this.map);
            }

            const bounds = L.latLngBounds(
                [parseFloat(boundingbox[0]), parseFloat(boundingbox[2])],
                [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])],
            );
            this.map.flyToBounds(bounds, { padding: [30, 30], duration: 1.2 });
        } catch { }
    }

    async confirmLogout() {
        await this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

	async confirmSubmit() {
        this.showSubmitModal.set(false);
        this.isLoading.set(true);
        try {
            let clinic_logo_url: string | undefined;
            const logoFile = this.clinicLogo();
            if (logoFile) {
                const { uploadUrl, fileUrl } = await this.onboardingService.getLogoUploadUrl(logoFile.name, logoFile.type);
                await fetch(uploadUrl, { method: 'PUT', body: logoFile, headers: { 'Content-Type': logoFile.type } });
                clinic_logo_url = fileUrl;
            }

            await this.onboardingService.submitOnboarding({
                username:             this.authService.currentUser()!.username,
                given_name:           this.tokenClaims?.givenName  ?? '',
                family_name:          this.tokenClaims?.familyName ?? '',
                email:                this.tokenClaims?.email       ?? '',
                clinic_name:          this.clinicForm.get('clinicName')!.value,
                clinic_street_addr:   this.clinicForm.get('street')!.value,
                clinic_province_addr: this.clinicForm.get('province')!.value,
                clinic_city_addr:     this.clinicForm.get('city')!.value,
                clinic_country_addr:  this.clinicForm.get('country')!.value,
                phone:                `${this.phonePrefix()}${this.profileForm.get('phone')!.value.replace(/[\s\-()]/g, '')}`,
                role:                 this.profileForm.get('role')!.value === 'Other'
                                          ? this.roleOther().trim()
                                          : this.profileForm.get('role')!.value,
                specialties:          this.selectedSpecialties().join(','),
                clinic_lat:           this.pinnedCoords()!.lat.toString(),
                clinic_lng:           this.pinnedCoords()!.lng.toString(),
                clinic_logo_url,
            });
            this.currentStep.set(4);
        } catch (error: any) {
            console.error('Onboarding submission failed:', error);
            this.errorMessage.set(error?.error?.message ?? error?.message ?? null);
            this.showErrorModal.set(true);
        } finally {
            this.isLoading.set(false);
        }
    }

    get availableSpecialties() {
        return this.specialties.filter((s) => !this.selectedSpecialties().includes(s));
    }

    addSpecialty() {
        const draft = this.specialtyDraft();
        const value = draft === 'Other' ? this.specialtyCustom().trim() : draft;
        if (!value || this.selectedSpecialties().includes(value)) return;
        const current = this.selectedSpecialties();
        const next = [...current, value].join(',');
        if (next.length > 500) return;
        this.selectedSpecialties.update((list) => [...list, value]);
        this.specialtyDraft.set('');
        this.specialtyCustom.set('');
    }

    removeSpecialty(specialty: string) {
        this.selectedSpecialties.update((list) => list.filter((s) => s !== specialty));
    }

    next() {
        const form = this.currentStep() === 1 ? this.profileForm
                   : this.currentStep() === 2 ? this.clinicForm
                   : null;

        if (form) {
            form.markAllAsTouched();
            if (form.invalid) return;
        }

        if (this.currentStep() === 1 && this.profileForm.get('role')?.value === 'Other') {
            this.roleOtherTouched.set(true);
            const v = this.roleOther().trim();
            if (v.length < 3 || v.length > 25) return;
        }

        if (this.currentStep() === 2) {
            this.specialtyTouched.set(true);
            if (this.selectedSpecialties().length === 0) return;
            this.pinTouched.set(true);
            if (!this.pinnedCoords()) return;
        }

        if (this.currentStep() < 3) {
            this.currentStep.update((s) => s + 1);
        }
    }

    back() { this.currentStep.update((s) => Math.max(s - 1, 1)); }

    goToDashboard() { this.router.navigate(['/dashboard']); }

	logout() { this.showLogoutModal.set(true); }

    cancelLogout() { this.showLogoutModal.set(false); }

}
