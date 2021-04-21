import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PersonsModule } from './persons/persons.component';
import { MaterialModule } from '@face-recognition-editor/material';
import { SortPickerModule } from './sort-picker/sort-picker.component';
import { ProgressModule } from './progress/progress.component';
import { DeltaDatePipe } from './pipes/delta-date.pipe';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    PersonsModule,
    SortPickerModule,
    ProgressModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
