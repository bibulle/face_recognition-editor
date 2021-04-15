export class Person {
  id: string;
  name: string;
  summary: boolean;

  creationTime: number = 0;
  modificationTime: number = 0;

  private validated: Face[] = [];
  private toValidate: Face[] = [];

  constructor(name: string) {
    this.name = name;

    this.id = encodeURIComponent(name);
    this.summary = true;
  }

  setValidated(validated: Face[]) {
    this.validated = validated;
    this.summary = false;
  }
  setToValidate(toValidate: Face[]) {
    this.toValidate = toValidate;
    this.summary = false;
  }
  getValidated(): Face[] {
    return this.validated;
  }
  getToValidate(): Face[] {
    return this.toValidate;
  }

  fill(p: Person) {
    this.id = p.id;
    this.name = p.name;
    this.summary = p.summary;
    this.creationTime = p.creationTime;
    this.modificationTime = p.modificationTime;
    this.toValidate = p.toValidate;
    this.validated = p.validated;
  }

}

export class Face {
  url: string;
  validated: boolean;

  sourceUrl: string;

  top: number;
  right: number;
  left: number;
  bottom: number;

  width: number;
  height: number;

  constructor(url: string, validated: boolean) {
    this.url = encodeURIComponent(url);
    this.validated = validated;
  }
}
 