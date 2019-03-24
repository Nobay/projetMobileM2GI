import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-map-item',
  templateUrl: './map-item.page.html',
  styleUrls: ['./map-item.page.scss'],
})
export class MapItemPage implements OnInit {

  @Input() title: string;

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {
  }

    /**
     * after a click on the map, it dismisses this page (a modal) and sends the data (latitude and logitude) to CreateItemPage
     * @param latLng
     */
  public getPosition(latLng) {
    console.log(latLng);
    this.modalController.dismiss(latLng);
  }

  public cancelMap() {
    this.modalController.dismiss();
  }

    /**
     * uses GPS or Wifi to get the device's location
     */
  public getOwnLocation() {
      navigator.geolocation.getCurrentPosition(position => {
          const latLng = {
            coords: {
              lat: 0.0,
              lng: 0.0
            }
          };
          latLng.coords.lat = position.coords.latitude;
          latLng.coords.lng = position.coords.longitude;
          this.modalController.dismiss(latLng);
      }, () => {
          alert('Geolocation is not activated within your device.');
          this.modalController.dismiss();
      });
  }

}
