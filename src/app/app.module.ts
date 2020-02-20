import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { GameSelectorModule } from './game-selector/game-selector.module';
import { ControllerSelectModule } from './controller-select/controller-select.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

const routes: Routes = [{ path: '', pathMatch: 'full', redirectTo: 'games' }];

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        HttpClientModule,
        SharedModule,
        CoreModule,
        GameSelectorModule,
        ControllerSelectModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
