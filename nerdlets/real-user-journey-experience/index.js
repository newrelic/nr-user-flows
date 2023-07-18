import React, { Fragment } from 'react';
import { 
  nerdlet,
  PlatformStateContext,
 } from 'nr1';
import FetchBrowserApplications from './FetchBrowserApplications';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class RealUserJourneyExperienceNerdlet extends React.Component {
  constructor() {
    super(...arguments);

    nerdlet.setConfig({
      accountPicker: true,
      //marking time picker as false. All queries are hardcoded to since 10 days ago.
      timePicker: false,
      timePickerRanges: [
        { label: "30 minutes", offset: 1800000 }, 
        { label: "60 minutes", offset: 3600000 }, 
        { label: "3 hours", offset: 10800000 }, 
        { label: "6 hours", offset: 21600000 }, 
        { label: "12 hours", offset: 43200000 }, 
        { label: "24 hours", offset: 86400000 }, 
        { label: "3 days", offset: 259200000 }, 
        { label: "7 days", offset: 604800000 }
        ]
    });

  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    //console.log("RealUserJourneyExperienceNerdlet.render >> ");

    /*
    return (
      <div>
        <h4>Select an Account and browser application to view the real user journey flow</h4>
        <FetchBrowserApplications />
      </div>
    );
    */

    return (
      <div>
        <h4>Select an <b>Account</b> and a <b>browser application</b> to view the real user journey flow</h4>
        <PlatformStateContext.Consumer>
          {(platformState) => {
            if (platformState.accountId == 'cross-account') {
              return (<span></span>)
            } else {
              return (
                    <FetchBrowserApplications />
              )
            }
          }}
        </PlatformStateContext.Consumer>
      </div>
    );

  }
}
