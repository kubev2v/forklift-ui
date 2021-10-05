import * as React from 'react';
import ConfirmModal, { IConfirmModalProps } from '@app/common/components/ConfirmModal';
import { IPlan } from '@app/queries/types';
import {
  TextContent,
  Text,
  Radio,
  InputGroup,
  DatePicker,
  TimePicker,
  isValidDate,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IMigrateOrCutoverConfirmModalProps
  extends Pick<IConfirmModalProps, 'isOpen' | 'toggleOpen' | 'mutateResult'> {
  plan: IPlan;
  action: 'start' | 'restart' | 'cutover';
  doMigrateOrCutover: (cutover?: string) => void;
}

const MigrateOrCutoverConfirmModal: React.FunctionComponent<IMigrateOrCutoverConfirmModalProps> = ({
  isOpen,
  toggleOpen,
  doMigrateOrCutover,
  mutateResult,
  plan,
  action,
}: IMigrateOrCutoverConfirmModalProps) => {
  const verb = action === 'cutover' ? 'Schedule' : action === 'restart' ? 'Restart' : 'Start';
  const noun =
    action === 'cutover' ? 'cutover' : plan.spec.warm ? 'incremental copies' : 'migration';

  const [cutoverScheduleMode, setCutoverScheduleMode] = React.useState<'now' | 'later'>('now');
  const [cutoverDay, setCutoverDay] = React.useState<Date | null>(null);
  const [cutoverTime, setCutoverTime] = React.useState<{ hour: number; minute: number } | null>(
    null
  );

  let cutoverDate: Date | null = null;
  if (cutoverDay !== null && cutoverTime !== null) {
    cutoverDate = new Date(cutoverDay);
    cutoverDate.setHours(cutoverTime.hour);
    cutoverDate.setMinutes(cutoverTime.minute);
  }

  let cutoverDateInvalidReason: string | null = null;
  if (cutoverDate && new Date().getTime() > cutoverDate.getTime()) {
    cutoverDateInvalidReason = 'Cutover time must be in the future';
  }

  return (
    <ConfirmModal
      variant={action === 'cutover' ? 'medium' : 'small'}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      mutateFn={() =>
        doMigrateOrCutover(
          action === 'cutover' && cutoverDate ? cutoverDate.toISOString() : undefined
        )
      }
      mutateResult={mutateResult}
      title={`${verb} ${noun}?`}
      confirmButtonDisabled={
        cutoverScheduleMode === 'later' && (!cutoverDate || !!cutoverDateInvalidReason)
      }
      body={
        <>
          <TextContent>
            <Text>
              {verb} the {noun} for plan &quot;
              {plan.metadata.name}&quot;?
            </Text>
            <Text>
              {action === 'cutover'
                ? 'You can start cutover immediately or schedule cutover for a future date and time. VMs included in the migration plan will be shut down when cutover starts.'
                : !plan.spec.warm
                ? `VMs included in the migration plan will be shut down.`
                : 'VM data will be copied incrementally until cutover migration. To start cutover, click the button on the Plans page.'}{' '}
              See the product documentation for more information.
            </Text>
          </TextContent>
          {action === 'cutover' ? (
            <div className={`${spacing.mtLg} ${spacing.mlMd}`}>
              <Radio
                id="cutover-schedule-now"
                name="cutover-schedule"
                label="Start cutover now"
                isChecked={cutoverScheduleMode === 'now'}
                onChange={() => {
                  setCutoverScheduleMode('now');
                  setCutoverDay(null);
                  setCutoverTime(null);
                }}
                className={spacing.mbSm}
              />
              <Radio
                id="cutover-schedule-later"
                name="cutover-schedule"
                label="Schedule cutover for later"
                isChecked={cutoverScheduleMode === 'later'}
                onChange={() => setCutoverScheduleMode('later')}
                className={spacing.mbSm}
                description={
                  cutoverScheduleMode === 'later' ? (
                    <>
                      <InputGroup className={spacing.mtSm}>
                        <DatePicker
                          onChange={(_inputDate, newDate) => {
                            if (newDate && isValidDate(newDate)) {
                              setCutoverDay(newDate);
                            } else {
                              setCutoverDay(null);
                            }
                          }}
                          aria-label="Start date"
                          placeholder="YYYY-MM-DD"
                          appendTo={document.querySelector('body') as HTMLElement}
                        />
                        <TimePicker
                          aria-label="Start time"
                          style={{ width: '150px' }}
                          onChange={(_time, hour, minute) => {
                            if ((hour || hour === 0) && (minute || minute === 0)) {
                              setCutoverTime({ hour, minute });
                            } else {
                              setCutoverTime(null);
                            }
                          }}
                          menuAppendTo={document.querySelector('body') as HTMLElement}
                        />
                      </InputGroup>
                      {cutoverDateInvalidReason ? (
                        <div
                          className={`${spacing.mtXs} pf-c-date-picker__helper-text pf-m-error pf-u-danger-color-100`}
                        >
                          {cutoverDateInvalidReason}
                        </div>
                      ) : null}
                    </>
                  ) : null
                }
              />
            </div>
          ) : null}
        </>
      }
      confirmButtonText={
        action === 'cutover'
          ? cutoverScheduleMode === 'now'
            ? 'Cutover'
            : 'Schedule cutover'
          : verb
      }
      errorText={`Could not ${verb.toLowerCase()} ${noun}`}
    />
  );
};

export default MigrateOrCutoverConfirmModal;
