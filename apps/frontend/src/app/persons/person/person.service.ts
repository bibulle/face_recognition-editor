import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Person } from '@face-recognition-editor/data';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private http: HttpClient) {}

  fetch(person: Person) {
    this.http.get<Person>(`/api/person/${person.id}`).subscribe((p) => {
      person.fill(p);
    });
  }

  updateName(person: Person, name: String) {
    this.http
      .put<Person>(`/api/person/${person.id}/rename`, { name: name })
      .subscribe((p) => {
        person.fill(p);
      });
  }

  deleteFace(person: Person, validated: boolean, face_url: string) {
    this.http
      .delete<Person>(
        `/api/person/${person.id}/${
          validated ? 'validated' : 'notvalidated'
        }/${face_url}`
      )
      .subscribe((p) => {
        person.fill(p);
      });
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
