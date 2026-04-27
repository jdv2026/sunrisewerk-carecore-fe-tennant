import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-privacy',
    imports: [RouterLink],
    templateUrl: './privacy.component.html',
    styleUrl: './privacy.component.scss',
})
export class PrivacyComponent {
    lastUpdated = 'April 20, 2025';
}
