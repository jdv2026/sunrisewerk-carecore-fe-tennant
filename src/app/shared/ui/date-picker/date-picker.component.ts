import { Component, computed, input, output, signal } from '@angular/core';

export interface CalendarDay {
    dateStr: string | null;
    day: number;
    disabled: boolean;
    isToday: boolean;
    isSelected: boolean;
    isPadding: boolean;
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function toDateStr(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.scss',
})
export class DatePickerComponent {
    value   = input<string>('');
    minDate = input<string>('');
    valueChange = output<string>();

    viewMonth = signal(new Date().getMonth());
    viewYear  = signal(new Date().getFullYear());

    readonly dayHeaders = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    get monthLabel(): string {
        return `${MONTHS[this.viewMonth()]} ${this.viewYear()}`;
    }

    days = computed((): CalendarDay[] => {
        const year  = this.viewYear();
        const month = this.viewMonth();
        const minStr = this.minDate();
        const selStr = this.value();

        const now = new Date();
        const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
        const firstWeekday = new Date(year, month, 1).getDay();
        const daysInMonth  = new Date(year, month + 1, 0).getDate();

        const result: CalendarDay[] = [];

        for (let i = 0; i < firstWeekday; i++) {
            result.push({ dateStr: null, day: 0, disabled: true, isToday: false, isSelected: false, isPadding: true });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = toDateStr(year, month, d);
            result.push({
                dateStr,
                day:        d,
                disabled:   minStr ? dateStr < minStr : false,
                isToday:    dateStr === todayStr,
                isSelected: dateStr === selStr,
                isPadding:  false,
            });
        }

        return result;
    });

    prevMonth(): void {
        if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
        else { this.viewMonth.update(m => m - 1); }
    }

    nextMonth(): void {
        if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
        else { this.viewMonth.update(m => m + 1); }
    }

    select(day: CalendarDay): void {
        if (day.disabled || day.isPadding || !day.dateStr) return;
        this.valueChange.emit(day.dateStr);
    }
}
