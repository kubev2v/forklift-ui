import { Mapping } from './mapping';
import { click } from '../../utils/utils';
import { network } from '../types/constants';
import { menuNavLink } from '../views/mapping.view';

export class MappingNetwork extends Mapping {
  openMenu(): void {
    super.openMenu();

    //Clicking on Network menu item
    click(menuNavLink, network);
  }

  create(): void {
    //Navigating to the sidebar menu
    this.openMenu();

    //Creating new mapping instance
    this.createDialog();
  }

  delete(): void {
    //Navigating to the sidebar menu
    this.openMenu();

    super.delete();
  }
}
