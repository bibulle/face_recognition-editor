import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { urlencoded } from 'express';
import { readdir, statSync } from 'fs';
import { readSync } from 'node:fs';
import { join, resolve } from 'path';
import { Person } from '@face-recognition-editor/data'

let TRAIN_DIR = '../face_recognition/train_dir';

@Injectable()
export class PersonService {

  private readonly logger = new Logger(PersonService.name);

  create(createPersonDto: Person) {
    return 'This action adds a new person';
  }

  async findAll(): Promise<Person[]> {
    return new Promise<Person[]>((resolve, reject) => {
      readdir(TRAIN_DIR, { withFileTypes: true }, (err, files) => {
        if (err) {
          return reject(err);
        }
        resolve(
          files
            .filter((d) => {
              return d.isDirectory();
            })
            .map((d) => {
              return new Person(d.name);
            }),
        );
      });
    });
  }

  async findOne(name: string): Promise<Person> {
    return new Promise<Person>((resolve, reject) => {
      readdir(join(TRAIN_DIR, name), (err, files) => {
        if (err) {
          return reject(err);
        }
        let person = new Person(name);
        this.logger.log(name);

        person.files = files.map(f => { return encodeURIComponent(f) });

        resolve(person);
      });
    });
  }

  findOneImagePath(name: string, face: string) {
    return resolve(join(TRAIN_DIR, name, face));
  }

  update(id: number, updatePersonDto: Person) {
    return `This action updates a #${id} person`;
  }

  remove(id: number) {
    return `This action removes a #${id} person`;
  }
}
