import { Mapping } from './mapping';
import { clickByText } from '../../utils/utils';
import { storage } from '../types/constants';
import { menuTabLink } from '../views/mapping.view';
import { MappingData } from '../types/types';

export class MappingStorage extends Mapping {
  openMenu(): void {
    super.openMenu();

    //Clicking on Network menu item
    clickByText(menuTabLink, storage);
  }

  create(mappingData: MappingData): void {
    //Navigating to the sidebar menu
    this.openMenu();

    //Clicking on Network menu item
    clickByText(menuTabLink, storage);

    //Creating new mapping instance
    this.createDialog(mappingData);
  }

  delete(mappingData: MappingData): void {
    //Navigating to the sidebar menu
    this.openMenu();

    super.delete(mappingData);
  }

  edit(mappingData: MappingData): void {
    this.openMenu();
    super.edit(mappingData);
  }
}
