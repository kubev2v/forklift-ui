import * as React from 'react';
import { Button, Flex, FlexItem, Popover, Text } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  cellWidth,
  truncate,
} from '@patternfly/react-table';

import Step from './Step';
import { IVMStatus, IStep } from '@app/queries/types';
import TickingElapsedTime from '@app/common/components/TickingElapsedTime';
import { getStepType, isStepOnError } from '@app/common/helpers';

interface IVMStatusTableProps {
  status: IVMStatus;
}

const VMStatusTable: React.FunctionComponent<IVMStatusTableProps> = ({
  status,
}: IVMStatusTableProps) => {
  const columns: ICell[] = [
    {
      title: 'Step',
      transforms: [cellWidth(40)],
    },
    { title: 'Elapsed time', transforms: [cellWidth(20)] },
    { title: 'State', cellTransforms: [truncate] },
  ];

  const rows: IRow[] = status.pipeline.map((step: IStep, index) => ({
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
              <Step type={getStepType(status, index)} error={isStepOnError(status, index)} />
            </FlexItem>
            <FlexItem>
              <Text>{step.description ? step.description.replace(/\.$/, '') : ''}</Text>
            </FlexItem>
          </Flex>
        ),
      },
      {
        title: <TickingElapsedTime start={step.started} end={step.completed} />,
      },
      {
        title: step.error ? (
          <Popover headerContent={step.phase} bodyContent={step.error?.reasons}>
            <Button variant="link" isInline>
              {step.phase}
            </Button>
          </Popover>
        ) : (
          step.phase
        ),
      },
    ],
  }));

  return (
    <>
      <Table
        className="migration-inner-vmStatus-table"
        variant="compact"
        aria-label="VM status table for migration plan"
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
