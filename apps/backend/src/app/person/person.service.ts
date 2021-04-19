import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import {
  readdir,
  stat,
  statSync,
  rename,
  accessSync,
  unlink,
  mkdir,
  rmdirSync,
  mkdirSync,
} from 'fs';
import { dirname, join, resolve } from 'path';
import { Face, Person } from '@face-recognition-editor/data';
import * as gm from 'gm';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';

const im = gm.subClass({ imageMagick: true });

const TRAIN_DIR = process.env.TRAIN_DIR || '/train_dir';
const TEST_DIR = process.env.TEST_DIR || '/test_dir';

interface DbSchema {
  faces: Array<Face>;
};

@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name);
  private db: lowdb.LowdbAsync<DbSchema>;

  constructor(){
    this.initDatabase();
    }
    
    private async initDatabase() {
      const adapter = new FileAsync(join(TRAIN_DIR, "images.json"));
      this.db = await lowdb(adapter);
      this.db.defaults({ faces: [] }).write()
      }
      
          
  /**
   * Find all persons (summaries)
   * @returns
   */
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
            .filter((d) => {
              try {
                rmdirSync(join(TRAIN_DIR, d.name, 'tovalidate'));
              } catch (error) {}
              try {
                rmdirSync(join(TRAIN_DIR, d.name));
              } catch (error) {}
              return this.isFileExist(TRAIN_DIR, d.name);
            })
            .filter((v, i) => {
              return i < 1000000;
            })
            .map((d) => {
              const p = new Person(d.name);
              this.fillDates(p);
              return p;
            })
        );
      });
    });
  }

  /**
   * Find on person (full) by name
   * @param name
   * @returns
   */
  async findOne(name: string): Promise<Person> {
    // console.time('findOne '+name);
    return new Promise<Person>((resolve, reject) => {
      readdir(
        join(TRAIN_DIR, name),
        { withFileTypes: true },
        async (err, files) => {
          if (err) {
            return reject(err);
          }
          const person = new Person(name);
          this.logger.log(name);
          this.fillDates(person);

          let validated = files
            .filter((f) => {
              return f.isFile() && !f.name.startsWith('.');
            })
            .map((f) => {
              return this.findOneFaceOrigin(f.name, true);
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
                    return this.findOneFaceOrigin(f.name, false);
                  });
              }

              person.setValidated(await Promise.all(validated));
              person.setToValidate(await Promise.all(toValidate));

              // console.timeEnd('findOne '+name);
              resolve(person);
            }
          );
        }
      );
    });
  }

  /**
   * Get the full path of a face (the image)
   * @param name
   * @param type
   * @param face
   * @returns
   */
  findOneFaceFullPath(name: string, type: string, face: string): string {
    if (type === 'validated') {
      return resolve(join(TRAIN_DIR, name, face));
    } else {
      return resolve(join(TRAIN_DIR, name, 'tovalidate', face));
    }
  }
  /**
   * get the full path of the source image
   * @param path
   * @returns
   */
  findOneFaceSrcFullPath(path: string): string {
    return join(TEST_DIR, path);
  }

  /**
   * Construct the face object from the face name (the image name)
   * @param face
   * @returns
   */
  async findOneFaceOrigin(face: string, validated: boolean): Promise<Face> {
    // console.time('findOneFaceOrigin '+face);
    return new Promise<Face>((resolve, reject) => {
      // this.logger.log(`findOneFaceOrigin(${face})`);

      const ret = new Face(face, validated);

      // try to find in the db
      // this.logger.log(`Searching : '${face}`);
      const dbFace = this.db.get('faces').find({ url: ret.url }).value();
      if (dbFace) {
        // this.logger.log(`    Found : '${face}`);
        // console.timeEnd('findOneFaceOrigin '+face);
        return resolve(dbFace);
      }
      // this.logger.log(`Not found : '${face}`);


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

          // console.time('imageMagick '+face);
          im(join(TEST_DIR, path, file_name)).size((err, size) => {
            if (err) {
              return reject(err);
            }
            ret.width = size.width;
            ret.height = size.height;

            // console.timeEnd('imageMagick '+face);
            // console.timeEnd('findOneFaceOrigin '+face);
            
            this.db.get('faces').push(ret).write();
            resolve(ret);
          });
        } else {
          this.logger.warn(`File not found '${join(path, file_name)}'`);
          // console.timeEnd('findOneFaceOrigin '+face);
          this.db.get('faces').push(ret).write();
          resolve(ret);
        }
      }
    });
  }

  /**
   * Check if a file exist (exists from fs is deprecated)
   * @param root
   * @param path
   * @returns
   */
  isFileExist(root: string, path: string): boolean {
    let ret = false;
    try {
      accessSync(join(root, path));
      ret = true;
    } catch (err) {}
    return ret;
  }

  /**
   * Update a person (only changing name for now)
   * @param id the old person id
   * @param p the "futur" person
   * @returns
   */
  async updatePerson(id: string, p: Person): Promise<Person> {
    //this.logger.log(`updatePerson('${id}', '${JSON.stringify(p)}')`);
    return new Promise<Person>((resolve, reject) => {
      const fullPath = join(TRAIN_DIR, id);
      stat(fullPath, (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (!stats.isDirectory()) {
          return reject(`${id} not found !!`);
        }

        if (!p) {
          return reject('Cannot update to empty person !!');
        }

        if (!p.name) {
          return resolve(this.findOne(id));
        } else {
          if (p.name.length == 0 || new String(p.name).startsWith('.')) {
            return reject(`'${p.name}' name is not allowed !!`);
          }

          rename(fullPath, join(TRAIN_DIR, p.name.toString()), (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(this.findOne(p.name.toString()));
          });
        }
      });
    });
  }

  /**
   * Update a face (only validate for now)
   * @param name
   * @param type
   * @param face
   * @param f
   * @returns
   */
  async updateFace(
    name: string,
    type: string,
    face: string,
    f: Face
  ): Promise<Person> {
    // console.time('updateFace');
    return new Promise<Person>((resolve, reject) => {
      // this.logger.log(
      //   `updateFace('${name}', '${type}', '${face}', '${JSON.stringify(f)}')`
      // );

      const srcPath = this.findOneFaceFullPath(name, type, face);

      stat(srcPath, async (err, stats) => {
        if (err && err.code === 'ENOENT') {
          // file not found... error
          reject(err);
        } else if (err) {
          reject(err);
        } else if (!stats.isFile()) {
          this.logger.error(`This face is not a file !! '${srcPath}'`);
          reject(`This face is not a file !! '${srcPath}'`);
        } else {
          // face ok... check it
          if (f.validated === undefined) {
            // console.timeEnd('updateFace');
            return resolve(this.findOne(name.toString()));
          }
          if (f.validated && type === 'validated') {
            return reject(
              `Face already validated ('${name}', '${type}', '${face}')`
            );
          }
          if (!f.validated && type === 'notvalidated') {
            return reject(
              `Face already not validated ('${name}', '${type}', '${face}')`
            );
          }

          const trgPath = this.findOneFaceFullPath(
            name,
            f.validated ? 'validated' : 'notvalidated',
            face
          );
          // face ok... move it
          //this.logger.log(`moving '${srcPath}'->'${trgPath}'`);
          try {
            mkdirSync(dirname(trgPath));
          } catch (e) {}
          rename(srcPath, trgPath, async (err) => {
            if (err) {
              return reject(err);
            }
            // console.timeEnd('updateFace');
            return resolve(this.findOne(name.toString()));
          });
        }
      });
    });
  }

  /**
   * Remove a face
   * @param name
   * @param type
   * @param face
   * @returns
   */
  async removeFace(name: string, type: string, face: string): Promise<Person> {
    return new Promise<Person>((resolve, reject) => {
      const path = this.findOneFaceFullPath(name, type, face);

      stat(path, async (err, stats) => {
        if (err && err.code === 'ENOENT') {
          // file not found... do nothing
          const ret = await this.findOne(name);
          resolve(ret);
        } else if (err) {
          reject(err);
        } else if (!stats.isFile()) {
          this.logger.error(`This face is not a file !! '${path}'`);
          reject(`This face is not a file !! '${path}'`);
        } else {
          this.logger.log(`removing '${path}'`);
          unlink(path, async (err) => {
            if (err) {
              return reject(err);
            }
            const ret = await this.findOne(name);
            resolve(ret);
          });
        }
      });
    });
  }

  async moveFace(
    name: string,
    type: string,
    face: string,
    personName: string
  ): Promise<Person> {
    return new Promise<Person>((resolve, reject) => {
      this.logger.log(
        `moveFace('${name}', '${type}', '${face}', '${personName}')`
      );

      const srcPath = this.findOneFaceFullPath(name, type, face);

      stat(srcPath, async (err, stats) => {
        if (err && err.code === 'ENOENT') {
          // file not found... error
          reject(err);
        } else if (err) {
          reject(err);
        } else if (!stats.isFile()) {
          this.logger.error(`This face is not a file !! '${srcPath}'`);
          reject(`This face is not a file !! '${srcPath}'`);
        } else {
          // face ok... check target
          const trgDirPath = join(TRAIN_DIR, personName);
          stat(trgDirPath, (err, stats) => {
            if (err && err.code === 'ENOENT') {
              /// dir do not exist... create it then move your file
              mkdir(trgDirPath, (err) => {
                if (err) {
                  reject(err);
                } else {
                  const trgPath = this.findOneFaceFullPath(
                    personName,
                    'validated',
                    face
                  );
                  rename(srcPath, trgPath, (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      return resolve(this.findOne(name.toString()));
                    }
                  });
                }
              });
            } else if (err) {
              reject(err);
            } else if (!stats.isDirectory()) {
              reject(`This person is not a directory !! '${trgDirPath}'`);
            } else {
              /// everything is ok, move it
              const trgPath = this.findOneFaceFullPath(
                personName,
                'validated',
                face
              );
              rename(srcPath, trgPath, (err) => {
                if (err) {
                  reject(err);
                } else {
                  return resolve(this.findOne(name.toString()));
                }
              });
            }
          });
        }
      });
    });
  }

  fillDates(person: Person) {
    // console.time('fillDates');
    let stats = statSync(join(TRAIN_DIR, person.name));
    person.creationTime = stats.birthtime.getTime();
    person.modificationTime = stats.mtime.getTime();

    try {
      stats = statSync(join(TRAIN_DIR, person.name, 'tovalidate'));
    } catch (error) {}
    if (stats && stats.mtime.getTime() > person.modificationTime) {
      person.modificationTime = stats.mtime.getTime();
    }
    // console.timeEnd('fillDates');
  }
  // sleep(ms) {
  //   return new Promise((resolve) => {
  //     setTimeout(resolve, ms);
  //   });
  // }
}
