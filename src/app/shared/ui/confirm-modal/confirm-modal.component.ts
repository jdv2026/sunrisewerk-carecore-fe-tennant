import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
    icon = input<string>('help_outline');
    iconColor = input<'default' | 'danger'>('default');
    title = input.required<string>();
    body = input.required<string>();
    confirmLabel = input<string>('Confirm');
    cancelLabel = input<string>('Cancel');

    confirmed = output<void>();
    cancelled = output<void>();

    confirm() { this.confirmed.emit(); }
    cancel() { this.cancelled.emit(); }
}
