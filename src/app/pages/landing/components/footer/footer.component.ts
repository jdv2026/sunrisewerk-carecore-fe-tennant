import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    year = new Date().getFullYear();

    links: { heading: string; items: { label: string; route?: string; fragment?: string }[] }[] = [
        {
            heading: 'Product',
            items: [
                { label: 'Features', route: '/', fragment: 'features' },
                { label: 'Pricing', route: '/', fragment: 'pricing' },
                { label: 'Changelog' },
                { label: 'Roadmap' },
            ],
        },
        {
            heading: 'Solutions',
            items: [
                { label: 'Solo Practitioners', route: '/solutions/solo-practitioners' },
                { label: 'Multi-Clinic Networks', route: '/solutions/multi-clinic' },
                { label: 'Hospitals', route: '/solutions/hospitals' },
                { label: 'Telehealth', route: '/solutions/telehealth' },
            ],
        },
        {
            heading: 'Company',
            items: [
                { label: 'About Us', route: '/about' },
                { label: 'Blog', route: '/blog' },
            ],
        },
        {
            heading: 'Legal',
            items: [
                { label: 'Privacy Policy', route: '/legal/privacy' },
                { label: 'Terms of Service', route: '/legal/terms' },
                { label: 'Cookie Policy', route: '/legal/cookies' },
            ],
        },
    ];
}
