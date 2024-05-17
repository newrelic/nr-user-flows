import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  PlatformStateContext,
  EntitiesByNameQuery,
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
import { generateEntityData } from '../shared/utils';
import AppView from '../shared/components/AppView';

const FetchBrowserApplications = () => {
  const { timeRange, accountId } = useContext(PlatformStateContext);
  const [fetchingEntities, setFetchingEntities] = useState(true);
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState([]);
  const [selectedAppName, setSelectedAppName] = useState('Search an entity');
  const [selectedApp, setSelectedApp] = useState(null);
  const [entity, setEntity] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(accountId);

  useEffect(() => {
    getEntitiesByName(accountId);
  }, [accountId, timeRange]);

  useEffect(() => {
    if (currentAccountId !== accountId) {
      setEntity(null);
      setSelectedApp(null);
      setSelectedAppName(null);
      setCurrentAccountId(accountId);
    }
  }, [accountId]);

  useEffect(() => {
    if (entity?.guid) {
      manageSelectedBrowserApplication(entity);
    } else {
      setEntity(null);
    }

    // if (currentAccountId !== accountId) {
    //   setEntity(null);
    //   setSelectedApp(null);
    //   setSelectedAppName(null);
    //   setSearch('');
    //   setCurrentAccountId(accountId);
    // }
  }, [timeRange, entity?.guid]);

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
  const manageSelectedBrowserApplication = async (clickedItem, _clickEvt) => {
    const timeRangeClause = `SINCE ${timeRange?.duration / 60000} minutes ago`;
    const entityData = await generateEntityData(
      clickedItem?.guid,
      timeRangeClause
    );

    setSelectedAppName(clickedItem.name);
    setSelectedApp(clickedItem);
    setEntity(entityData);
  };

  const mainGridCSSStyle = {
    marginLeft: '0px'
  };

  const filteredApps = apps.filter(({ name }) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return useMemo(() => {
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
                          onClick={evt => {
                            setEntity(null);
                            setSelectedApp(null);
                            setSelectedAppName(null);
                            setTimeout(() => {
                              manageSelectedBrowserApplication(item, evt);
                            }, 50);
                          }}
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
          <GridItem columnSpan={12}>
            {!entity ? <Spinner /> : <AppView entity={entity} />}
          </GridItem>
        )}
      </Grid>
    );
  }, [
    selectedApp,
    selectedAppName,
    fetchingEntities,
    filteredApps,
    search,
    entity?.guid,
    accountId
  ]);
};

export default FetchBrowserApplications;
