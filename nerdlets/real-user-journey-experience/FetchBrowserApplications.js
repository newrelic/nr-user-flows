import React from 'react';
import { 
  PlatformStateContext,
  EntitiesByNameQuery, NrqlQuery,
  Dropdown, DropdownItem,
  Stack, StackItem, Grid, GridItem,
  Tile, HeadingText, BlockText, Spinner
 } from 'nr1';
import FetchBrowserApplicationDetails from './FetchBrowserApplicationDetails';
import FetchBrowserInteractionAsFlowAnalysisGraph from './FetchBrowserInteractionAsFlowAnalysisGraph';

export default class FetchBrowserApplications extends React.Component {
  constructor() {
    super(...arguments);

    PlatformStateContext.subscribe((platformState) => {
      //console.log("platformState.accountId >> " + platformState.accountId);
      //console.log("platformState >> " + JSON.stringify(platformState));
      this.setState({ accountId: platformState.accountId});
      this.setState({ timeRange: platformState.timeRange.duration});
    });

    this.shouldRender = 0;
    /*
    For some unknown reason (may be async nature), NrqlQuery triggers the execution of code inside (!loading && data) if condition 
    - once when the query execution is initiated
    - and again when the query returns results.
    This counter is initiated when ever there is a change to the query and the first execution is ignored.
    Only after the second execution the browser interaction graphs are plotted.
    Hope this explanation makes sense to the person reading, if not uncomment the console logs and check for yourself on your local machine
    */
    this.asyncCount = 0;

    this.state = {
      search: '',
      apps: [],
      selectedAppName: 'Search an entity',
      selectedApp:null,
    };

    //this.TOP_INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category = 'Initial page load' AND previousUrl = targetUrl SINCE 1 week ago LIMIT 5";
    this.TOP_INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category = 'Initial page load' AND previousUrl = targetUrl $TIME_RANGE$ LIMIT 5";

  }

  shouldComponentUpdate() {
    return (this.shouldRender == 0);
  }

  componentWillReceiveProps() {

    PlatformStateContext.subscribe((platformState) => {
        //console.log("platformState.accountId >> " + platformState.accountId);
        //console.log("platformState >> " + JSON.stringify(platformState));
        if (this.state.accountId != null && this.state.accountId != platformState.accountId) {
            this.setState({ accountId: platformState.accountId});
            this.shouldRender = 0;
            this.asyncCount = 2;
        }

        if (this.state.timeRange != null && this.state.timeRange != platformState.timeRange.duration) {
            //console.log("duration change >> ");
            this.setState({ timeRange: platformState.timeRange.duration});
            this.shouldRender = 0;
            this.asyncCount = 2;
        }
    });

  }

  getEntitiesByName(searchName) {
    const entityTypeFilter = [
      {
        type: 'entityType',
        value: { domain: 'BROWSER', type: 'APPLICATION' }
      },
      {
        type: 'tag',
        value: { key: 'accountId', value: this.state.accountId }
      }
    ];

    EntitiesByNameQuery.query({
      name: searchName,
      filters: entityTypeFilter,
      sortType: [EntitiesByNameQuery.SORT_TYPE.NAME]
      }).then(({ data }) =>  this.setState({ apps: data.entities }) )

  }

  manageSelectedBrowserApplication(clickedItem, clickEvt) {
    //console.log('FetchBrowserApplications.manageSelectedBrowserApplication >> ' + JSON.stringify(clickedItem));
    this.shouldRender = 0;
    if (this.state.selectedApp) {
      this.asyncCount = 2;
    } else {
      this.asyncCount = 1;
    }
    this.setState({ selectedAppName: clickEvt.target.textContent });
    this.setState({ selectedApp: clickedItem });
    this.setState({ accountId: clickedItem.accountId });

  }

