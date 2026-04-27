export const environment = {
    production: true,
    cognito: {
        userPoolId: 'PROD_USER_POOL_ID',
        userPoolClientId: 'PROD_USER_POOL_CLIENT_ID',
        region: 'ap-southeast-1',
        oauthDomain: 'PROD_OAUTH_DOMAIN',
        redirectSignIn: 'https://PROD_DOMAIN/auth/login',
        redirectSignOut: 'https://PROD_DOMAIN/auth/login',
    },
    backendApi: 'https://PROD_BACKEND_API/',
};
