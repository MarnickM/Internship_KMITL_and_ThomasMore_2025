import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyBgch7_nwqUTGdVppwaGzj_K6vxqIE0Grs",
  authDomain: "drawingapp-39aeb.firebaseapp.com",
  projectId: "drawingapp-39aeb",
  storageBucket: "drawingapp-39aeb.firebasestorage.app",
  messagingSenderId: "94694746073",
  appId: "1:94694746073:web:b5fdd2f42c0f5bbd471bc8"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideFirestore(() => getFirestore()),
    ]
};

