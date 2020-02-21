import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Focusable } from './focusable.directive';

@NgModule({
    declarations: [Focusable],
    imports: [CommonModule],
    exports: [Focusable]
})
export class SharedModule {}
