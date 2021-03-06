import { Pipe, PipeTransform } from '@angular/core';
import { Group } from '../../../group/http-services/get-group-by-id.service';

@Pipe({ name: 'itemProgressLabel', pure: true })
export class ItemProgressLabelPipe implements PipeTransform {
  transform(watchedGroup?: Group): any {
    if (watchedGroup) {
      return $localize`Situation of ${ watchedGroup.name }`;
    }

    return $localize`Your situation`;
  }
}
