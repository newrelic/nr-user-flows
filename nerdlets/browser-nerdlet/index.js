import React, { useEffect, useContext, useState } from 'react';
import {
  nerdlet,
  NerdletStateContext,
  Spinner,
  PlatformStateContext
} from 'nr1';
import { generateEntityData } from '../shared/utils';
import AppView from '../shared/components/AppView';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

const UserFlowBrowserNerdlet = () => {
  useEffect(() => {
    nerdlet.setConfig({
      accountPicker: true,
      timePicker: true,
      timePickerRanges: [
        { label: '30 minutes', offset: 1800000 },
        { label: '60 minutes', offset: 3600000 },
        { label: '3 hours', offset: 10800000 },
        { label: '6 hours', offset: 21600000 },
        { label: '12 hours', offset: 43200000 },
        { label: '24 hours', offset: 86400000 },
        { label: '3 days', offset: 259200000 },
        { label: '7 days', offset: 604800000 },
        { label: '10 days', offset: 864000000 }
      ]
    });
  }, []);

  const [entity, setEntity] = useState(null);
  const { entityGuid } = useContext(NerdletStateContext);
  const { timeRange } = useContext(PlatformStateContext);

  useEffect(async () => {
    const timeRangeClause = `SINCE ${timeRange?.duration / 60000} minutes ago`;
    const entityData = await generateEntityData(entityGuid, timeRangeClause);

    setEntity(entityData);
  }, [timeRange]);

  if (entity) {
    return (
      <div>
        <AppView entity={entity} />
      </div>
    );
  }

  return <Spinner />;
};

export default UserFlowBrowserNerdlet;
