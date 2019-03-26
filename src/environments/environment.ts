// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    firebase: {
        apiKey: 'AIzaSyDy8q7lT4N9DPYx01bMeoYPsvspao8ZDFQ',
        authDomain: 'projetmobile-414b5.firebaseapp.com',
        databaseURL: 'https://projetmobile-414b5.firebaseio.com',
        projectId: 'projetmobile-414b5',
        storageBucket: 'projetmobile-414b5.appspot.com',
        messagingSenderId: '256309942188'
    },
    googlePlus: {
        webClientID: '460159730586-6l007jt8hjij9k0t6jd8aunjnhj45h5g.apps.googleusercontent.com'
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
