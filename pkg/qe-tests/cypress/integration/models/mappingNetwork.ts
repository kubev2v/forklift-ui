import { Mapping } from './mapping';
import { clickByText } from '../../utils/utils';
import { network } from '../types/constants';
import { menuTabLink } from '../views/mapping.view';
import { MappingData } from '../types/types';

export class MappingNetwork extends Mapping {
  protected openMenu(): void {
    super.openMenu();
    //Clicking on Network menu item
    clickByText(menuTabLink, network);
  }

  create(mappingData: MappingData): void {
    //Navigating to the sidebar menu
    this.openMenu();

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
