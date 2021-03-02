import { Mapping } from './mapping';
import { clickByText } from '../../utils/utils';
import { storage } from '../types/constants';
import { menuNavLink } from '../views/mapping.view';
import { MappingData } from '../types/types';

export class MappingStorage extends Mapping {
  openMenu(): void {
    super.openMenu();

    //Clicking on Network menu item
    clickByText(menuNavLink, storage);
  }

  create(mappingData: MappingData): void {
    //Navigating to the sidebar menu
    this.openMenu();

    //Clicking on Network menu item
    clickByText(menuNavLink, storage);

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
