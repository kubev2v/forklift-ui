import * as React from 'react';
import { Flex, Text } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, ICell, IRow, cellWidth } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { ResourcesAlmostFullIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { IVMStatus, IStep } from '@app/queries/types';

interface IVMStatusTableProps {
  vmstatus: IVMStatus;
}

const VMStatusTable: React.FunctionComponent<IVMStatusTableProps> = ({
  vmstatus,
}: IVMStatusTableProps) => {
  const columns: ICell[] = [
    {
      title: 'Step',
      transforms: [cellWidth(35)],
    },
    { title: 'Elapsed time', transforms: [cellWidth(20)] },
    { title: 'State', transforms: [cellWidth(30)] },
    { title: '' },
  ];

  const rows: IRow[] = vmstatus.pipeline.map((step: IStep) => {
    return {
      meta: { step },
      cells: [
        {
          title: (
            <Flex>
              <ResourcesAlmostFullIcon className={spacing.mlSm} height="0.8em" width="0.8em" />
              <Text>{step.name}</Text>
            </Flex>
          ),
        },
        step.progress,
        step.phase,
        {
          title: <Link to={'#'}>View pod log</Link>,
        },
      ],
    };
  });

  return (
    <>
      <Table
        className="migration-inner-vmstatus-table"
        variant="compact"
        aria-label={`VM status table for migration plan`}
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </>
  );
};

export default VMStatusTable;
