import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { Routes, RouterModule } from '@angular/router';
import { ResolutionComponent } from './resolution/resolution.component';
import { RadioButtonComponent } from './radio-button/radio-button.component';
import { RadioButtonGroupComponent } from './radio-button/radio-button-group.component';

const routes: Routes = [
    {
        path: 'settings',
        component: SettingsComponent,
        children: [
            { path: 'resolution', component: ResolutionComponent },
            { path: '', redirectTo: 'resolution', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    declarations: [SettingsComponent, ResolutionComponent, RadioButtonComponent, RadioButtonGroupComponent],
    imports: [CommonModule, RouterModule.forChild(routes)]
})
export class SettingsModule {}
