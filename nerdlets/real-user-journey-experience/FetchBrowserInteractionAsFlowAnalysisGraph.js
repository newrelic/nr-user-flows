import React from 'react';
import { NrqlQuery, Spinner, Link, navigation } from 'nr1';

import { FlowAnalysisGraph } from '@ant-design/graphs';
import FetchBrowserInteractionFlowDetails from './FetchBrowserInteractionFlowDetails'
// https://charts.ant.design/en/examples/relation-graph/flow-analysis-graph/#type
// https://charts.ant.design/en/manual/getting-started




export default class FetchBrowserInteractionAsFlowAnalysisGraph extends React.Component {

  constructor(browserInteraction) {
    super(...arguments);

    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.constructor >> " + JSON.stringify(browserInteraction));

    //this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session) FACET browserInteractionName, domain, category, trigger, actionText where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";
    //this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' SINCE 1 week ago";
    this.INTERACTIONS_QUERY = "FROM BrowserInteraction SELECT uniqueCount(session), average(duration) FACET browserInteractionName, domain where appName = '$BR_APP_NAME$' and category IN ('Initial page load','Route change') AND previousUrl != targetUrl AND previousGroupedUrl LIKE '$PREVIOUS_URL$' $TIME_RANGE$";

    this.initializeBrowserInteractionAppDetails(browserInteraction);

  }

  initializeBrowserInteractionAppDetails(browserInteraction) {

    const initPlotData = {
      nodes: [],
      edges: []
    }

    this.state = {
      plotData: initPlotData,
      render: false,
      entityGuid: browserInteraction.applicationDetails.guid,
      accountId: browserInteraction.applicationDetails.accountId,
      appName: browserInteraction.applicationDetails.name,
      browserInteraction: browserInteraction,
      displayE2EFlows: false,
      timeRangeClause: browserInteraction.timeRangeClause
    };

    this.queryCounter = 0;
    this.plotGraph = false;
    /** Number of pixels that separate nodes horizontally in the layout. */
    this.rankSepPixel = 25;
    this.plotHeight = 400;
    //this.nodeSize = null;

    this.landingInteractionName = browserInteraction.browserInteractionName;

    this.interactions = [
      {
        "source": browserInteraction.browserInteractionName,
        "srcInteractionName": browserInteraction.browserInteractionName,
        "target": browserInteraction.browserInteractionName,
        "targetInteractionName": browserInteraction.browserInteractionName,
        "value": browserInteraction.uniqueSessionCount,
        "avgDuration": browserInteraction.avgDuration,
      }
    ];
    this.allInteractionsPaths = [
      {
        "path": browserInteraction.browserInteractionName,
        "duration": browserInteraction.avgDuration
      }
    ];
    this.allPathsAvgDuration = browserInteraction.avgDuration;

    this.appendChildren(browserInteraction.browserInteractionName, browserInteraction.browserInteractionName).then(() => {
      this.afterAppendingChild();
    });

  }

  shouldComponentUpdate() {
    return this.state.render;
  }

  componentWillReceiveProps(newBrowserInteraction) {

    if ((this.state.accountId != null && this.state.accountId != newBrowserInteraction.applicationDetails.accountId)
        || (this.state.appName != null && this.state.appName != newBrowserInteraction.applicationDetails.name)
        || (this.state.timeRangeClause != null && this.state.timeRangeClause != newBrowserInteraction.timeRangeClause)) {

      //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.componentWillReceiveProps >> ");
      //console.log(newBrowserInteraction);

      //this.plotGraph = false;
      //this.setState({ render: true });

      this.initializeBrowserInteractionAppDetails(newBrowserInteraction);
    }

  }

