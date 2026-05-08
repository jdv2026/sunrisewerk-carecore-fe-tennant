import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { FeaturesComponent } from './components/features/features.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { CtaBannerComponent } from './components/cta-banner/cta-banner.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
    selector: 'app-landing',
    imports: [
        NavbarComponent,
        HeroComponent,
        StatsComponent,
        FeaturesComponent,
        HowItWorksComponent,
        PricingComponent,
        TestimonialsComponent,
        CtaBannerComponent,
        FooterComponent,
    ],
    template: `
        <app-navbar />
        <main>
            <app-hero />
            <app-stats />
            <app-features />
            <app-how-it-works />
            <app-pricing />
            <app-testimonials />
            <app-cta-banner />
        </main>
        <app-footer />
    `,
})
export class LandingComponent {}
