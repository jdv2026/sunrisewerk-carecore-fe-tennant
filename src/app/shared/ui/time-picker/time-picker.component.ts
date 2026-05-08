import { Component, input, output } from '@angular/core';

function generateSlots(startHour: number, endHour: number): string[] {
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < endHour) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

@Component({
    selector: 'app-time-picker',
    templateUrl: './time-picker.component.html',
    styleUrl: './time-picker.component.scss',
})
export class TimePickerComponent {
    value         = input<string>('');
    disabledSlots = input<Set<string>>(new Set());
    valueChange   = output<string>();

    readonly slots = generateSlots(7, 20);

    format(slot: string): string {
        const [h, m] = slot.split(':');
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    select(slot: string): void {
        if (this.disabledSlots().has(slot)) return;
        this.valueChange.emit(slot);
    }
}
