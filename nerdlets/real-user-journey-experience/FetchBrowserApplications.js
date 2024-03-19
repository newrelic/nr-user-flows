import React, { useState, useEffect } from 'react';
import {
  PlatformStateContext,
  EntitiesByNameQuery,
  NrqlQuery,
  Dropdown,
  DropdownItem,
  Stack,
  StackItem,
  Grid,
  GridItem,
  Tile,
  HeadingText,
  BlockText,
  Spinner
} from 'nr1';
import FetchBrowserApplicationDetails from './FetchBrowserApplicationDetails';
import FetchBrowserInteractionAsFlowAnalysisGraph from './FetchBrowserInteractionAsFlowAnalysisGraph';

const FetchBrowserApplications = () => {
  const [fetchingEntities, setFetchingEntities] = useState(true);
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState([]);
  const [selectedAppName, setSelectedAppName] = useState('Search an entity');
  const [selectedApp, setSelectedApp] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [timeRange, setTimeRange] = useState(null);
  const maxLimit = 5;

  const TOP_INTERACTIONS_QUERY = `FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category = 'Initial page load' AND previousUrl = targetUrl $TIME_RANGE$ LIMIT ${maxLimit}`;

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const subscription = PlatformStateContext.subscribe(platformState => {
      if (accountId !== platformState.accountId) {
        setAccountId(platformState.accountId);
      }
      if (timeRange !== platformState.timeRange.duration) {
        setTimeRange(platformState.timeRange.duration);
      }
    });

    getEntitiesByName(accountId);
  }, [accountId, timeRange]);

  const getEntitiesByName = accountId => {
    if (accountId) {
      // eslint-disable-next-line no-console
      // console.log('Fetching entities for', accountId);
      setFetchingEntities(true);
      const entityTypeFilter = [
        {
          type: 'entityType',
          value: { domain: 'BROWSER', type: 'APPLICATION' }
        },
        {
          type: 'tag',
          value: { key: 'accountId', value: accountId }
        }
      ];

      EntitiesByNameQuery.query({
        name: `%`,
        filters: entityTypeFilter,
        sortType: [EntitiesByNameQuery.SORT_TYPE.NAME]
      }).then(({ data }) => {
        setFetchingEntities(false);
        setApps(data.entities);
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const manageSelectedBrowserApplication = (clickedItem, _clickEvt) => {
    setSelectedAppName(clickedItem.name);
    setSelectedApp(clickedItem);
    setAccountId(clickedItem.accountId);
  };

  let selectedAppDetails = selectedApp;

  const mainGridCSSStyle = {
    marginLeft: '0px'
  };

  let topInteractionsQueryWithAppName = TOP_INTERACTIONS_QUERY.replace(
    '$BR_APP_NAME$',
    selectedApp?.name ?? ''
  );
  const timeRangeClause = `SINCE ${timeRange / 60000} minutes ago`;
  topInteractionsQueryWithAppName = topInteractionsQueryWithAppName.replace(
    '$TIME_RANGE$',
    timeRangeClause
  );
  selectedAppDetails = { ...selectedAppDetails, timeRangeClause };

  const filteredApps = apps.filter(({ name }) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Grid
      style={mainGridCSSStyle}
      gapType={Grid.GAP_TYPE.MEDIUM}
      spacingType={[Grid.SPACING_TYPE.SMALL]}
      fullWidth
      fullHeight
    >
      <GridItem columnSpan={12}>
        <Stack
          gapType={Stack.GAP_TYPE.EXTRA_LARGE}
          horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
          fullWidth
          fullHeight
        >
          <StackItem fullWidth fullHeight>
            <Tile type={Tile.TYPE.SOLID}>
              <HeadingText>Select a browser application</HeadingText>
              <BlockText
                type={BlockText.TYPE.PARAGRAPH}
                tagType={BlockText.TYPE.DIV}
                spacingType={[BlockText.SPACING_TYPE.LARGE]}
              >
                {fetchingEntities ? (
                  'Fetching Entities...'
                ) : (
                  <Dropdown
                    title={selectedAppName}
                    ariaLabel="Select a browser application"
                    iconType={
                      Dropdown.ICON_TYPE
                        .HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER
                    }
                    items={filteredApps}
                    search={search}
                    onSearch={searchStr => setSearch(searchStr.target.value)}
                  >
                    {({ item }) => (
                      <DropdownItem
                        onClick={evt =>
                          manageSelectedBrowserApplication(item, evt)
                        }
                        key={item.guid}
                      >
                        {item.name}
                      </DropdownItem>
                    )}
                  </Dropdown>
                )}
              </BlockText>
            </Tile>
          </StackItem>
        </Stack>
      </GridItem>
      {selectedApp && (
        <>
          <GridItem columnSpan={12}>
            <Stack
              gapType={Stack.GAP_TYPE.LARGE}
              horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
              fullWidth
              fullHeight
            >
              <FetchBrowserApplicationDetails {...selectedAppDetails} />
            </Stack>
          </GridItem>
          <NrqlQuery
            accountIds={[accountId]}
            query={topInteractionsQueryWithAppName}
            formatType={NrqlQuery.FORMAT_TYPE.RAW}
          >
            {({ loading, data }) => {
              if (loading) return <Spinner inline />;
              if (!loading && data) {
                const browserInteractions = data.facets.map(
                  (facetInfo, indx) => ({
                    id: `A${indx}`,
                    browserInteractionName: facetInfo.name[0],
                    urlDomain: facetInfo.name[1],
                    category: facetInfo.name[2],
                    trigger: facetInfo.name[3],
                    uniqueSessionCount: facetInfo.results[0].uniqueCount,
                    avgDuration: facetInfo.results[1].average,
                    applicationDetails: selectedApp,
                    timeRangeClause: timeRangeClause
                  })
                );

                const journeyGridItemCSSStyle = {
                  outlineWidth: 'thin',
                  borderRadius: '25px',
                  margin: '10px',
                  padding: '10px'
                };

                if (browserInteractions.length === 0) {
                  return (
                    <GridItem columnSpan={12}>
                      <BlockText
                        type={BlockText.TYPE.PARAGRAPH}
                        tagType={BlockText.TYPE.DIV}
                        spacingType={[BlockText.SPACING_TYPE.LARGE]}
                      >
                        There are no user journeys to display
                      </BlockText>
                    </GridItem>
                  );
                } else {
                  return (
                    <>
                      {browserInteractions.map(browserInteraction => (
                        <GridItem
                          columnSpan={12}
                          style={journeyGridItemCSSStyle}
                          key={browserInteraction.id}
                        >
                          <FetchBrowserInteractionAsFlowAnalysisGraph
                            {...browserInteraction}
                          />
                        </GridItem>
                      ))}
                    </>
                  );
                }
              } else {
                return <></>;
              }
            }}
          </NrqlQuery>
        </>
      )}
    </Grid>
  );
};

export default FetchBrowserApplications;
