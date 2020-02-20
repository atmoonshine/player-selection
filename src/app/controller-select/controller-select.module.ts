import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControllerSelectComponent } from './controller-select.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: 'controller-select', component: ControllerSelectComponent }];

@NgModule({
    declarations: [ControllerSelectComponent],
    imports: [CommonModule, RouterModule.forChild(routes), SharedModule]
})
export class ControllerSelectModule {}
