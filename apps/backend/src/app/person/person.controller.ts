import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Logger,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { Face, Person } from '@face-recognition-editor/data';
import { Res } from '@nestjs/common';

@Controller('person')
export class PersonController {
  private readonly logger = new Logger(PersonController.name);

  constructor(private readonly personService: PersonService) {}

  /**
   * Get all persons
   * @returns all the persons
   */
  @Get()
  async findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  /**
   * Get a full person (with faces)
   * @param id the person Id
   * @returns the full person
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }
  /**
   * Patch a person
   * @param id id of the person to change
   * @param obj body (containing the new person name or whatever)
   * @returns
   */
  @Patch(':id')
  updatePerson(@Param('id') id: string, @Body() obj: Person) {
    return this.personService.updatePerson(id, obj);
  }

  /**
   * Get the face image
   * @param name the person name
   * @param type the face type (validated, toBeValidate)
   * @param face the face name
   * @param res the http response
   * @returns
   */
  @Get(':name/:type/:face')
  findOneFace(
    @Param('name') name: string,
    @Param('type') type: string,
    @Param('face') face: string,
    @Res() res
  ) {
    const path = this.personService.findOneFaceFullPath(name, type, face);
    return res.sendFile(path);
  }
  /**
   * Patch a face image
   * @param name the person name
   * @param type the face type (validated, toBeValidate)
   * @param face the face name
   * @param res the http response
   * @returns
   */
  @Patch(':name/:type/:face')
  updateFace(
    @Param('name') name: string,
    @Param('type') type: string,
    @Param('face') face: string,
    @Body() obj: { validated: string, personName: string }
  ) {
    if (obj.personName) {
      return this.personService.moveFace(name, type, face, obj.personName);
    } else {
      return this.personService.updateFace(name, type, face, (obj as unknown) as Face);
    }
  }
  /**
   * Get the face source images
   * @param path the path to the source image
   * @param res the http response
   * @returns
   */
  @Get('face_source/:path')
  findOnefaceSrc(@Param('path') path: string, @Res() res) {
    const fullPath = this.personService.findOneFaceSrcFullPath(path);
    return res.sendFile(fullPath);
  }

  /**
   * Delete a face image
   * @param name the person name
   * @param type the face type (validated, toBeValidate)
   * @param face the face name
   * @param res the http response (will receive the modified person)
   * @returns
   */
  @Delete(':name/:type/:face')
  async removeFace(
    @Param('name') name: string,
    @Param('type') type: string,
    @Param('face') face: string
  ) {
    const ret = await this.personService.removeFace(name, type, face);
    return ret;
  }
}
