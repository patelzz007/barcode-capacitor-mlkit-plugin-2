import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { HelloWorldComponent } from '../hello-world/hello-world.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
  ) {}

  scanQR(): void {
    this.actionSheetCtrl
      .create({
        header: 'Scan QR Code',
        buttons: [
          {
            text: 'Camera',
            icon: 'camera',
            handler: () => {
              this.modalCtrl
                .create({ component: HelloWorldComponent })
                .then((modal) => {
                  modal.present();
                });
            },
          },
          {
            text: 'File',
            icon: 'document',
            handler: () => {
              console.log('File clicked');
            },
          },
        ],
      })
      .then((actionSheet) => actionSheet.present());
  }
}
