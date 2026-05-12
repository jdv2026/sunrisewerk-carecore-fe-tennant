import { Component } from '@angular/core';

@Component({
    selector: 'app-service-unavailable',
    template: `
      <div class="container">
        <div class="card">
          <div class="icon">
            <span class="material-icons-round">bedtime</span>
          </div>
          <h1>Server is Sleeping</h1>
          <p class="subtitle">This is a portfolio project hosted on AWS.</p>
          <p class="desc">
            To keep costs low, the EC2 and RDS instances are shut down
            from <strong>10:00 PM to 6:00 AM (SGT)</strong>.
          </p>
          <div class="schedule">
            <span class="material-icons-round">schedule</span>
            Available: 6 AM – 10 PM (Singapore Time)
          </div>
          <p class="note">Please come back during operating hours. Thank you for your understanding!</p>
        </div>
      </div>
    `,
    styles: [`
      .container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--surface);
      }
      .card {
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 48px 40px;
        max-width: 480px;
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        .material-icons-round { font-size: 40px; color: var(--primary); }
      }
      h1 {
        font-size: 26px;
        font-weight: 800;
        color: var(--dark);
      }
      .subtitle {
        font-size: 15px;
        color: var(--muted);
      }
      .desc {
        font-size: 15px;
        color: var(--dark-2);
        line-height: 1.7;
      }
      .schedule {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--primary-light);
        color: var(--primary-dark);
        border-radius: var(--radius);
        padding: 10px 20px;
        font-weight: 700;
        font-size: 15px;
        .material-icons-round { font-size: 20px; }
      }
      .note {
        font-size: 13px;
        color: var(--muted-light);
      }
    `],
})
export class ServiceUnavailableComponent {}
