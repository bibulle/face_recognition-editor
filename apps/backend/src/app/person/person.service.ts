import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { readdir, stat, rename, statSync, accessSync } from 'fs';
import { join, resolve } from 'path';
import { Face, Person } from '@face-recognition-editor/data';
import * as gm from "gm";

const im = gm.subClass({ imageMagick: true });

const TRAIN_DIR = '/train_dir';
const TEST_DIR = '/test_dir';

@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name);

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
              return i < 1000000;
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
      readdir(join(TRAIN_DIR, name), { withFileTypes: true }, async (err, files) => {
        if (err) {
          return reject(err);
        }
        const person = new Person(name);
        this.logger.log(name);

        let validated = files
          .filter((f) => {
            return f.isFile() && !f.name.startsWith('.');
          })
          .map((f) => {
            return this.findOneFaceOrigin(f.name);
          });

          let toValidate = [];
          readdir(
          join(TRAIN_DIR, name, 'tovalidate'),
          { withFileTypes: true },
          async (err, files) => {
            if (files) {
              toValidate = files
                .filter((f) => {
                  return f.isFile();
                })
                .map((f) => {
                  return this.findOneFaceOrigin(f.name);
                });
            }

            person.validated = await Promise.all(validated);
            person.toValidate = await Promise.all(toValidate);

            resolve(person);
          }
        );
      });
    });
  }

  findOneFaceFullPath(name: string, type: string, face: string) {
    if (type === 'validated') {
      return resolve(join(TRAIN_DIR, name, face));
    } else {
      return resolve(join(TRAIN_DIR, name, 'tovalidate', face));
    }
  }
  findOneFaceSrcFullPath(path: string) {
    return join(TEST_DIR, path);
  }

  async findOneFaceOrigin(face: string): Promise<Face> {
    return new Promise<Face> ( (resolve, reject) => {

    //this.logger.log(`findOneFaceOrigin(${face})`);
    const ret = new Face(face);

    const faceParser = /^(.*)[.]([^ ]*) [(]([0-9]*), ([0-9]*), ([0-9]*), ([0-9]*)[)][.]jpg$/;

    if (!faceParser.test(face)) {
      this.logger.error(`face not correct !!! (${face})`);
      reject();
    } else {
      //console.log(faceParser.exec(face));
      const parts = faceParser.exec(face);
      const names = parts[1].split('_');
      const fileType = parts[2];
      const left = +parts[3];
      const top = +parts[4];
      const right = +parts[5];
      const bottom = +parts[6];

      // let's rebuild original path
      let path = '.';
      let startingIndex = 0;
      let dirFound = true;

      // while dir are found try to find another one (recursivly)
      while (dirFound) {
        dirFound = false;
        // Try to find the longer dir name
        for (
          let endIndex = names.length - 1;
          endIndex > startingIndex;
          endIndex--
        ) {
          // build the dir name
          let dir_name = '';
          for (let index = startingIndex; index < endIndex; index++) {
            dir_name += (index == startingIndex ? '' : '_') + names[index];
          }
          // if dir exists, update path and go on
          if (this.isFileExist(TEST_DIR, join(path, dir_name))) {
            // this.logger.log(`      Exist: '${join(path, dir_name)}' `);
            path = join(path, dir_name);
            startingIndex = endIndex;
            dirFound = true;
            break;
          }
        }
      }
      //this.logger.log(`Dir Found '${path}'`);
      // add the file to be searched
      let file_name = '';
      for (let index = startingIndex; index < names.length; index++) {
        file_name += (index == startingIndex ? '' : '_') + names[index];
      }
      file_name += '.' + fileType;
      //this.logger.log(`File '${join(path, file_name)}'`);

      if (this.isFileExist(TEST_DIR, join(path, file_name))) {

        //this.logger.log(`File found '${join(path, file_name)}'`);
        ret.sourceUrl = encodeURIComponent(join(path, file_name));
        ret.bottom = bottom;
        ret.left = left;
        ret.right = right;
        ret.top = top;

        im(join(TEST_DIR,path, file_name))
        .size((err, size) => {
          if (err) {
            return reject(err);
          }
          ret.width = size.width;
          ret.height = size.height;
           
          resolve(ret);
        })

      } else {
        this.logger.warn(`File not found '${join(path, file_name)}'`);
        resolve(ret);
      }
    }

  });
}

  isFileExist(root: string, path: string): boolean {
    let ret = false;
    try {
      accessSync(join(root, path));
      ret = true;
    } catch (err) {}
    return ret;
  }

  async updateName(id: string, name: string) {
    return new Promise<Person>((resolve, reject) => {
      const fullPath = join(TRAIN_DIR, id);
      stat(fullPath, (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (!stats.isDirectory()) {
          return reject(`${id} not found !!`);
        }
        if (!name || name.length == 0 || new String(name).startsWith('.')) {
          return reject(`'${name}' name is not allowed !!`);
        }

        rename(fullPath, join(TRAIN_DIR, name.toString()), (err) => {
          if (err) {
            return reject(err);
          }
          this.findOne(name.toString())
            .catch((e) => {
              reject(e);
            })
            .then((p) => {
              if (!p) {
                reject('Something go wrong');
              } else {
                resolve(p);
              }
            });
        });
      });
    });
  }

  update(id: number, updatePersonDto: Person) {
    return `This action updates a #${id} person`;
  }

  remove(id: number) {
    return `This action removes a #${id} person`;
  }
}
