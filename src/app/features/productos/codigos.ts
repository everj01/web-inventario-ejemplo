import { AfterViewInit, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Producto } from '../../core/modelos';

/* QR lleva el uuid, barras el identificador en CODE128 (EAN-13 no sirve: exige dígito verificador comprado a GS1). */
@Component({
  selector: 'app-codigos',
  template: `
    <div class="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-tinta/40 p-3">
      <div class="w-full max-w-md border border-borde bg-white">
        <div class="flex items-center justify-between border-b border-borde px-3 py-2 no-imprimir">
          <h2 class="text-sm font-semibold">Códigos del producto</h2>
          <div class="flex gap-2">
            <button class="btn" (click)="imprimir()">Imprimir</button>
            <button class="btn" (click)="cerrar.emit()">Cerrar</button>
          </div>
        </div>

        <div class="space-y-4 p-4 text-center">
          <div>
            <p class="text-sm font-semibold">{{ producto().nombre }}</p>
            <p class="text-xs text-tinta/60">{{ producto().identificador }}</p>
          </div>

          <svg #barras class="mx-auto max-w-full"></svg>

          <div>
            @if (qr()) {
              <img [src]="qr()" alt="Código QR" class="mx-auto h-40 w-40" />
            }
            <p class="mt-1 font-mono text-[10px] break-all text-tinta/50">{{ producto().uuid }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Codigos implements AfterViewInit {
  readonly producto = input.required<Producto>();
  readonly cerrar = output<void>();

  private barras = viewChild.required<ElementRef<SVGElement>>('barras');
  qr = signal('');

  async ngAfterViewInit() {
    JsBarcode(this.barras().nativeElement, this.producto().identificador, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14,
      height: 60,
      margin: 4,
    });
    this.qr.set(await QRCode.toDataURL(this.producto().uuid, { margin: 1, width: 240 }));
  }

  imprimir() {
    window.print();
  }
}
