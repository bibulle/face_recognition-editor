import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PersonService } from './person.service';
import { Person } from '@face-recognition-editor/data';
import { Res } from '@nestjs/common';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  async findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }
  @Get(':name/:type/:face')
  findOneImage(@Param('name') name: string, @Param('type') type: string, @Param('face') face: string, @Res() res) {
    const path = this.personService.findOneFaceFullPath(name, type, face); 
    return res.sendFile(path);
  }
  @Get('face_source/:path')
  findOnefaceSrc(@Param('path') path: string, @Res() res) {
    const fullPath = this.personService.findOneFaceSrcFullPath(path); 
    return res.sendFile(fullPath);
  }

  @Put(':id/rename')
  updateName(@Param('id') id: string, @Body() obj: {name: string} ) {
    return this.personService.updateName(id, obj.name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonDto: Person) {
    return this.personService.update(+id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(+id);
  }
}
