import { Directive, ElementRef, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FocusService } from '../core/focus.service';

// tslint:disable: directive-class-suffix directive-selector
@Directive({ selector: 'a, button' })
export class Focusable implements OnInit, AfterViewInit, OnDestroy {
    private static counter = 0; 
    @Input() defaultFocus = false;
    get focusPath(): string {
        return `/${this.element.id}`;
    }
    get element(): HTMLElement {
        return this.elementRef.nativeElement;
    }
    constructor(private elementRef: ElementRef<HTMLElement>, private focusService: FocusService) {}

    ngOnInit() {
        if (!this.element.id) this.element.id = `element${Focusable.counter++}`;
        this.element.setAttribute('focusPath', this.focusPath);
        this.focusService.addFocusableElement(this);
    }
    ngAfterViewInit() {
        if (this.defaultFocus) this.element.focus();
    }
    ngOnDestroy() {
        this.focusService.addFocusableElement(this);
    }
}
