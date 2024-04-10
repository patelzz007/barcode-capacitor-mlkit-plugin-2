import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { BarcodeScanningModalComponent } from '../barcode-scanning-modal/barcode-scanning-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-hello-world',
  templateUrl: 'hello-world.component.html',
  styleUrls: ['hello-world.component.scss'],
})
export class HelloWorldComponent {
  public readonly barcodeFormat = [
    BarcodeFormat.QrCode,
    BarcodeFormat.DataMatrix,
  ];
  public readonly lensFacing = LensFacing.Back;
  public barcodes: Barcode[];
  constructor(private modalCtrl: ModalController) {}

  public async startScan(): Promise<void> {
    console.log('Start Scan :');
    const formats = this.barcodeFormat;
    const lensFacing = this.lensFacing;
    const element = await this.modalCtrl.create({
      component: BarcodeScanningModalComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'barcode_scanning_modal',
      showBackdrop: false,
      componentProps: { formats, lensFacing },
    });
    await element.present();
    element.onDidDismiss().then((result) => {
      console.log('Start Scan :', result);
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.barcodes = [barcode];
        console.log('Start Scan :', this.barcodes);
      }
    });
  }

  public async scan(): Promise<void> {
    const formats = this.barcodeFormat;
    const { barcodes } = await BarcodeScanner.scan({ formats });
    this.barcodes = barcodes;

    console.log('Scan :', this.barcodes);
  }
}
