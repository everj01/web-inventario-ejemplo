import { AfterViewInit, Component, ElementRef, OnDestroy, output, signal, viewChild } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

/* Escáner de cámara (QR y códigos de barras); el navegador exige localhost o HTTPS para dar el permiso. */
@Component({
  selector: 'app-escaner',
  template: `
    <div class="fixed inset-0 z-30 flex items-center justify-center bg-tinta/80 p-3 no-imprimir">
      <div class="w-full max-w-md border border-borde bg-white">
        <div class="flex items-center justify-between border-b border-borde px-3 py-2">
          <h2 class="text-sm font-semibold">Escanear código</h2>
          <button class="btn" (click)="cerrar.emit()">Cerrar</button>
        </div>

        <div class="p-3">
          <video #video class="w-full border border-borde bg-black" playsinline muted></video>

          @if (estado()) {
            <p class="mt-2 border-l-4 border-ambar bg-ambar/5 px-2 py-1 text-sm text-ambar">{{ estado() }}</p>
          } @else {
            <p class="mt-2 text-xs text-tinta/60">Apunta al QR o al código de barras del producto.</p>
          }

          <div class="mt-3 border-t border-borde pt-3">
            <label class="etiqueta" for="manual">¿La cámara no funciona? Escribe el código</label>
            <div class="flex gap-2">
              <input id="manual" class="campo" [value]="manual()" (input)="manual.set($any($event.target).value)" />
              <button class="btn" (click)="enviarManual()">Buscar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Escaner implements AfterViewInit, OnDestroy {
  readonly leido = output<string>();
  readonly cerrar = output<void>();

  private video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private controles?: IScannerControls;
  private lector = new BrowserMultiFormatReader();

  estado = signal('');
  manual = signal('');

  async ngAfterViewInit() {
    if (!window.isSecureContext) {
      this.estado.set('La cámara necesita HTTPS (o localhost). Usa el campo de abajo mientras tanto.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.estado.set('Este navegador no permite usar la cámara.');
      return;
    }
    try {
      this.controles = await this.lector.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        this.video().nativeElement,
        (resultado) => {
          if (resultado) {
            this.detener();
            this.leido.emit(resultado.getText().trim());
          }
        },
      );
    } catch (e: unknown) {
      const nombre = (e as { name?: string })?.name;
      this.estado.set(
        nombre === 'NotAllowedError'
          ? 'Diste "no permitir" a la cámara. Habilítala en el candado de la barra de direcciones.'
          : 'No se pudo abrir la cámara en este dispositivo.',
      );
    }
  }

  enviarManual() {
    const valor = this.manual().trim();
    if (valor) this.leido.emit(valor);
  }

  private detener() {
    this.controles?.stop();
    this.controles = undefined;
  }

  ngOnDestroy() {
    this.detener();
  }
}
