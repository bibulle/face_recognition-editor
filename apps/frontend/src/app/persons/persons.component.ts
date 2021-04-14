import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Person } from '@face-recognition-editor/data';
import { MaterialModule } from '@face-recognition-editor/material';
import { PersonModule } from './person/person.component';
import { PersonService } from './person/person.service';

@Component({
  selector: 'face-recognition-editor-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.less'],
})
export class PersonsComponent implements OnInit {
  persons: Person[] = [];

  constructor(private http: HttpClient, private _personService: PersonService) {}

  ngOnInit(): void {
    this._personService.fetchAll().then(persons => {
      this.persons = persons;
    });
  }

}

@NgModule({
  imports: [
    BrowserModule, 
    MaterialModule,
    PersonModule
  ],
  declarations: [
    PersonsComponent
  ],
  providers: [
    // PersonService
  ],
  exports: [
    PersonsComponent
  ]
})
export class PersonsModule {
}