import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'button[radio-button]',
    template: '<div class="checkmark"></div><div class="content"><ng-content></ng-content></div>',
    styleUrls: ['./radio-button.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonComponent {
    protected get getTargetElement() {
        return this.elementRef.nativeElement as HTMLButtonElement;
    }
    private _isChecked = false;
    @Input() set isChecked(value: boolean) {
        this._isChecked = value;

        if (this._isChecked) {
            this.elementRef.nativeElement.classList.add('checked');
        } else {
            this.elementRef.nativeElement.classList.remove('checked');
        }
    }

    @Input() value: any;

    constructor(private elementRef: ElementRef<HTMLButtonElement>) {}
}
