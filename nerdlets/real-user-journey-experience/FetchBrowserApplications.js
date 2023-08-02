import React from 'react';
import { 
  nerdlet,
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
      this.setState({ accountId: platformState.accountId});
    });

    this.state = {
      search: '',
      apps: [],
      selectedAppName: 'Search an entity',
      selectedApp:null,
    };

    this.TOP_INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category = 'Initial page load' AND previousUrl = targetUrl SINCE 1 week ago LIMIT 5";

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
    this.setState({ selectedAppName: clickEvt.target.textContent });
    this.setState({ selectedApp: clickedItem });
    this.setState({ accountId: clickedItem.accountId });
  }

  render() {
    const { search, apps } = this.state;
    this.getEntitiesByName(search);

    var selectedAppDetails = this.state.selectedApp;
    //console.log(selectedAppDetails);

    if (selectedAppDetails) {
        const topInteractionsQueryWithAppName = this.TOP_INTERACTIONS_QUERY.replace('$BR_APP_NAME$',selectedAppDetails.name);
        return (
          <Grid gapType={Grid.GAP_TYPE.MEDIUM} spacingType={[Grid.SPACING_TYPE.MEDIUM]} fullWidth fullHeight>
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
              <Stack gapType={Stack.GAP_TYPE.EXTRA_LARGE} horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY} fullWidth fullHeight >
                <FetchBrowserApplicationDetails {...selectedAppDetails} />
              </Stack>
            </GridItem>
            <NrqlQuery accountIds={[this.state.accountId]} query={topInteractionsQueryWithAppName} formatType={NrqlQuery.FORMAT_TYPE.RAW} >
              {({ loading, data }) => {
                if (loading) {
                  return <Spinner inline />
                }
                if (!loading && data) {

                  //console.log("FetchBrowserApplications.render - data >> " + JSON.stringify(data));
                  const browserInteractions = [];
                  data.facets.forEach((facetInfo, indx) => {

                    var browserInteractionDetail = {};
                    browserInteractionDetail.id = 'A'+indx;
                    browserInteractionDetail.browserInteractionName = facetInfo.name[0];
                    browserInteractionDetail.urlDomain = facetInfo.name[1];
                    browserInteractionDetail.category = facetInfo.name[2];
                    browserInteractionDetail.trigger = facetInfo.name[3];
                    browserInteractionDetail.uniqueSessionCount = facetInfo.results[0].uniqueCount;

                    browserInteractionDetail.applicationDetails = this.state.selectedApp;

                    browserInteractions.push(browserInteractionDetail);
                  });

                  //console.log("Number of initial page loads >> " + browserInteractions.length);

                  return (
                    <React.Fragment>
                      {browserInteractions.map(browserInteraction => (
                          <GridItem columnSpan={12}>
                            <FetchBrowserInteractionAsFlowAnalysisGraph {...browserInteraction} />
                          </GridItem>
                        ))
                      }
                    </React.Fragment>
                  )

                } else {
                  return ''
                }
              }}
            </NrqlQuery>
          </Grid>
        );
    } else {
        return (
          <Grid gapType={Grid.GAP_TYPE.MEDIUM} spacingType={[Grid.SPACING_TYPE.MEDIUM]} fullWidth fullHeight>
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
