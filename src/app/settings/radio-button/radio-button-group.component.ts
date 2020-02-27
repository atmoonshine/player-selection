import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { RadioButtonComponent } from './radio-button.component';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-radio-button-group',
    template: '<ng-content></ng-content>',
    styles: [':host {display: block}'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonGroupComponent implements AfterContentInit {
    private _selectedValue: any | undefined = undefined;

    @ContentChildren(RadioButtonComponent) radioButtons: QueryList<RadioButtonComponent> | undefined;

    @Input() set selectedValue(value: any | undefined) {
        this._selectedValue = value;
        this.updateButtons();
    }

    get selectedValue(): any | undefined {
        return this._selectedValue;
    }

    ngAfterContentInit() {
        this.updateButtons();

        if (this.radioButtons) {
            this.radioButtons.changes.pipe(tap(() => this.updateButtons())).subscribe();
        }
    }

    updateButtons() {
        if (this.radioButtons) {
            this.radioButtons.forEach(button => (button.isChecked = button.value === this._selectedValue));
        }
    }
}
