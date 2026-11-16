import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="empty page">
      <img src="assets/bonfire.png" alt="" width="90" />
      <h3>Te alejaste de la fogata</h3>
      <p>La página que buscas no existe o cambió de lugar.</p>
      <a class="btn btn-primary" routerLink="/inicio">Volver a la cabaña</a>
    </section>
  `,
  styles: `.empty { padding-top: 80px; } h3 { font-size: 26px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