  afterAppendingChild() {

    this.queryCounter = this.queryCounter - 1;
    //console.log("this.queryCounter >> " + this.queryCounter);
    if (this.queryCounter === 0) {

      //console.log("this.interactions >> ");
      //console.log(this.interactions);

      // remove any duplicate interactions and build nodeDetails.
      let uniqueNodes = [];

      // Add First source as Node.
      const srcInteraction = this.interactions[0];
      let nodeDetails = {};
      nodeDetails.value = {};
      nodeDetails.id = srcInteraction.source;
      nodeDetails.value.title = srcInteraction.source;
      nodeDetails.interactionName = srcInteraction.srcInteractionName;

      nodeDetails.value.items = [];
      let visitorCountItem = {};
      visitorCountItem.text = 'Visitors #';
      visitorCountItem.value = srcInteraction.value;
      nodeDetails.value.items.push(visitorCountItem);
      let avgDurationItem = {};
      avgDurationItem.text = 'page load time';
      avgDurationItem.value = srcInteraction.avgDuration.toFixed(3) + ' (s)';
      nodeDetails.value.items.push(avgDurationItem);

      uniqueNodes.push(nodeDetails);

      if (this.interactions.length > 1) {
        this.interactions = this.interactions.slice(1);

        //prepare Nodes
        this.interactions.forEach((thisInteraction) => {

          if (!uniqueNodes.find((node) => (node.id === thisInteraction.target))) {
            let nodeDetails = {};
            nodeDetails.value = {};
            nodeDetails.id = thisInteraction.target;
            nodeDetails.value.title = thisInteraction.target;
            nodeDetails.interactionName = thisInteraction.targetInteractionName;
            nodeDetails.value.items = [];

            let interactionsWithThisTarget = this.interactions.filter((interaction) => interaction.target === thisInteraction.target);
            //console.log("Interactions for " + thisInteraction.target + " : " + interactionsWithThisTarget.length);

            if (interactionsWithThisTarget.length == 1) {
              let avgDurationItem = {};
              avgDurationItem.text = 'page load time';
              avgDurationItem.value = thisInteraction.avgDuration.toFixed(3) + ' (s)';
              nodeDetails.value.items.push(avgDurationItem);
            } else {
              // Empty Label Item
              let avgDurationItem = {};
              avgDurationItem.text = 'page load time from';
              avgDurationItem.value = '';
              nodeDetails.value.items.push(avgDurationItem);

              interactionsWithThisTarget.forEach((interaction) => {
                let avgDurationItem = {};
                avgDurationItem.text = interaction.source;
                avgDurationItem.value = interaction.avgDuration.toFixed(3) + ' (s)';
                nodeDetails.value.items.push(avgDurationItem);
              });
            }

            uniqueNodes.push(nodeDetails);
          }
        });

        //console.log("Final this.interactions >> ");
        //console.log(this.interactions);
        //console.log("uniqueNodes >> ");
        //console.log(uniqueNodes);
        //prepare all paths and e2e durations
        this.allInteractionsPaths = this.allInteractionsPaths.slice(1);
        let facetWhereClauses = "WHERE previousGroupedUrl LIKE '" + srcInteraction.srcInteractionName + "' AND targetGroupedUrl = '" + srcInteraction.srcInteractionName + "' AS 'LandingPage: " + srcInteraction.srcInteractionName + "'";
        this.appendChildPath(srcInteraction.source, srcInteraction.source, '~'+srcInteraction.source+'~', srcInteraction.avgDuration, facetWhereClauses, 1);
        //console.log("All Paths >> ");
        //console.log(this.allInteractionsPaths);
        let allPathTotalDuration = 0;
        this.allInteractionsPaths.forEach((path) => {
          allPathTotalDuration = allPathTotalDuration + path.duration;
        });
        this.allPathsAvgDuration = allPathTotalDuration / this.allInteractionsPaths.length;

      }

      //Update rank sep pixels
      let nodeLen = uniqueNodes.length;
      if (nodeLen == 2) {
        this.rankSepPixel = 110;
      } else if (nodeLen == 3) {
        this.rankSepPixel = 90;
      } else if (nodeLen == 4) {
        this.rankSepPixel = 50;
      } else {
        this.rankSepPixel = 20;
      }

      if (nodeLen > 10) {
          this.plotHeight = this.plotHeight + ((nodeLen/10)*250);
          //console.log('plotHeight : ' + this.plotHeight);
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
      this.setState({ render: true });

      setTimeout(() => {
        this.setState({ render: false });
      }, 100);
    }
  }

  appendChildPath(srcPath, src, decoratedSrcPath, duration, facetWhereClauses, stepNumber) {
    let interactionsWithThisSource = this.interactions.filter((interaction) => interaction.source === src);
    //console.log("Interactions from " + src + " : " + interactionsWithThisSource.length);
    if (interactionsWithThisSource.length == 0) {
      this.addInteractionPath(srcPath, duration, facetWhereClauses);
    } else {

      const nxtStepNumber = stepNumber + 1;

      interactionsWithThisSource.forEach((interaction) => {
        // Avoid associative cyclomatic complexity
        // a -> b -> c -> d -> e -> c
        if (decoratedSrcPath.includes('~' + interaction.target + '~')) {
          //console.log(srcPath + ' includes ' + interaction.target);
          this.addInteractionPath(srcPath, duration, facetWhereClauses);
        } else {          
          let totalPath = srcPath + ' -> ' + interaction.target;
          let totalDecoratedPath = decoratedSrcPath + ' -> ~' + interaction.target+'~';
          let totalDuration = duration + interaction.avgDuration;
          let stepDisplay = "Step" + stepNumber + ": " + interaction.source + " -> " + interaction.target;
          //console.log("stepDisplay : " + stepDisplay);
          let updWhereClauses = facetWhereClauses + "," + "WHERE previousGroupedUrl LIKE '" + interaction.srcInteractionName + "' AND targetGroupedUrl = '" + interaction.targetInteractionName + "' AS '" + stepDisplay + "'";
          this.appendChildPath(totalPath, interaction.target, totalDecoratedPath, totalDuration, updWhereClauses, nxtStepNumber);
        }

      });

    }

  }

  addInteractionPath(srcPath, duration, facetWhereClauses) {
    let pathNode = {};
    pathNode.path = srcPath;
    pathNode.duration = duration;
    pathNode.nrql = "SELECT sum(stepDuration) FROM (FROM BrowserInteraction SELECT average(duration) AS stepDuration where appName = '" + this.state.appName + "' and category IN ('Initial page load','Route change') FACET CASES (" + facetWhereClauses + ")) " + this.state.timeRangeClause;
    //console.log(pathNode.nrql);
    this.allInteractionsPaths.push(pathNode);
  }

  /**
   * Validates an edge with already captured date to avoid duplicates, cycle dependencies.
   */
  isValidEdge(interactionsArr, thisSrcInteractionName, thisDestInteractionName) {
    //console.log("Input >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
    //Check if the edge is recursive
    if (thisSrcInteractionName === thisDestInteractionName) {
      //console.log("Is a recursive edge >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
      return false;
    }

    //Check if destination is back to original landing page. This will lead to startover / infinite loop and the rendering makes it infinite
    if (this.landingInteractionName === thisDestInteractionName) {
      //console.log(" Is edge pointing back to landingPage >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
      return false;
    }

    //Check if the edge is duplicate
    if (interactionsArr.find((edge) => (edge.srcInteractionName === thisSrcInteractionName && edge.targetInteractionName === thisDestInteractionName))) {
      //console.log("Is a duplicate edge >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
      return false;
    }

    //Check if an edge is cyclic. This will lead to infinite loop and the rendering makes it infinite
    //a -> b, b -> a
    if (interactionsArr.find((edge) => (edge.srcInteractionName === thisDestInteractionName && edge.targetInteractionName === thisSrcInteractionName))) {
      //console.log("Is a cyclic node >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
      return false;
    }

    //Check if an edge is cyclic. This will lead to infinite loop and the rendering makes it infinite
    //a -> b, b -> c, c -> d, d -> e -> c
    if (interactionsArr.find((edge) => (edge.srcInteractionName === thisDestInteractionName))) {
      //console.log("For " + this.landingInteractionName + " : Is an associative cyclic node >> " + thisSrcInteractionName +" //~// "+ thisDestInteractionName);
      return true;
    }

    return true;
  }

  async appendChildren(interactionName, srcDisplayName) {

    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.appendChildren >>>> " + interactionName);
    //let browserInteractionName = interactionName.replaceAll('*', '%');
    //console.log("browserInteractionName >>>> " + JSON.stringify(browserInteractionName));

    let interactionsQuery = this.INTERACTIONS_QUERY.replace('$BR_APP_NAME$', this.state.appName);
    interactionsQuery = interactionsQuery.replace('$TIME_RANGE$',this.state.timeRangeClause);
    interactionsQuery = interactionsQuery.replace('$PREVIOUS_URL$', interactionName);
    //console.log("appendChild Query >>>> " + interactionsQuery);

    this.queryCounter = this.queryCounter + 1;
    const response = await NrqlQuery.query({
      accountIds: [this.state.accountId],
      formatType: NrqlQuery.FORMAT_TYPE.RAW,
      query: interactionsQuery
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
          childDisplayName = childDisplayName.replaceAll(childUrlDomain, '');
          //strip off portNumber
          const indx = childDisplayName.indexOf('/');
          if (indx > 0) {
            childDisplayName = childDisplayName.substring(indx);
          }
        }

        let childBrowserInteractionDetail = {};
        childBrowserInteractionDetail.source = srcDisplayName;
        childBrowserInteractionDetail.srcInteractionName = interactionName;
        childBrowserInteractionDetail.target = childDisplayName;
        childBrowserInteractionDetail.targetInteractionName = facetInfo.name[0];
        childBrowserInteractionDetail.value = facetInfo.results[0].uniqueCount;
        childBrowserInteractionDetail.avgDuration = facetInfo.results[1].average;

        if (this.isValidEdge(this.interactions, interactionName, facetInfo.name[0])) {
          this.interactions.push(childBrowserInteractionDetail);
          this.appendChildren(facetInfo.name[0], childDisplayName).then(() => {
            //this.setState({ render:false });
            //this.queryCounter = this.queryCounter - 1;
            this.afterAppendingChild();

          });
        }

      });

    }

  }

  renderInteractionDetails(nodeBrowserInteractionDetail) {

    const nerdlet = {
      id: 'page-views.drilldown',
      urlState: {
        //"chartFilters": "",
        //"drilldownTab": "AJAX requests",
        "entityGuid": this.state.entityGuid,
        "groupBy": nodeBrowserInteractionDetail.browserInteractionName,
        "groupByAttribute": "browserInteractionName",
        //"searchAjax": "",
        "viewType": "SPA"
      }
    };

    navigation.openStackedNerdlet(nerdlet);

  }

  showAllPaths(clickEvt) {
    //console.log('FetchBrowserInteractionAsFlowAnalysisGraph.showAllPaths >> ');
    clickEvt.preventDefault();
    this.setState({ displayE2EFlows: true });
    this.setState({ render: true });

    setTimeout(() => {
      this.setState({ render: false });
      this.setState({ displayE2EFlows: false });

    }, 50);

  }

  render() {
    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.render >> " + this.state.render);
    //console.log("FetchBrowserInteractionAsFlowAnalysisGraph.render >> " + JSON.stringify(this.state.plotData));

    const config = {
      data: this.state.plotData,
      height: this.plotHeight,
      //width: 400,
      nodeCfg: {
        //size: [120, 40],
        autoWidth: true,
        title: {
          style: {
            fill: '#000',
          },
        },
        customContent: (item, group, cfg) => {
          const { startX, startY } = cfg;
          const { text, value } = item;
          let valueStart = 100;
          if (text.length > 15) {
            valueStart = 150;
          };
          text &&
            group?.addShape('text', {
              attrs: {
                textBaseline: 'top',
                x: startX,
                y: startY,
                text: text,
                fill: '#000',
                cursor: 'pointer'
              },
              name: `text-${Math.random()}`,
            });
          value &&
            group?.addShape('text', {
              attrs: {
                textBaseline: 'top',
                x: startX + valueStart,
                y: startY,
                text: value,
                fill: '#000',
                cursor: 'pointer'
              },
              name: `value-${Math.random()}`,
            });

            return 10;
        },
        nodeStateStyles: {
          hover: {
            lineWidth: 2,
            cursor: 'pointer'
          },
        },
      },
      edgeCfg: {
        endArrow: true,
        style: {
          stroke: '#c86bdd',
        },
      },
      layout: {
        //maxZoom: 1,
        preventOverlap: true,
        ranksepFunc: () => this.rankSepPixel,
        nodesepFunc: () => 25,
      },
      //behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      behaviors: ['drag-node'],
      //theme: 'dark',
      onReady: (graph) => {
        /*const zoomFactor = 0.25 * this.state.plotData.nodes.length;
        console.log("zoomFactor : " + zoomFactor);
        if (zoomFactor < 1) {
          graph.zoom(zoomFactor);
        }*/
        graph.on('node:click', (evt) => {
          const item = evt.item;

          //console.log(item);
          //console.log('Type of item : ' + item._cfg.type);
          //console.log(item._cfg.model.value.title + ' ~ ' + item._cfg.model.value.interactionName);
          //console.log(item._cfg.model.id + ' ~ ' + item._cfg.model.interactionName);
          //console.log(this.state.accountId + ' ~ ' + this.state.appName);

          let nodeBrowserInteractionDetail = {};
          nodeBrowserInteractionDetail.accountId = this.state.accountId;
          nodeBrowserInteractionDetail.appName = this.state.appName;
          nodeBrowserInteractionDetail.browserInteractionName = item._cfg.model.interactionName;

          this.renderInteractionDetails(nodeBrowserInteractionDetail);
        });
        graph.on('canvas:contextmenu', (evt) => {
          //console.log('canvas:contextmenu');
          evt.preventDefault();
        });
        graph.on('node:contextmenu', (evt) => {
          //console.log('node:contextmenu');
          evt.preventDefault();
          let elements = document.getElementsByClassName('g6-component-contextmenu');
          if (elements.length > 0) {
            for (let i=0; i < elements.length; i++) {
              elements[i].style.display = 'none';
            };
          }
        });
        graph.on('edge:contextmenu', (evt) => {
          //console.log('edge:contextmenu');
          evt.preventDefault();
        });
      },
    };

    if (this.plotGraph) {
      return (
        <React.Fragment>
          {this.renderInteractionPaths()}
          <FlowAnalysisGraph {...config} />
        </React.Fragment>
      );
    } else {
      return <Spinner type={Spinner.TYPE.DOT} spacingType={[Spinner.SPACING_TYPE.EXTRA_LARGE]} />
    }
  }

  renderInteractionPaths() {
    //console.log('FetchBrowserInteractionAsFlowAnalysisGraph.renderInteractionPaths >> ');

    if (this.state.plotData.nodes.length > 1) {
      const allPaths = {
        interactionPaths: this.allInteractionsPaths
      };

      const avgDurationStyle = {
        textAlign: 'right',
        marginRight: '75px',
        fontSize: '14px',
      }
      return (
        <React.Fragment>
          <div style={avgDurationStyle}>Average end to end duration is <b>{this.allPathsAvgDuration.toFixed(3) + ' (s)'}</b>.
          &nbsp;&nbsp;<Link onClick={(evt) => this.showAllPaths(evt)}>Click here</Link> for individual journey details.</div>
          {this.state.displayE2EFlows && <FetchBrowserInteractionFlowDetails {...allPaths} accountId={this.state.accountId} />}
        </React.Fragment>
      )
    } else {
      return ( <div></div> )
    }

  }

}
