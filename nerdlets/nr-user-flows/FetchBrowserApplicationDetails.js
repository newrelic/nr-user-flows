import React, { useState, useEffect } from 'react';
import {
  NrqlQuery,
  StackItem,
  Tile,
  HeadingText,
  BlockText,
  Spinner
} from 'nr1';

const FetchBrowserApplicationDetails = ({
  name,
  accountId,
  timeRangeClause
}) => {
  const [application, setApplication] = useState({
    name,
    accountId,
    timeRangeClause
  });

  useEffect(() => {
    setApplication({ name, accountId, timeRangeClause });
  }, [name, accountId, timeRangeClause]);

  const queryBrwsrInteractionDataAvailableFrom = `FROM BrowserInteraction SELECT earliest(timestamp) WHERE appName = '$BR_APP_NAME$' SINCE 3 months ago`;
  const queryBrwsrInteractionUniqueCounts = `FROM BrowserInteraction SELECT uniqueCount(browserInteractionId) as uniqIntrctins, uniqueCount(session) as uniqSessions WHERE appName = '$BR_APP_NAME$' $TIME_RANGE$`;

  const queryBrwsrInteractionDataAvailableFromUpdated = queryBrwsrInteractionDataAvailableFrom.replace(
    '$BR_APP_NAME$',
    application.name
  );
  const queryBrwsrInteractionUniqueCountsUpdated = queryBrwsrInteractionUniqueCounts
    .replace('$BR_APP_NAME$', application.name)
    .replace('$TIME_RANGE$', application.timeRangeClause);

  return (
    <React.Fragment>
      <NrqlQuery
        accountIds={[application.accountId]}
        query={queryBrwsrInteractionDataAvailableFromUpdated}
        formatType={NrqlQuery.FORMAT_TYPE.RAW}
      >
        {({ loading, data }) => {
          if (loading) return <Spinner />;
          if (!loading && data) {
            let displayDate = '--';
            if (data.results[0].earliest) {
              displayDate = new Date(data.results[0].earliest).toString();
            }
            return (
              <StackItem fullWidth fullHeight>
                <Tile type={Tile.TYPE.SOLID}>
                  <HeadingText>Data available from:</HeadingText>
                  <BlockText
                    type={BlockText.TYPE.PARAGRAPH}
                    tagType={BlockText.TYPE.DIV}
                    spacingType={[BlockText.SPACING_TYPE.LARGE]}
                  >
                    {displayDate}
                  </BlockText>
                </Tile>
              </StackItem>
            );
          } else {
            return <span />;
          }
        }}
      </NrqlQuery>
      <NrqlQuery
        accountIds={[application.accountId]}
        query={queryBrwsrInteractionUniqueCountsUpdated}
        formatType={NrqlQuery.FORMAT_TYPE.RAW}
      >
        {({ loading, data }) => {
          if (loading) return <Spinner inline />;
          if (!loading && data) {
            return (
              // eslint-disable-next-line react/jsx-fragments
              <React.Fragment>
                <StackItem fullWidth fullHeight>
                  <Tile type={Tile.TYPE.SOLID}>
                    <HeadingText>
                      Number of Unique Browser Interactions
                    </HeadingText>
                    <BlockText
                      type={BlockText.TYPE.PARAGRAPH}
                      tagType={BlockText.TYPE.DIV}
                      spacingType={[BlockText.SPACING_TYPE.LARGE]}
                    >
                      {data.results[0].uniqueCount}
                    </BlockText>
                  </Tile>
                </StackItem>
                <StackItem fullWidth fullHeight>
                  <Tile type={Tile.TYPE.SOLID}>
                    <HeadingText>Number of Unique Browser Sessions</HeadingText>
                    <BlockText
                      type={BlockText.TYPE.PARAGRAPH}
                      tagType={BlockText.TYPE.DIV}
                      spacingType={[BlockText.SPACING_TYPE.LARGE]}
                    >
                      {data.results[1].uniqueCount}
                    </BlockText>
                  </Tile>
                </StackItem>
              </React.Fragment>
            );
          } else {
            return <span />;
          }
        }}
      </NrqlQuery>
    </React.Fragment>
  );
};

export default FetchBrowserApplicationDetails;
