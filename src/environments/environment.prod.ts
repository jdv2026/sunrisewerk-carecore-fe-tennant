export const environment = {
    production: true,
    cognito: {
        userPoolId:       'PROD_USER_POOL_ID',
        userPoolClientId: 'PROD_USER_POOL_CLIENT_ID',
        region:           'ap-southeast-1',
        oauthDomain:      'PROD_OAUTH_DOMAIN',
        redirectSignIn:   'https://PROD_DOMAIN/auth/login',
        redirectSignOut:  'https://PROD_DOMAIN/auth/login',
    },
    staffCognito: {
        userPoolId:       'ap-southeast-1_iedy3u0Pf',
        userPoolClientId: '3s35j6uu0h7482jtisglqj7o8',
        region:           'ap-southeast-1',
        oauthDomain:      'ap-southeast-1iedy3u0Pf.auth.ap-southeast-1.amazoncognito.com',
        redirectSignIn:   'https://www.sunrisewerk.com/auth/login',
        redirectSignOut:  'https://www.sunrisewerk.com/auth/login',
    },
    backendApi:        'https://PROD_BACKEND_API/',
    laravelBackendApi: 'https://privateusers.sunrisewerk.com/api/',
};
