import * as React from 'react';
import { Flex, FlexItem, Text } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, ICell, IRow, cellWidth } from '@patternfly/react-table';

import Step from './Step';
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
      transforms: [cellWidth(40)],
    },
    { title: 'Elapsed time', transforms: [cellWidth(20)] },
    { title: 'State' },
  ];

  const rows: IRow[] = vmstatus.pipeline.map((step: IStep, index) => {
    return {
      meta: { step },
      cells: [
        {
          title: (
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              alignContent={{ default: 'alignContentFlexStart' }}
              flexWrap={{ default: 'nowrap' }}
            >
              <FlexItem>
                <Step status={vmstatus} step={step} index={index} />
              </FlexItem>
              <FlexItem>
                <Text>{step.name}</Text>
              </FlexItem>
            </Flex>
          ),
        },
        // TODO Replace with data from API structure
        // step.progress...,
        'hh:mm:ss',
        step.phase,
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
