import * as React from 'react';
import { Text, TextContent } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  textCenter,
  fitContent,
} from '@patternfly/react-table';

import { IVMStatus } from '@app/queries/types';
import TickingElapsedTime from '@app/common/components/TickingElapsedTime';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

interface IVMStatusPrecopyTableProps {
  status: IVMStatus;
  isCanceled: boolean;
}

const VMStatusPrecopyTable: React.FunctionComponent<IVMStatusPrecopyTableProps> = ({
  status,
  isCanceled,
}: IVMStatusPrecopyTableProps) => {
  if (!status.warm || status.warm.precopies.length === 0) {
    return (
      <TextContent>
        <Text component="p">Preparing to start incremental copies</Text>
      </TextContent>
    );
  }

  const sortedPrecopies = status.warm.precopies.sort((a, b) => {
    // Most recent first
    if (a.start < b.start) return 1;
    if (a.start > b.start) return -1;
    return 0;
  });

  const columns: ICell[] = [
    {
      title: 'Copy number',
      columnTransforms: [textCenter, fitContent],
    },
    { title: 'Elapsed time' },
    { title: 'Status' },
  ];

  const rows: IRow[] = sortedPrecopies.map((precopy, index) => {
    return {
      meta: { precopy },
      cells: [
        sortedPrecopies.length - index,
        {
          title: <TickingElapsedTime start={precopy.start} end={precopy.end || status.completed} />,
        },
        {
          title: precopy.end ? (
            <StatusIcon status={StatusType.Ok} label="Complete" />
          ) : status.error && index === 0 ? (
            <StatusIcon status={StatusType.Error} label="Failed" />
          ) : isCanceled ? (
            <StatusIcon status={StatusType.Info} label="Canceled" />
          ) : (
            <StatusIcon status={StatusType.Loading} label="Copying data" />
          ),
        },
      ],
    };
  });

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

export default VMStatusPrecopyTable;
