import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    icon = input<string>('info');
    title = input.required<string>();
    body = input.required<string>();
    ctaLabel = input<string>('OK');

    closed = output<void>();

    dismiss() { this.closed.emit(); }
}
