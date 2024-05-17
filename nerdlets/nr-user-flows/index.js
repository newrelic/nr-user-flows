import React, { useEffect, useContext, useMemo } from 'react';
import { nerdlet, PlatformStateContext } from 'nr1';
import FetchBrowserApplications from './FetchBrowserApplications';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

const RealUserJourneyExperienceNerdlet = () => {
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

  const platformState = useContext(PlatformStateContext);

  return useMemo(() => {
    return (
      <div
        style={{
          margin: '3px',
          fontSize: '14px'
        }}
      >
        <h4>
          Select an <b>Account</b> and a <b>browser application</b> to view the
          real user flows.
        </h4>
        <br />
        <div>
          This application displays user flows from top 5 landing pages. The
          flows are derived from browser real user monitoring data.
        </div>
        <br />
        {platformState.accountId !== 'cross-account' && (
          <FetchBrowserApplications />
        )}
      </div>
    );
  }, [platformState.accountId]);
};

export default RealUserJourneyExperienceNerdlet;
