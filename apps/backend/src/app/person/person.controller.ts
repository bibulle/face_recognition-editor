import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonService } from './person.service';
import { Person } from '@face-recognition-editor/data';
import { Res } from '@nestjs/common';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createPersonDto: Person) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  async findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.personService.findOne(name);
  }
  @Get(':name/:type/:face')
  findOneImage(@Param('name') name: string, @Param('type') type: string, @Param('face') face: string, @Res() res) {
    const path = this.personService.findOneImagePath(name, type, face); 
    return res.sendFile(path);
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
