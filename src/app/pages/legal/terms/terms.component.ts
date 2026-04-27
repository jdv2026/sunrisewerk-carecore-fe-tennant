import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-terms',
    imports: [RouterLink],
    templateUrl: './terms.component.html',
    styleUrl: './terms.component.scss',
})
export class TermsComponent {
    lastUpdated = 'April 20, 2025';
}
