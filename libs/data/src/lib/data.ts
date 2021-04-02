export class Person {
  id: string;
  name: string;
  files = [];

  constructor(name: string) {
    this.name = name;

    this.id = encodeURIComponent(name);
  }
}
 