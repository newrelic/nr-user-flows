import React from 'react';
import { NrqlQuery, Spinner } from 'nr1';

import { FlowAnalysisGraph } from '@ant-design/graphs';
import FetchBrowserInteractionDetails from './FetchBrowserInteractionDetails';

// https://charts.ant.design/en/examples/relation-graph/flow-analysis-graph/#type
// https://charts.ant.design/en/manual/getting-started
export default class FetchBrowserInteractionAsFlowAnalysisGraph extends React.Component {

  constructor(browserInteraction) {
    super(...arguments);

    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.constructor >> " + JSON.stringify(browserInteraction));

    //this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";
    this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";

    this.initializeBrowserInteractionAppDetails(browserInteraction);

  }

  initializeBrowserInteractionAppDetails(browserInteraction) {

    const initPlotData = {
      nodes: [],
      edges: []
    }


    this.state = {
      plotData: initPlotData,
      render:false,
      accountId: browserInteraction.applicationDetails.accountId,
      appName: browserInteraction.applicationDetails.name,
      browserInteraction: browserInteraction,
      browserInteractionDetail: null,
      displayBrowserInteractionDetail: false,
    };

    this.queryCounter = 0;
    this.plotGraph = false;
    this.interactions = [
        {"source":browserInteraction.browserInteractionName,
        "srcInteractionName":browserInteraction.browserInteractionName,
        "target":browserInteraction.browserInteractionName,
        "targetInteractionName":browserInteraction.browserInteractionName,
        "value":browserInteraction.uniqueSessionCount,
        "avgDuration":browserInteraction.avgDuration
        }
      ];

    this.appendChildren(browserInteraction.browserInteractionName, browserInteraction.browserInteractionName, true).then(() => {
        this.afterAppendingChild();
    });

  }

  shouldComponentUpdate() {
    return this.state.render;
  }

  componentWillReceiveProps(newBrowserInteraction) {

    if ((this.state.accountId != null && this.state.accountId != newBrowserInteraction.applicationDetails.accountId)
        || (this.state.appName != null && this.state.appName != newBrowserInteraction.applicationDetails.name)) {

        //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.componentWillReceiveProps >> ");
        //console.log(newBrowserInteraction);

        this.plotGraph = false;
        this.setState({ render:true });

        this.initializeBrowserInteractionAppDetails(newBrowserInteraction);

    }

  }

  afterAppendingChild() {

      this.queryCounter = this.queryCounter - 1;
      //console.log("this.queryCounter >> " + this.queryCounter);
      //console.log("this.interactions >> ");
      //console.log(this.interactions);
      if (this.queryCounter === 0) {

            // remove any duplicate interactions and build nodeDetails.
            let uniqueNodes = [];

            // Add First source as Node.
            const thisInteraction = this.interactions[0];
            var nodeDetails = {};
            nodeDetails.value = {};
            nodeDetails.id = thisInteraction.source;
            nodeDetails.value.title = thisInteraction.source;
            nodeDetails.interactionName = thisInteraction.srcInteractionName;
            nodeDetails.value.items = [];
            var avgDurationItem = {};
            avgDurationItem.text = 'Duration';
            avgDurationItem.value = thisInteraction.avgDuration.toFixed(3) + ' (s)';
            nodeDetails.value.items.push(avgDurationItem);

            uniqueNodes.push(nodeDetails);

            if (this.interactions.length > 1) {
              this.interactions = this.interactions.slice(1);
              this.interactions.forEach((thisInteraction) => {

                  if (!uniqueNodes.find((node) => (node.id === thisInteraction.target))) {
                    var nodeDetails = {};
                    nodeDetails.value = {};
                    nodeDetails.id = thisInteraction.target;
                    nodeDetails.value.title = thisInteraction.target;
                    nodeDetails.interactionName = thisInteraction.targetInteractionName;
                    nodeDetails.value.items = [];
                    var avgDurationItem = {};
                    avgDurationItem.text = 'Duration';
                    avgDurationItem.value = thisInteraction.avgDuration.toFixed(3) + ' (s)';
                    nodeDetails.value.items.push(avgDurationItem);
                    
                    uniqueNodes.push(nodeDetails);
                  }
              });
            }
            
            const updatedPlotData = {
              nodes: uniqueNodes,
              edges: this.interactions
            }

            //console.log("updatedPlotData >> ");
            //console.log(updatedPlotData);

            //Update plotting data
            this.setState({ plotData: updatedPlotData });
            this.plotGraph = true;
            this.setState({ render:true });

            setTimeout(() => {
              this.setState({ render:false });
            },300);
      }
  }

  /**
   * Validates an edge with already captured date to avoid duplicates, cycle dependencies.
   */
  isValidEdge(interactionsArr, thisSrcInteractionName, thisDestInteractionName) {

    //Check if the edge is duplicate
    if(interactionsArr.find((edge) => (edge.srcInteractionName === thisSrcInteractionName && edge.targetInteractionName === thisDestInteractionName))) {
      //console.log("Is a duplicate edge >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
      return false;
    }

    //Check if an edge is cyclic. This will lead to infinite loop and the rendering makes it infinite
    //a -> b, b -> a
    if(interactionsArr.find((edge) => (edge.srcInteractionName === thisDestInteractionName && edge.targetInteractionName === thisSrcInteractionName))) {
      //console.log("Is a cyclic node >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
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

      this.queryCounter = this.queryCounter + 1;
      const response = await NrqlQuery.query({
        accountIds:[this.state.accountId],
        formatType: NrqlQuery.FORMAT_TYPE.RAW,
        query:interactionsQuery
      });
      //console.log("query data >>>> " + response + " ~ " + JSON.stringify(response.data.facets));

      if (response && response.data && response.data.facets.length > 0) {
        //add children details
        //console.log("Num Of Children > " + response.data.facets.length);
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
            childBrowserInteractionDetail.avgDuration = facetInfo.results[1].average;

            if (this.isValidEdge(this.interactions, interactionName, facetInfo.name[0])) {
              this.interactions.push(childBrowserInteractionDetail);
              this.appendChildren(facetInfo.name[0], childDisplayName, false).then(() => {
                  //this.setState({ render:false });
                  //this.queryCounter = this.queryCounter - 1;
                  this.afterAppendingChild();

              });
            }
            
        });

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
        //height: 400,
        //width: 1200,
        nodeCfg: {
          size: [150, 25],
          autoWidth: true,
          title: {
            style: {
              fill: '#000',
            },
          },
        },
        edgeCfg: {
          endArrow: true,
          style: {
            stroke:'#c86bdd',
          },
        },
        layout: {
          //maxZoom: 1,
          preventOverlap: true,
          ranksepFunc: () => 20,
          nodesepFunc: () => 20,
        },
        //behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
        behaviors: ['drag-node'],
        //theme: 'dark',
        onReady: (graph) => {
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

    if (this.plotGraph && this.state.displayBrowserInteractionDetail) {
        return (
            <React.Fragment>
              <FlowAnalysisGraph {...config} />
              <FetchBrowserInteractionDetails {...browserInteractionDetail} />
            </React.Fragment>
        );

    } else if (this.plotGraph ) {
        return <FlowAnalysisGraph {...config} />
    } else {
        return <Spinner type={Spinner.TYPE.DOT} spacingType={[Spinner.SPACING_TYPE.EXTRA_LARGE]} />
    }

  }

}
