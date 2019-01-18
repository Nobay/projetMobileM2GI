import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TodoServiceProvider} from './providers/todo-service.provider';
import {CreateItemPage} from './todo-item/create-item/create-item.page';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
      AppComponent,
      CreateItemPage
  ],
  entryComponents: [CreateItemPage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: [
      StatusBar,
      SplashScreen,
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      TodoServiceProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