  render() {
    const { search, apps } = this.state;
    this.getEntitiesByName(search);

    var selectedAppDetails = this.state.selectedApp;
    //console.log(selectedAppDetails);

    const mainGridCSSStyle = {
        marginLeft: '0px',
    };

    if (selectedAppDetails) {
        let topInteractionsQueryWithAppName = this.TOP_INTERACTIONS_QUERY.replace('$BR_APP_NAME$',selectedAppDetails.name);
        let timeRangeClause = 'SINCE ' + (this.state.timeRange)/60000 + ' minutes ago';
        topInteractionsQueryWithAppName = topInteractionsQueryWithAppName.replace('$TIME_RANGE$',timeRangeClause);
        //console.log('topInteractionsQueryWithAppName >> ' + topInteractionsQueryWithAppName);
        selectedAppDetails.timeRangeClause = timeRangeClause;

        return (
          <Grid style={mainGridCSSStyle} gapType={Grid.GAP_TYPE.MEDIUM} spacingType={[Grid.SPACING_TYPE.SMALL]} fullWidth fullHeight>
            <GridItem columnSpan={12}>
              <Stack gapType={Stack.GAP_TYPE.EXTRA_LARGE} horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY} fullWidth fullHeight >
                <StackItem fullWidth fullHeight >
                  <Tile type={Tile.TYPE.SOLID} >
                    <HeadingText>
                      Select a browser application
                    </HeadingText>
                    <BlockText type={BlockText.TYPE.PARAGRAPH} tagType={BlockText.TYPE.DIV} spacingType={[BlockText.SPACING_TYPE.LARGE]} >
                      <Dropdown
                        title={this.state.selectedAppName}
                        ariaLabel="Select a browser application"
                        iconType={Dropdown.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER}
                        items={apps} search={search}
                        onSearch={(searchStr) => this.setState({ search: searchStr.target.value })} >
                          { ({ item }) => <DropdownItem onClick={(evt) => this.manageSelectedBrowserApplication(item, evt)} key={item.guid}>{item.name}</DropdownItem> }
                      </Dropdown>
                    </BlockText>
                  </Tile>
                </StackItem>
              </Stack>
            </GridItem>
            <GridItem columnSpan={12}>
              <Stack gapType={Stack.GAP_TYPE.LARGE} horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY} fullWidth fullHeight >
                <FetchBrowserApplicationDetails {...selectedAppDetails} />
              </Stack>
            </GridItem>
            <NrqlQuery accountIds={[this.state.accountId]} query={topInteractionsQueryWithAppName} formatType={NrqlQuery.FORMAT_TYPE.RAW} >
              {({ loading, data }) => {
                //console.log(loading + ' : ' + JSON.stringify(data));
                if (loading) {
                  return <Spinner inline />
                }
                this.asyncCount = this.asyncCount - 1;
                //console.log(this.asyncCount + ' : ' + JSON.stringify(data.facets));
                if (!loading && data && this.asyncCount == 0) {
                  //console.log("FetchBrowserApplications.render - data >> " + JSON.stringify(data));
                  //let browserInteractions = [];
                  let browserInteractions = data.facets.map((facetInfo, indx) => {

                    let browserInteractionDetail = {};
                    browserInteractionDetail.id = 'A'+indx;
                    browserInteractionDetail.browserInteractionName = facetInfo.name[0];
                    browserInteractionDetail.urlDomain = facetInfo.name[1];
                    browserInteractionDetail.category = facetInfo.name[2];
                    browserInteractionDetail.trigger = facetInfo.name[3];
                    browserInteractionDetail.uniqueSessionCount = facetInfo.results[0].uniqueCount;
                    browserInteractionDetail.avgDuration = facetInfo.results[1].average;

                    browserInteractionDetail.applicationDetails = this.state.selectedApp;
                    browserInteractionDetail.timeRangeClause = timeRangeClause;

                    //console.log("src : " + JSON.stringify(browserInteractionDetail));
                    return browserInteractionDetail;
                  });
                  this.shouldRender = 1;

                  //console.log("Number of initial page loads >> " + browserInteractions.length);
                  //console.log(browserInteractions);

                  const journeyGridItemCSSStyle = {
                      outlineWidth: 'thin',
                      borderRadius: '25px',
                      margin: '10px',
                      padding: '10px',
                  };

                  if (browserInteractions.length == 0) {
                      return (
                        <GridItem columnSpan={12}>
                            <BlockText type={BlockText.TYPE.PARAGRAPH} tagType={BlockText.TYPE.DIV} spacingType={[BlockText.SPACING_TYPE.LARGE]} >
                              There are no user journeys to display
                            </BlockText>
                        </GridItem>
                      );
                  } else {
                      return (
                        <React.Fragment>
                          {browserInteractions.map(browserInteraction => (
                              <GridItem columnSpan={12} style={journeyGridItemCSSStyle}>
                                <FetchBrowserInteractionAsFlowAnalysisGraph {...browserInteraction} />
                              </GridItem>
                            ))
                          }
                        </React.Fragment>
                      );
                  }

                } else {
                  return <span></span>
                }
              }}
            </NrqlQuery>
          </Grid>
        );
    } else {
        return (
          <Grid style={mainGridCSSStyle} gapType={Grid.GAP_TYPE.MEDIUM} spacingType={[Grid.SPACING_TYPE.SMALL]} fullWidth fullHeight>
            <GridItem columnSpan={12}>
              <Stack gapType={Stack.GAP_TYPE.EXTRA_LARGE} horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY} fullWidth fullHeight >
                <StackItem fullWidth fullHeight >
                  <Tile type={Tile.TYPE.SOLID} >
                    <HeadingText>
                      Select a browser application
                    </HeadingText>
                    <BlockText type={BlockText.TYPE.PARAGRAPH} tagType={BlockText.TYPE.DIV} spacingType={[BlockText.SPACING_TYPE.LARGE]} >
                      <Dropdown
                        title={this.state.selectedAppName}
                        ariaLabel="Select a browser application"
                        iconType={Dropdown.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER}
                        items={apps} search={search}
                        onSearch={(searchStr) => this.setState({ search: searchStr.target.value })} >
                          { ({ item }) => <DropdownItem onClick={(evt) => this.manageSelectedBrowserApplication(item, evt)} key={item.guid}>{item.name}</DropdownItem> }
                      </Dropdown>
                    </BlockText>
                  </Tile>
                </StackItem>
              </Stack>
            </GridItem>
          </Grid>
        );
    }

  }
}
