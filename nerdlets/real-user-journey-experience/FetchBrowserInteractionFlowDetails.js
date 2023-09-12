import React from 'react';
import Modal from 'react-modal';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  NrqlQuery,
  Spinner, HeadingText, Button, Toast, navigation,
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
        width: '80%',
        top: '25%',
        left: '15%',
        right: 'auto',
        bottom: 'auto',
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

  displayToastMessage() {
    Toast.showToast({
      title: 'Query Copied Successful',
      type: Toast.TYPE.NORMAL,
    });
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

            <Table items={e2ePaths} style={this.tableCSSStyle} >
              <TableHeader style={this.tableHeaderCSSStyle}>
                <TableHeaderCell value={({ item }) => item.path} width="fit-content">Flow Path</TableHeaderCell>
                <TableHeaderCell alignmentType={TableHeaderCell.ALIGNMENT_TYPE.RIGHT} width="100px">Total duration</TableHeaderCell>
                <TableHeaderCell width="150px">NRQL</TableHeaderCell>
              </TableHeader>

              {({ item }) => (
                <TableRow>
                  <TableRowCell>{item.path}</TableRowCell>
                  <MetricTableRowCell type={MetricTableRowCell.TYPE.SECONDS} value={item.duration.toFixed(3)} />
                  <TableRowCell>
                    <Button type={Button.TYPE.PRIMARY} sizeType={Button.SIZE_TYPE.SMALL} onClick={() => openChartBuilder({ query: item.nrql, accountId: this.state.accountId })}> View in Chart Builder</Button>
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
