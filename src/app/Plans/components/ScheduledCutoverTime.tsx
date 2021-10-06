import * as React from 'react';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import { IMigration } from '@app/queries/types';
import { formatTimestamp } from '@app/common/helpers';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

interface IScheduledCutoverTimeProps {
  migration: IMigration | null;
}

export const ScheduledCutoverTime: React.FunctionComponent<IScheduledCutoverTimeProps> = ({
  migration,
}: IScheduledCutoverTimeProps) => {
  if (!migration?.spec.cutover) return null;
  const formattedCutoverTime = formatTimestamp(migration.spec.cutover, false);
  return (
    <div className={`${text.fontSizeSm} ${alignment.textAlignLeft}`}>
      Scheduled for cutover:
      <br />
      <time dateTime={migration.spec.cutover}>{formattedCutoverTime}</time>
    </div>
  );
};
