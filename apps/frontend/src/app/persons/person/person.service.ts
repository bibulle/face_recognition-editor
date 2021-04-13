import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Person } from '@face-recognition-editor/data';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private http: HttpClient) {}

  fetch(person: Person) {
    setTimeout(() => {
      this.http.get<Person>(this.getPersonUrl(person.id)).subscribe((p) => {
        person.fill(p);
      });
    });
  }

  updateName(person: Person, name: String) {
    this.http
      .patch<Person>(this.getPersonUrl(person.id), {
        name: name,
      })
      .subscribe((p) => {
        person.fill(p);
      });
  }

  validateFace(person: Person, validated: boolean, face_url: string, askedValidated: boolean) {
    this.http
      .patch<Person>(this.getFaceUrl(person.id, validated, face_url), {
        validated: askedValidated,
      })
      .subscribe((p) => {
        person.fill(p);
      });
  }
  deleteFace(person: Person, validated: boolean, face_url: string) {
    this.http
      .delete<Person>(this.getFaceUrl(person.id, validated, face_url))
      .subscribe((p) => {
        person.fill(p);
      });
  }

  getPersonUrl(person_id: string): string {
    return `/api/person/${person_id}`;
  }
  getFaceUrl(person_id: string, validated: boolean, face_url: string): string {
    return `/api/person/${person_id}/${
      validated ? 'validated' : 'notvalidated'
    }/${face_url}`;
  }
  getFaceSrcUrl(face_source_url: string): string {
    return `/api/person/face_source/${face_source_url}`;
  }
}
