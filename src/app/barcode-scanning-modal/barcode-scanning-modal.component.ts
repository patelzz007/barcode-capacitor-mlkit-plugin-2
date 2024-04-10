import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  GetMaxZoomRatioResult,
  GetMinZoomRatioResult,
  IsTorchAvailableResult,
  LensFacing,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-barcode-scanning-modal',
  templateUrl: 'barcode-scanning-modal.component.html',
  styleUrls: ['barcode-scanning-modal.component.scss'],
})
export class BarcodeScanningModalComponent implements OnInit, AfterViewInit, OnDestroy {
  public barcodeFormats: BarcodeFormat[] = [BarcodeFormat.QrCode, BarcodeFormat.DataMatrix];
	public lensFacing: LensFacing = LensFacing.Back;

  public barcodes: Barcode[] = [];
  public isSupported = false;
  public isPermissionGranted = false;

  	// Declare variables to hold references to DOM elements
	public slider: HTMLInputElement | null = null;
	public output: HTMLElement | null = null;

	@ViewChild("square")
	public squareElement: ElementRef<HTMLDivElement> | undefined;

	public isTorchAvailable = false;
	public minZoomRatio: number | undefined;
	public maxZoomRatio: number | undefined;
  
  constructor(private modalCtrl: ModalController, private ngZone: NgZone) {}

  public ngOnInit(): void {
		BarcodeScanner.isTorchAvailable().then((result: IsTorchAvailableResult) => {
			this.isTorchAvailable = result.available;
		});
	}

	public ngAfterViewInit(): void {
		setTimeout(() => {
			this.startScan();
		}, 500);
	}

	public ngOnDestroy(): void {
		this.stopScan();
	}

	public setZoomRatio(event: Event): void {
		console.log("setZoomRatio", event);

		// Check if the event target is an HTMLInputElement
		if (!(event.target instanceof HTMLInputElement)) return;

		const targetValue = event.target.value;

		// Check if targetValue is null, undefined, or empty string
		if (!targetValue) return;

		const zoomRatio = parseInt(targetValue, 10);

		// Check if zoomRatio is NaN
		if (isNaN(zoomRatio)) return;

		BarcodeScanner.setZoomRatio({ zoomRatio });
	}

	public async closeModal(barcode?: Barcode): Promise<void> {
		this.modalCtrl.dismiss({ barcode: barcode });

		this.stopScan();
	}

	public async toggleTorch(): Promise<void> {
		await BarcodeScanner.toggleTorch();
	}

	private async startScan(): Promise<void> {
		// Hide everything behind the modal (see `src/theme/variables.scss`)
		document.querySelector("body")?.classList.add("barcode_scanning_active");

		const options: StartScanOptions = {
			formats: this.barcodeFormats,
			lensFacing: this.lensFacing,
		};

		const squareElementBoundingClientRect = this.squareElement?.nativeElement.getBoundingClientRect();
		const scaledRect = squareElementBoundingClientRect
			? {
					left: squareElementBoundingClientRect.left * window.devicePixelRatio,
					right: squareElementBoundingClientRect.right * window.devicePixelRatio,
					top: squareElementBoundingClientRect.top * window.devicePixelRatio,
					bottom: squareElementBoundingClientRect.bottom * window.devicePixelRatio,
					width: squareElementBoundingClientRect.width * window.devicePixelRatio,
					height: squareElementBoundingClientRect.height * window.devicePixelRatio,
				}
			: undefined;
		const detectionCornerPoints = scaledRect
			? [
					[scaledRect.left, scaledRect.top],
					[scaledRect.left + scaledRect.width, scaledRect.top],
					[scaledRect.left + scaledRect.width, scaledRect.top + scaledRect.height],
					[scaledRect.left, scaledRect.top + scaledRect.height],
				]
			: undefined;
		const listener = await BarcodeScanner.addListener("barcodeScanned", async event => {
			this.ngZone.run(() => {
				const cornerPoints = event.barcode.cornerPoints;
				if (detectionCornerPoints && cornerPoints) {
					if (
						detectionCornerPoints[0][0] > cornerPoints[0][0] ||
						detectionCornerPoints[0][1] > cornerPoints[0][1] ||
						detectionCornerPoints[1][0] < cornerPoints[1][0] ||
						detectionCornerPoints[1][1] > cornerPoints[1][1] ||
						detectionCornerPoints[2][0] < cornerPoints[2][0] ||
						detectionCornerPoints[2][1] < cornerPoints[2][1] ||
						detectionCornerPoints[3][0] > cornerPoints[3][0] ||
						detectionCornerPoints[3][1] < cornerPoints[3][1]
					)
						return;
				}
				listener.remove();
				this.closeModal(event.barcode);
			});
		});
		await BarcodeScanner.startScan(options);

		BarcodeScanner.getMinZoomRatio().then((result: GetMinZoomRatioResult) => {
			this.minZoomRatio = result.zoomRatio;
		});
		BarcodeScanner.getMaxZoomRatio().then((result: GetMaxZoomRatioResult) => {
			this.maxZoomRatio = result.zoomRatio;
		});
	}

	private async stopScan(): Promise<void> {
		// Show everything behind the modal again
		document.querySelector("body")?.classList.remove("barcode_scanning_active");

		await BarcodeScanner.stopScan();
	}
}
