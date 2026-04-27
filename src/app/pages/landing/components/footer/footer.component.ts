import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    year = new Date().getFullYear();

    links = [
        {
            heading: 'Product',
            items: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
        },
        {
            heading: 'Solutions',
            items: ['Solo Practitioners', 'Multi-Clinic Networks', 'Hospitals', 'Telehealth'],
        },
        {
            heading: 'Company',
            items: ['About Us', 'Blog', 'Careers', 'Press'],
        },
        {
            heading: 'Legal',
            items: ['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookie Policy'],
        },
    ];
}
