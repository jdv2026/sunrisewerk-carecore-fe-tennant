import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    scrolled = signal(false);
    menuOpen = signal(false);

    @HostListener('window:scroll')
    onScroll() {
        this.scrolled.set(window.scrollY > 20);
    }

    toggleMenu() {
        this.menuOpen.update((v) => !v);
    }
}
