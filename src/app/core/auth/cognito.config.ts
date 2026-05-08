import { ResourcesConfig } from 'aws-amplify';
import { environment } from '../../../environments/environment';

export const cognitoConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId:       environment.cognito.userPoolId,
            userPoolClientId: environment.cognito.userPoolClientId,
            loginWith: {
                oauth: {
                    domain:          environment.cognito.oauthDomain,
                    scopes:          ['email', 'openid', 'profile'],
                    redirectSignIn:  [environment.cognito.redirectSignIn],
                    redirectSignOut: [environment.cognito.redirectSignOut],
                    responseType:    'code',
                },
            },
        },
    },
};

export const staffCognitoConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId:       environment.staffCognito.userPoolId,
            userPoolClientId: environment.staffCognito.userPoolClientId,
            loginWith: {
                oauth: {
                    domain:          environment.staffCognito.oauthDomain,
                    scopes:          ['email', 'openid', 'profile'],
                    redirectSignIn:  [environment.staffCognito.redirectSignIn],
                    redirectSignOut: [environment.staffCognito.redirectSignOut],
                    responseType:    'code',
                },
            },
        },
    },
};
