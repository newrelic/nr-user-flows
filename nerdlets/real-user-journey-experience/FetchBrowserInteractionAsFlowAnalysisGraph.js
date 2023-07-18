import React from 'react';
import { NrqlQuery } from 'nr1';

import { FlowAnalysisGraph } from '@ant-design/graphs';
import FetchBrowserInteractionDetails from './FetchBrowserInteractionDetails';

// https://charts.ant.design/en/examples/relation-graph/decomposition-tree-graph/#basic
// https://charts.ant.design/en/manual/getting-started
export default class FetchBrowserInteractionAsFlowAnalysisGraph extends React.Component {

  constructor(browserInteraction) {
    super(...arguments);

    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.constructor >> " + JSON.stringify(browserInteraction));

    //this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";
    this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";

    this.initializeBrowserInteractionAppDetails(browserInteraction);

  }

  initializeBrowserInteractionAppDetails(browserInteraction) {
    const initPlotData = {
      nodes: [
        {
          id: browserInteraction.browserInteractionName,
          value: { title: browserInteraction.browserInteractionName }
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
      appName: browserInteraction.applicationDetails.name,
      browserInteraction: browserInteraction,
      browserInteractionDetail: null,
      displayBrowserInteractionDetail: false,
    };

    this.appendChildren(browserInteraction.browserInteractionName, browserInteraction.browserInteractionName, true).then(() => {
        this.setState({ render:false });
    });

  }

  shouldComponentUpdate() {
    return this.state.render;
    //return false;
  }

  componentWillReceiveProps(newBrowserInteraction) {

    if ((this.state.accountId != null && this.state.accountId != newBrowserInteraction.applicationDetails.accountId)
        || (this.state.appName != null && this.state.appName != newBrowserInteraction.applicationDetails.name)) {
        this.setState({ render:true });

        //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.componentWillReceiveProps >> ");
        //console.log(newBrowserInteraction);

        const resetPlotData = {
          nodes: [],
          edges: []
        }
        this.setState({ plotData: resetPlotData });

        this.initializeBrowserInteractionAppDetails(newBrowserInteraction);

    }

  }

  /**
   * Check if an edge is cyclic
   * a -> b, b -> a
   * This will lead to infinite loop and the rendering makes it infinite
   */
  isNotACyclicEdge(src, dest) {
    //Check, if there is already an edge from dest to src
    if(this.state.plotData.edges.find((edge) => (edge.source === dest && edge.target === src))) {
      //console.log("Is a cyclic node >> ");
      return false;
    }
    return true;
  }


  async appendChildren(interactionName, srcDisplayName, isFirstExecution) {

      //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.appendChildren >>>> " + interactionName);
      //let browserInteractionName = interactionName.replaceAll('*', '%');
      //console.log("browserInteractionName >>>> " + JSON.stringify(browserInteractionName));

      let interactionsQuery = this.INTERACTIONS_QUERY.replace('$BR_APP_NAME$',this.state.appName);
      interactionsQuery = interactionsQuery.replace('$PREVIOUS_URL$',interactionName);
      //console.log("appendChild Query >>>> " + interactionsQuery);

      this.queryCount = this.queryCount + 1;
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
            childBrowserInteractionDetail.srcInteractionName = interactionName;
            childBrowserInteractionDetail.target = childDisplayName;
            childBrowserInteractionDetail.targetInteractionName = facetInfo.name[0];
            childBrowserInteractionDetail.value = facetInfo.results[0].uniqueCount;

           /* 
            * Check if an edge is cyclic (a -> b, b -> a). This will lead to infinite loop and the rendering makes it infinite.
            */
            if (this.isNotACyclicEdge(srcDisplayName, childDisplayName)) {
              childs.push(childBrowserInteractionDetail);
              this.appendChildren(facetInfo.name[0], childDisplayName, false).then(() => {
                  this.setState({ render:false });

              });

            }

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
                                      nodeDetails.value.title = thisInteraction.source;
                                      nodeDetails.interactionName = thisInteraction.srcInteractionName;
                                      uniqueNodes.push(nodeDetails);
                                    }
                                    if (!uniqueNodes.find((node) => (node.id === thisInteraction.target))) {
                                      var nodeDetails = {};
                                      nodeDetails.value = {};
                                      nodeDetails.id = thisInteraction.target;
                                      nodeDetails.value.title = thisInteraction.target;
                                      nodeDetails.interactionName = thisInteraction.targetInteractionName;
                                      uniqueNodes.push(nodeDetails);
                                    }
                                    return uniques;
                              }, []);

        
        const updatedPlotData = {
          nodes: uniqueNodes,
          edges: uniqueInteractions
        }


        //Update plotting data
        this.setState({ plotData: updatedPlotData });
        this.setState({ render:true });

      }


  }

  renderInteractionDetails(browserInteractionDetail) {
      //console.log('renderInteractionDetails >>');
      this.setState({ browserInteractionDetail:browserInteractionDetail });
      this.setState({ displayBrowserInteractionDetail:true });
      this.setState({ render:true });

      setTimeout(() => {
        this.setState({ render:false });
        this.setState({ displayBrowserInteractionDetail:false });

      },500);
      
  }

  render() {
    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.render >> " + this.state.render);
    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.render >> " + JSON.stringify(this.state.plotData));

    const config = {
        data: this.state.plotData,    
        height: 400,
        //width: 1200,
        nodeCfg: {
          autoWidth: true,
          badge: {
          },
          title: {
            containerStyle: {
              fill: 'transparent',
            },
            style: {
              fill: '#000',
            },
          },
        },
        edgeCfg: {
          endArrow: true,
          /*label: {
            style: {
              fill: '#5ae859',
            },
          },*/
          style: {
            stroke:'#c86bdd',
          },
        },
        /*markerCfg: {
        },*/
        miniMapCfg: {
          //show: true,
          type: 'delegate',
          refresh: true,
        },
        layout: {
          //type: 'comboForce',
          maxZoom: 1,
          preventOverlap: true,
          ranksepFunc: () => 30,
          nodesepFunc: () => 30,
        },
        //behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
        //theme: 'dark',
        onReady: (graph) => {
          //graph.zoom(1);
          //graph.fitView(10);
          //graph.fitCenter();
          graph.on('node:click', (evt) => {
            const item = evt.item;
            //console.log(item);
            //console.log('Type of item : ' + item._cfg.type);
            //console.log(item._cfg.model.value.title + ' ~ ' + item._cfg.model.value.interactionName);
            //console.log(item._cfg.model.id + ' ~ ' + item._cfg.model.interactionName);
            //console.log(this.state.accountId + ' ~ ' + this.state.appName);

            var browserInteractionDetail = {};
            browserInteractionDetail.accountId = this.state.accountId;
            browserInteractionDetail.appName = this.state.appName;
            browserInteractionDetail.browserInteractionName = item._cfg.model.interactionName;
            
            this.renderInteractionDetails(browserInteractionDetail);
          });
          graph.off('canvas:contextmenu', (evt) => {
            evt.preventDefault();
          });
        },
      };

    const browserInteractionDetail = this.state.browserInteractionDetail;

    if (this.state.displayBrowserInteractionDetail) {
        return (
            <React.Fragment>
              <FlowAnalysisGraph {...config} />
              <FetchBrowserInteractionDetails {...browserInteractionDetail} />
            </React.Fragment>
        );

    } else {
        return <FlowAnalysisGraph {...config} />
    }

  }

}
