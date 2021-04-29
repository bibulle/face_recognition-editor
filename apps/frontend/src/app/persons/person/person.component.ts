import { HttpClient } from '@angular/common/http';
import { Component, Input, NgModule, OnDestroy, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Face, Person } from '@face-recognition-editor/data';
import { MaterialModule } from '@face-recognition-editor/material';
import { Subject, Subscription} from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FaceModule } from './face/face.component';
import { PersonService } from './person.service';


@Component({
  selector: 'face-recognition-editor-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css'],
})
export class PersonComponent implements OnInit, OnDestroy {
  @Input() person: Person;
  editing_name = false;

  // The queue to manage user choices
  private subjectName: Subject<String>;
  private _nameChangesSubscription: Subscription;


  constructor(private _personService: PersonService) {}

  ngOnInit(): void {
    this._personService.fetch(this.person);

    // Apply UI changes
    if (!this.subjectName) {
      this.subjectName = new Subject<String>();
      this._nameChangesSubscription = this.subjectName
        .pipe(debounceTime(1000))
        .subscribe(
          (name) => {
            console.log(name);
            this._personService.updateName(this.person, name);
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  getPersonThumbnail(): Face {
    if (this.person.getValidated() && this.person.getValidated().length > 0) {
      return this.person.getValidated()[0];
    } else {
      return undefined
    }
  }
  getPersonThumbnailUrl() {
    return this._personService.getFaceUrl(this.person.id, true, this.getPersonThumbnail().url);
  }

  ngOnDestroy() {
    if (this._nameChangesSubscription) {
      this._nameChangesSubscription.unsubscribe();
    }
  }


  nameFocusOut() {
    // console.log('nameFocusOut ' + this.person.name);
    this.editing_name = false;
  }
  nameFocusIn() {
    // console.log('nameFocusIn  ' + this.person.name);
    this.editing_name = true;
  }
  nameClick() {
    // console.log('nameClick    ' + this.person.name);
    this.editing_name = true;
  }
  nameChanged() {
    this.subjectName.next(this.person.name);
  }
}

@NgModule({
  imports: [
    BrowserModule, 
    MaterialModule,
    FaceModule
  ],
  declarations: [
    PersonComponent
  ],
  providers: [
    PersonService
  ],
  exports: [
    PersonComponent
  ]
})
export class PersonModule {
}