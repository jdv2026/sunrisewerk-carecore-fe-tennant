import { bootstrapApplication } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { cognitoConfig } from './app/core/auth/cognito.config';

Amplify.configure(cognitoConfig);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
