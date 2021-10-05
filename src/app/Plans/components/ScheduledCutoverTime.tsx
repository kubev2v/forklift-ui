import * as React from 'react';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import { IMigration } from '@app/queries/types';
import { formatTimestamp } from '@app/common/helpers';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

interface IScheduledCutoverTimeProps {
  migration: IMigration | null;
}

const ScheduledCutoverTime: React.FunctionComponent<IScheduledCutoverTimeProps> = ({
  migration,
}: IScheduledCutoverTimeProps) => {
  const formattedCutoverTime = migration?.spec.cutover
    ? formatTimestamp(migration.spec.cutover, false)
    : null;
  if (!formattedCutoverTime) return null;
  return (
    <div className={`${text.fontSizeSm} ${alignment.textAlignLeft}`}>
      Scheduled for cutover:
      <br />
      {formattedCutoverTime}
    </div>
  );
};

export default ScheduledCutoverTime;
