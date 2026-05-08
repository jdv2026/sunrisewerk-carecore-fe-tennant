import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about',
    imports: [RouterLink],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
})
export class AboutComponent {
    year = new Date().getFullYear();

    values = [
        {
            icon: 'favorite',
            title: 'Patient-First',
            description: 'Every feature we build starts with one question: does this help clinics deliver better care?',
        },
        {
            icon: 'lock',
            title: 'Privacy by Design',
            description: 'Security and data privacy are not afterthoughts. They are built into every layer of our platform.',
        },
        {
            icon: 'bolt',
            title: 'Relentless Simplicity',
            description: 'Healthcare is complex enough. Our job is to make the software feel effortless.',
        },
        {
            icon: 'groups',
            title: 'Built with Clinics',
            description: 'We work directly with healthcare teams to shape the product — not build in isolation.',
        },
    ];
}
