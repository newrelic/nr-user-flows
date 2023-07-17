import React from 'react';
import { NrqlQuery } from 'nr1';

import { Sankey } from '@ant-design/plots';

// https://charts.ant.design/en/examples/relation-graph/decomposition-tree-graph/#basic
// https://charts.ant.design/en/manual/getting-started
export default class FetchBrowserInteractionAsSankeyPlot extends React.Component {

  constructor(browserInteraction) {
    super(...arguments);

    //console.log("FetchBrowserInteractionAsSankeyPlot.constructor >> " + JSON.stringify(browserInteraction));

    const initPlotData = [
        {
          source: browserInteraction.browserInteractionName,
          value: browserInteraction.uniqueSessionCount
        }];


    this.state = {
      plotData: initPlotData,
      render:false,
      accountId: browserInteraction.applicationDetails.accountId,
      appName: browserInteraction.applicationDetails.name
    };

    //this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";
    this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";

    this.appendChildren(browserInteraction.browserInteractionName, browserInteraction.browserInteractionName, true).then(() => {
        this.setState({ render:false });

    });
  }

  shouldComponentUpdate() {
    return this.state.render;
  }

  async appendChildren(interactionName, srcDisplayName, isFirstExecution) {

      //console.log("FetchBrowserInteractionAsSankeyPlot.appendChildren >>>> " + interactionName);
      let browserInteractionName = interactionName.replaceAll('*', '%');
      //console.log("browserInteractionName >>>> " + JSON.stringify(browserInteractionName));

      let interactionsQuery = this.INTERACTIONS_QUERY.replace('$BR_APP_NAME$',this.state.appName);
      interactionsQuery = interactionsQuery.replace('$PREVIOUS_URL$',browserInteractionName);
      //console.log("appendChild Query >>>> " + interactionsQuery);

      const response = await NrqlQuery.query({
        accountIds:[this.state.accountId],
        formatType: NrqlQuery.FORMAT_TYPE.RAW,
        query:interactionsQuery
      });
      //console.log("query data >>>> " + response + " ~ " + JSON.stringify(response.data.facets));

      if (response && response.data && response.data.facets.length > 0) {
        //add children details
        //console.log("Num Of Children > " + response.data.facets.length);
        let childs = [];
        response.data.facets.forEach((facetInfo) => {
            //define child Display Name
            let childDisplayName = facetInfo.name[0];
            const childUrlDomain = facetInfo.name[1];
            if (interactionName.startsWith(childUrlDomain)) {
              childDisplayName = childDisplayName.replaceAll(childUrlDomain,'');
              //strip off portNumber
              const indx = childDisplayName.indexOf('/');
              if (indx > 0) {
                childDisplayName = childDisplayName.substring(indx);
              }
            }

            var childBrowserInteractionDetail = {};
            childBrowserInteractionDetail.source = srcDisplayName;
            childBrowserInteractionDetail.target = childDisplayName;
            childBrowserInteractionDetail.value = facetInfo.results[0].uniqueCount;

            this.appendChildren(facetInfo.name[0], childDisplayName, false).then(() => {
                this.setState({ render:false });

            });

            childs.push(childBrowserInteractionDetail);

        });

        //Remove top node, which does not have a target
        if (isFirstExecution) {
          this.setState({ plotData: [ ...this.state.plotData.slice(1) ] });
        }

        //While using interactionId, session flow is not maintained, hence there is a possibility of duplicate flows.
        // Remove duplicates from plotData
        let allInteractions = [ ...this.state.plotData, ...childs ];
        let uniqueInteractions = allInteractions.reduce((uniques, thisInteraction) => {
                                  if (!uniques.find((interaction) => (interaction.source === thisInteraction.source && interaction.target === thisInteraction.target))) {
                                      uniques.push(thisInteraction);
                                  }
                                  return uniques;
                              }, []);


        //Update plotting data
        //this.setState({ plotData: [ ...this.state.plotData, ...childs ] });
        this.setState({ plotData: [ ...uniqueInteractions ] });
        this.setState({ render:true });

      }


  }

  render() {
    //console.log("FetchBrowserInteractionAsSankeyPlot.render >> " + this.state.render);
    //console.log("FetchBrowserInteractionAsSankeyPlot.render >> " + JSON.stringify(this.state.plotData));

    const config = {
        data: this.state.plotData,
        sourceField: 'source',
        targetField: 'target',
        weightField: 'value',
        nodeWidthRatio: 0.008,
        nodePaddingRatio: 0.03,
        //theme: 'dark',
      };

    /*return (
      <div style="height:200px">
        <Sankey {...config} />
      </div>
      );*/
    return <Sankey {...config} />
  }
}
