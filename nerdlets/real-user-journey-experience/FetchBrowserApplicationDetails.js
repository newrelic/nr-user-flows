import React from 'react';
import { NrqlQuery, Stack, StackItem, Tile, HeadingText, BlockText, Spinner } from 'nr1';

export default class FetchBrowserApplicationDetails extends React.Component {
  constructor(appDetails) {
    super(...arguments);

    //console.log("FetchBrowserApplicationDetails.constructor >> " + JSON.stringify(appDetails));

    this.state = {
      application: appDetails
    };

    this.shouldRender = 0;

    this.queryBrwsrInteractionDataAvailableFrom = "FROM BrowserInteraction SELECT earliest(timestamp) WHERE appName = '$BR_APP_NAME$' SINCE 3 months ago";
    //this.queryBrwsrInteractionUniqueCounts = "FROM BrowserInteraction SELECT uniqueCount(browserInteractionId) as uniqIntrctins, uniqueCount(session) as uniqSessions WHERE appName = '$BR_APP_NAME$' SINCE 1 week ago";
    this.queryBrwsrInteractionUniqueCounts = "FROM BrowserInteraction SELECT uniqueCount(browserInteractionId) as uniqIntrctins, uniqueCount(session) as uniqSessions WHERE appName = '$BR_APP_NAME$' $TIME_RANGE$";

  }

  componentWillReceiveProps(newAppDetails) {
    //console.log("FetchBrowserApplicationDetails.componentWillReceiveProps >> " + JSON.stringify(newAppDetails));

    if ((this.state.application == null && newAppDetails)
        || (this.state.application && newAppDetails 
              && (this.state.application.accountId != newAppDetails.accountId 
                    || this.state.application.name != newAppDetails.name || this.state.application.timeRangeClause != newAppDetails.timeRangeClause)
                )) {
      //console.log("FetchBrowserApplicationDetails.componentWillReceiveProps Update >> " + JSON.stringify(newAppDetails));
      this.setState({ application: newAppDetails });
      this.shouldRender = 0;
    }

  }

  shouldComponentUpdate() {
    return (this.shouldRender == 0);
  }

  render() {
    //console.log("FetchBrowserApplicationDetails.render >> " + JSON.stringify(this.state.application));

    let queryBrwsrInteractionDataAvailableFromUpdated = this.queryBrwsrInteractionDataAvailableFrom.replace('$BR_APP_NAME$', this.state.application.name);
    let queryBrwsrInteractionUniqueCountsUpdated = this.queryBrwsrInteractionUniqueCounts.replace('$BR_APP_NAME$', this.state.application.name);
    queryBrwsrInteractionUniqueCountsUpdated = queryBrwsrInteractionUniqueCountsUpdated.replace('$TIME_RANGE$',this.state.application.timeRangeClause);

    //console.log("render query >> " + queryBrwsrInteractionDataAvailableFromUpdated);
    //console.log("render query >> " + queryBrwsrInteractionUniqueCountsUpdated);

    return (
      <React.Fragment>
        <NrqlQuery accountIds={[this.state.application.accountId]} query={queryBrwsrInteractionDataAvailableFromUpdated} formatType={NrqlQuery.FORMAT_TYPE.RAW} >
          {({ loading, data }) => {
            if (loading) {
              return <Spinner />
            }
            if (!loading && data) {
              this.shouldRender = 1;
              //console.log(data.results[0].earliest);
              let displayDate = '--';
              if (data.results[0].earliest) {
                  displayDate = new Date(data.results[0].earliest).toString();
              }

              return (
                <StackItem fullWidth fullHeight >
                  <Tile type={Tile.TYPE.SOLID}>
                    <HeadingText>
                      Data available from:
                    </HeadingText>
                    <BlockText type={BlockText.TYPE.PARAGRAPH} tagType={BlockText.TYPE.DIV} spacingType={[BlockText.SPACING_TYPE.LARGE]}>
                      {displayDate}
                    </BlockText>
                  </Tile>
                </StackItem>
              )
            } else {
              this.shouldRender = 1;
              return <span></span>
            }
          }}
        </NrqlQuery>
        <NrqlQuery accountIds={[this.state.application.accountId]} query={queryBrwsrInteractionUniqueCountsUpdated} formatType={NrqlQuery.FORMAT_TYPE.RAW} >
          {({ loading, data }) => {
            if (loading) {
              return <Spinner inline />
            }
            if (!loading && data) {
              this.shouldRender = 2;
              return (
                <React.Fragment>
                  <StackItem fullWidth fullHeight >
                    <Tile type={Tile.TYPE.SOLID}>
                      <HeadingText>
                        Number of Unique Browser Interactions
                      </HeadingText>
                      <BlockText type={BlockText.TYPE.PARAGRAPH} tagType={BlockText.TYPE.DIV} spacingType={[BlockText.SPACING_TYPE.LARGE]}>
                        {data.results[0].uniqueCount}
                      </BlockText>
                    </Tile>
                  </StackItem>
                  <StackItem fullWidth fullHeight >
                    <Tile type={Tile.TYPE.SOLID}>
                      <HeadingText>
                        Number of Unique Browser Sessions
                      </HeadingText>
                      <BlockText type={BlockText.TYPE.PARAGRAPH} tagType={BlockText.TYPE.DIV} spacingType={[BlockText.SPACING_TYPE.LARGE]}>
                        {data.results[1].uniqueCount}
                      </BlockText>
                    </Tile>
                  </StackItem>
                </React.Fragment>
                )
            } else {
              this.shouldRender = 2;
              return <span></span>
            }
          }}
        </NrqlQuery>
      </React.Fragment>
    )

  }
}
