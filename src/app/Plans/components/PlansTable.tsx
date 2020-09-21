import * as React from 'react';
import { IPlan } from '@app/queries/types';

interface IPlansTableProps {
  planList: IPlan[];
  toggleAddWizardOpen: () => void;
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  toggleAddWizardOpen,
}: IPlansTableProps) => {
  return (
    <div className={`test-component test-component-secondary`}>
      <h1 className="heading">Migration Plan table</h1>
    </div>
  );
};

export default PlansTable;
