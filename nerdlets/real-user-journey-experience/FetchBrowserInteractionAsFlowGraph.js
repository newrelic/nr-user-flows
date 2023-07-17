import React from 'react';
import { NrqlQuery } from 'nr1';

import { FundFlowGraph } from '@ant-design/graphs';

// https://charts.ant.design/en/examples/relation-graph/decomposition-tree-graph/#basic
// https://charts.ant.design/en/manual/getting-started
export default class FetchBrowserInteractionAsFlowGraph extends React.Component {

  constructor(browserInteraction) {
    super(...arguments);

    //console.log("FetchBrowserInteractionAsFlowGraph.constructor >> " + JSON.stringify(browserInteraction));

    const initPlotData = {
      nodes: [
        {
          id: browserInteraction.browserInteractionName,
          value: { text: browserInteraction.browserInteractionName }
        }
      ],
      edges: [
        {"source":browserInteraction.browserInteractionName,"target":browserInteraction.browserInteractionName,"value":browserInteraction.uniqueSessionCount}
      ]
    };

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

      //console.log("FetchBrowserInteractionAsFlowGraph.appendChildren >>>> " + interactionName);
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

        //While using interactionId, session flow is not maintained, hence there is a possibility of duplicate flows.
        // Remove duplicates from plotData
        let allInteractions = [ ...this.state.plotData.edges, ...childs ];
        //Remove top node, which does not have a target
        if (isFirstExecution) {
          allInteractions = allInteractions.slice(1);
        }

        let uniqueNodes = [];
        let uniqueInteractions = allInteractions.reduce((uniques, thisInteraction) => {
                                    if (!uniques.find((interaction) => (interaction.source === thisInteraction.source && interaction.target === thisInteraction.target))) {
                                        uniques.push(thisInteraction);
                                    }
                                    if (!uniqueNodes.find((node) => (node.id === thisInteraction.source))) {
                                      var nodeDetails = {};
                                      nodeDetails.value = {};
                                      nodeDetails.id = thisInteraction.source;
                                      nodeDetails.value.text = thisInteraction.source;
                                      uniqueNodes.push(nodeDetails);
                                    }
                                    if (!uniqueNodes.find((node) => (node.id === thisInteraction.target))) {
                                      var nodeDetails = {};
                                      nodeDetails.value = {};
                                      nodeDetails.id = thisInteraction.target;
                                      nodeDetails.value.text = thisInteraction.target;
                                      uniqueNodes.push(nodeDetails);
                                    }
                                    return uniques;
                              }, []);

        
        const updatePlotData = {
          nodes: uniqueNodes,
          edges: uniqueInteractions
        }


        //Update plotting data
        this.setState({ plotData: updatePlotData });
        this.setState({ render:true });

      }


  }

  render() {
    //console.log("FetchBrowserInteractionAsFlowGraph.render >> " + this.state.render);
    //console.log("FetchBrowserInteractionAsFlowGraph.render >> " + JSON.stringify(this.state.plotData));

    const config = {
        data: this.state.plotData,
        //theme: 'dark',
      };

    return <FundFlowGraph {...config} />
  }
}
