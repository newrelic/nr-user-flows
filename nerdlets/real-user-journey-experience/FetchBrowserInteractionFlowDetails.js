import React from 'react';
import Modal from 'react-modal';
import {
  HeadingText, Button, navigation,
  Table, TableHeader, TableHeaderCell, TableRow, TableRowCell, MetricTableRowCell
} from 'nr1';

function openChartBuilder({ query, accountId }) {
  const nerdlet = {
    id: 'data-exploration.query-builder',
    urlState: {
      initialActiveInterface: 'nrqlEditor',
      initialAccountId: accountId,
      initialNrqlValue: query,
      isViewingQuery: true
    }
  };
  navigation.openStackedNerdlet(nerdlet);
}

export default class FetchBrowserInteractionFlowDetails extends React.Component {

  constructor(allInteractionsPaths) {
    super(...arguments);

    //console.log("FetchBrowserInteractionE2EFlowDetails.constructor >> " + JSON.stringify(allInteractionsPaths));

    this.initializeData(allInteractionsPaths);

    this._onClose = this._onClose.bind(this);
    this._onHideEnd = this._onHideEnd.bind(this);

    this.modalCSSStyle = {
      content: {
        width: '90%',
        top: '03%',
        left: '02%',
        right: 'auto',
        bottom: '03%',
        padding: '0px',
        border: '1px solid #000',
        //marginRight: '-50%',
        //transform: 'translate(-50%, -50%)',
      }
    };

    this.modalHeaderCSSStyle = {
      backgroundColor: '#000',
      color: '#fff',
      margin: '0px',
      padding: '10px',
    };

    this.modalCloseCSSStyle = {
      color: 'indianred',
      float: 'right',
      position: 'relative',
      top: '-41px',
      right: '10px',
      fontSize: 'xx-large',
      cursor: 'pointer',
    };

    this.tableCSSStyle = {
      //padding: '20px',
    };

    this.tableHeaderCSSStyle = {
      color: '#000',
    };

  }

  initializeData(allPaths) {
    this.state = {
      allInteractionsPaths: allPaths.interactionPaths,
      hidden: false,
      mounted: true,
      open: true,
      accountId: allPaths.accountId
    };

  }

  componentWillReceiveProps(allInteractionsPaths) {
    this.initializeData(allInteractionsPaths);
  }

  shouldComponentUpdate() {
    return true;
  }

  _onClose() {
    this.setState({ hidden: true });
    this.setState({ open: false });
  }

  _onHideEnd() {
    this.setState({ mounted: false });
  }

  render() {
    //console.log(this.state.allInteractionsPaths);
    let e2ePaths = this.state.allInteractionsPaths;
    //console.log(e2ePaths.length);

    return (
      <>
        {this.state.mounted && (
          <Modal isOpen={this.state.open} onRequestClose={this._onClose} onAfterClose={this._onHideEnd} style={this.modalCSSStyle} ariaHideApp={false} >
            <HeadingText type={HeadingText.TYPE.HEADING_3} style={this.modalHeaderCSSStyle}>End to end Journey flows</HeadingText>
              <span onClick={this._onClose} class="wnd-Button-icon ic-Icon" style={this.modalCloseCSSStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false">
                  <path fill-rule="evenodd" d="M15 1.95L14.05 1 8 7.17 1.95 1 1 1.95 7.17 8 1 14.05l.95.95L8 8.83 14.05 15l.95-.95L8.83 8 15 1.95z" clip-rule="evenodd"></path>
                </svg>
              </span>

            <Table items={e2ePaths} style={this.tableCSSStyle} >
              <TableHeader style={this.tableHeaderCSSStyle}>
                <TableHeaderCell value={({ item }) => item.path} width="fit-content">Flow Path</TableHeaderCell>
                <TableHeaderCell alignmentType={TableHeaderCell.ALIGNMENT_TYPE.RIGHT} width="100px">Total duration</TableHeaderCell>
                <TableHeaderCell width="150px">E2E duration Query</TableHeaderCell>
                <TableHeaderCell width="150px">Stepwise Query</TableHeaderCell>
                <TableHeaderCell width="150px">Funnel Query</TableHeaderCell>
              </TableHeader>

              {({ item }) => (
                <TableRow>
                  <TableRowCell>{item.path}</TableRowCell>
                  <MetricTableRowCell type={MetricTableRowCell.TYPE.SECONDS} value={item.duration.toFixed(3)} />
                  <TableRowCell>
                    <Button type={Button.TYPE.PRIMARY} sizeType={Button.SIZE_TYPE.SMALL} onClick={() => openChartBuilder({ query: item.e2eDurationNRQL, accountId: this.state.accountId })}>Open Query Builder</Button>
                  </TableRowCell>
                  <TableRowCell>
                    <Button type={Button.TYPE.PRIMARY} sizeType={Button.SIZE_TYPE.SMALL} onClick={() => openChartBuilder({ query: item.stepWiseNRQL, accountId: this.state.accountId })}>Open Query Builder</Button>
                  </TableRowCell>
                  <TableRowCell>
                    <Button type={Button.TYPE.PRIMARY} sizeType={Button.SIZE_TYPE.SMALL} onClick={() => openChartBuilder({ query: item.funnelNRQL, accountId: this.state.accountId })}>Open Query Builder</Button>
                  </TableRowCell>
                </TableRow>
              )}
            </Table>
          </Modal>
        )}
      </>
    );


  }
}
