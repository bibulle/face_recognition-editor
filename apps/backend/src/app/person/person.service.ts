import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { readdir } from 'fs';
import { join, resolve } from 'path';
import { Person } from '@face-recognition-editor/data';

const TRAIN_DIR = '../face_recognition/train_dir';

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
            .filter((v, i) => {
              return i<10
            })
            .map((d) => {
              return new Person(d.name);
            })
        );
      });
    });
  }

  async findOne(name: string): Promise<Person> {
    return new Promise<Person>((resolve, reject) => {
      readdir(join(TRAIN_DIR, name), { withFileTypes: true }, (err, files) => {
        if (err) {
          return reject(err);
        }
        const person = new Person(name);
        this.logger.log(name);

        person.validated = files
          .filter((f) => {
            return f.isFile();
          })
          .map((f) => {
            return encodeURIComponent(f.name);
          });

        readdir(
          join(TRAIN_DIR, name, 'tovalidate'),
          { withFileTypes: true },
          (err, files) => {
            if (files) {
              person.toValidate = files
                .filter((f) => {
                  return f.isFile();
                })
                .map((f) => {
                  return encodeURIComponent(f.name);
                });
            }
            resolve(person);
          }
        );
      });
    });
  }

  findOneImagePath(name: string, type: string, face: string) {
    this.logger.log(name);
    this.logger.log(type);
    this.logger.log(face);
    if (type === 'validated') {
      return resolve(join(TRAIN_DIR, name, face));
    } else {
      return resolve(join(TRAIN_DIR, name, 'tovalidate', face));
    }
  }

  update(id: number, updatePersonDto: Person) {
    return `This action updates a #${id} person`;
  }

  remove(id: number) {
    return `This action removes a #${id} person`;
  }
}
