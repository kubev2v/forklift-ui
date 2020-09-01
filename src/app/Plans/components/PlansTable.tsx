import * as React from 'react';
import { Plan, IAddPlanDisabledObjModel } from '../types';

interface IPlansTableProps {
  planList: Plan[];
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleAddWizardOpen: () => void;
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  addPlanDisabledObj,
  toggleAddWizardOpen,
}: IPlansTableProps) => {
  return (
    <div className={`test-component test-component-secondary`}>
      <h1 className="heading">Migration Plan table</h1>
    </div>
  );
};

export default PlansTable;
