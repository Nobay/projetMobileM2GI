import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';
import * as app from 'firebase';


@Injectable()
export class FcmService {
 user: any;
  constructor(private firebase: Firebase,
              private afs: AngularFirestore,
              private platform: Platform) {}

    /**
     * gets the token used for push notification from the firebase native plugin
     */
  async getToken() {
    let token: any;

    if (this.platform.is('android')) {
      token = await this.firebase.getToken();
      console.log(token);
    }

    if (this.platform.is('ios')) {
      token = await this.firebase.getToken();
      await this.firebase.grantPermission();
    }

    this.saveToken(token);
  }

    /**
     * saves the token as a document, containing the connected user's ID and the token, in a collection of devices.
     * @param token
     */
  private saveToken(token) {
    if (!token) { return; }

    const devicesRef = this.afs.collection('devices');

    const data = {
      token,
      uuid: app.auth().currentUser.uid
    };

    return devicesRef.doc(token).set(data);
  }

    /**
     * triggered when a notification is sent
     */
  onNotifications() {
    return this.firebase.onNotificationOpen();
  }
}
