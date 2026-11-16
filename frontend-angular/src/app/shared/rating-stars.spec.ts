import { TestBed } from '@angular/core/testing';
import { RatingStars } from './rating-stars';

describe('RatingStars', () => {
  it('en modo edición informa la estrella elegida', () => {
    const fixture = TestBed.createComponent(RatingStars);
    fixture.componentRef.setInput('editable', true);
    const changes: number[] = [];
    fixture.componentInstance.registerOnChange((v) => changes.push(v));
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(5);
    buttons[3].click();
    fixture.detectChanges();
    expect(changes).toEqual([4]);
    expect(buttons[3].getAttribute('aria-checked')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Muy buena');
  });

  it('en modo lectura describe el promedio', () => {
    const fixture = TestBed.createComponent(RatingStars);
    fixture.componentRef.setInput('value', 4.5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.stars').getAttribute('aria-label')).toBe('Calificación 4.5 de 5');
  });
});
