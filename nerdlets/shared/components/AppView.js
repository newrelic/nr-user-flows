import React from 'react';
import { BlockText, GridItem, Stack } from 'nr1';
import FetchBrowserApplicationDetails from '../../nr-user-flows/FetchBrowserApplicationDetails';
import FetchBrowserInteractionAsFlowAnalysisGraph from '../../nr-user-flows/FetchBrowserInteractionAsFlowAnalysisGraph';

const AppView = ({ entity }) => {
  const { topQuery } = entity;

  const browserInteractions = (topQuery?.rawResponse?.facets || []).map(
    (facetInfo, indx) => ({
      id: `A${indx}`,
      browserInteractionName: facetInfo.name[0],
      urlDomain: facetInfo.name[1],
      category: facetInfo.name[2],
      trigger: facetInfo.name[3],
      uniqueSessionCount: facetInfo.results[0].uniqueCount,
      avgDuration: facetInfo.results[1].average,
      applicationDetails: entity,
      timeRangeClause: entity?.timeRangeClause
    })
  );

  const journeyGridItemCSSStyle = {
    outlineWidth: 'thin',
    borderRadius: '25px',
    margin: '10px',
    padding: '10px'
  };

  return (
    <div>
      <GridItem columnSpan={12}>
        <Stack
          gapType={Stack.GAP_TYPE.LARGE}
          horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
          fullWidth
          fullHeight
        >
          <FetchBrowserApplicationDetails {...entity} />
        </Stack>
      </GridItem>

      {browserInteractions.length === 0 ? (
        <GridItem columnSpan={12}>
          <BlockText
            type={BlockText.TYPE.PARAGRAPH}
            tagType={BlockText.TYPE.DIV}
            spacingType={[BlockText.SPACING_TYPE.LARGE]}
          >
            There are no user journeys to display
          </BlockText>
        </GridItem>
      ) : (
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
      )}
    </div>
  );
};

export default AppView;
