export class Person {
  id: string;
  name: string;
  validated = [];
  toValidate = [];

  constructor(name: string) {
    this.name = name;

    this.id = encodeURIComponent(name);
  }
}
 