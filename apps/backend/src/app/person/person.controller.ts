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
import { Person } from '@face-recognition-editor/data';
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
   * Get the face image
   * @param name the person name
   * @param type the face type (validated, toBeValidate)
   * @param face the face name
   * @param res the http response
   * @returns
   */
  @Get(':name/:type/:face')
  findOneImage(
    @Param('name') name: string,
    @Param('type') type: string,
    @Param('face') face: string,
    @Res() res
  ) {
    const path = this.personService.findOneFaceFullPath(name, type, face);
    return res.sendFile(path);
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
   * Rename the person
   * @param id id of the person to change
   * @param obj body (containing the new person name)
   * @returns
   */
  @Put(':id/rename')
  updateName(@Param('id') id: string, @Body() obj: { name: string }) {
    return this.personService.updateName(id, obj.name);
  }
  // /**
  //  * Modify a person
  //  * @param id
  //  * @param updatePersonDto
  //  * @returns
  //  */
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePersonDto: Person) {
  //   return this.personService.update(+id, updatePersonDto);
  // }

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
