import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-blog',
    imports: [RouterLink],
    templateUrl: './blog.component.html',
    styleUrl: './blog.component.scss',
})
export class BlogComponent {
    year = new Date().getFullYear();

    featured = {
        category: 'Product Update',
        title: 'Introducing Smart Scheduling: AI-Powered Appointment Optimization',
        excerpt: 'We\'ve built a new scheduling engine that learns your clinic\'s patterns and automatically suggests optimal time slots — reducing no-shows by up to 40%.',
        date: 'April 20, 2026',
        readTime: '5 min read',
        author: 'CareCore Team',
    };

    posts = [
        {
            category: 'Healthcare Ops',
            title: 'How to Reduce No-Shows by 60% With Automated Reminders',
            excerpt: 'No-shows cost clinics thousands per month. Here\'s a practical framework for reminder timing, channels, and messaging that actually works.',
            date: 'April 15, 2026',
            readTime: '7 min read',
            author: 'CareCore Team',
        },
        {
            category: 'Security',
            title: 'Why We Chose AWS Cognito for Healthcare Authentication',
            excerpt: 'Authentication in healthcare is uniquely high-stakes. We break down our architecture decisions and what healthcare providers should look for in an auth system.',
            date: 'April 10, 2026',
            readTime: '6 min read',
            author: 'CareCore Team',
        },
        {
            category: 'Product Update',
            title: 'Multi-Clinic Networks: Managing Multiple Locations From One Dashboard',
            excerpt: 'Running more than one clinic? The new Networks feature lets you manage staff, schedules, and reports across all your locations in a single view.',
            date: 'April 3, 2026',
            readTime: '4 min read',
            author: 'CareCore Team',
        },
        {
            category: 'Healthcare Ops',
            title: 'The Real Cost of Manual Appointment Scheduling',
            excerpt: 'We analyzed data from 500+ clinics and found that manual scheduling costs an average of 14 staff-hours per week. Here\'s what that means in dollars.',
            date: 'March 28, 2026',
            readTime: '5 min read',
            author: 'CareCore Team',
        },
        {
            category: 'Guide',
            title: 'HIPAA for Small Clinics: What You Actually Need to Know',
            excerpt: 'HIPAA compliance sounds overwhelming. This plain-language guide covers the essentials that every clinic administrator needs to understand.',
            date: 'March 20, 2026',
            readTime: '9 min read',
            author: 'CareCore Team',
        },
    ];

    categories = ['All', 'Product Update', 'Healthcare Ops', 'Security', 'Guide'];
}
