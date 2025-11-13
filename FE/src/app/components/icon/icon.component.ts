import { Component, Input } from '@angular/core';
import { IconService } from '../../services/icon.service';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      [class]="className"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      [style.display]="'block'">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.d]="iconPath"
      />
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      display: block;
      transition: transform 0.3s ease;
    }
    svg.rotated {
      transform: rotate(90deg);
    }
  `]
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() className: string = '';

  constructor(private iconService: IconService) {}

  get iconPath(): string {
    return this.iconService.getIconPath(this.name);
  }
}

