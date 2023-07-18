import React from 'react';
import { NrqlQuery, 
        Spinner,
        Modal, HeadingText,
        Table, TableHeader, TableHeaderCell, TableRow, TableRowCell } from 'nr1';

export default class FetchBrowserInteractionDetails extends React.Component {

  constructor(browserInteractionDetails) {
    super(...arguments);

    //console.log("FetchBrowserInteractionDetails.constructor >> " + JSON.stringify(browserInteractionDetails));

    this.initializeData(browserInteractionDetails);

    this._onClose = this._onClose.bind(this);
    this._onHideEnd = this._onHideEnd.bind(this);

    this.AJAX_DETAILS_QUERY = "SELECT count(*) AS totalNumberOfCalls, rate(count(*), 1 minute) AS avgNumberOfCallsPerMin, average(jsDuration) AS avgJsDuration, average(timeToLoadEventStart) AS avgWaitTime, sum(jsDuration + timeToLoadEventStart) AS mostTimeConsuming FROM AjaxRequest WHERE appName = '$BR_APP_NAME$' AND browserInteractionName = '$INTERACTION_NAME$' FACET httpMethod, requestUrl, groupedRequestUrl LIMIT MAX SINCE 1 week ago";

  }

  initializeData(browserInteractionDetails) {
    this.state = {
      accountId: browserInteractionDetails.accountId,
      appName: browserInteractionDetails.appName,
      interactionName: browserInteractionDetails.browserInteractionName,
      hidden: false,
      mounted: true,
      column: 0,
      sortingType: TableHeaderCell.SORTING_TYPE.NONE,
    };

  }

  componentWillReceiveProps(newBrowserInteractionDetails) {

    if ((this.state.accountId != null && this.state.accountId != newBrowserInteractionDetails.accountId)
      || (this.state.appName != null && this.state.appName != newBrowserInteractionDetails.appName)
      || (this.state.interactionName != null && this.state.interactionName != newBrowserInteractionDetails.browserInteractionName) ) {

        console.log("FetchBrowserInteractionDetails.componentWillReceiveProps >> ");
        console.log(newBrowserInteractionDetails);

        this.initializeData(newBrowserInteractionDetails);
        
    }

  }

  shouldComponentUpdate() {
    return true;
  }

  _onClose() {
    this.setState({ hidden: true });
  }

  _onHideEnd() {
    this.setState({ mounted: false });
  }

  _onClickTableHeaderCell(column, evt, { nextSortingType }) {
    if (column === this.state.column) {
      this.setState({ sortingType: nextSortingType });
    } else {
      this.setState({ column: column, sortingType: nextSortingType });
    }
  }

  render() {
    const thisInteractionName = this.state.interactionName;
    //console.log("FetchBrowserInteractionDetails.render >> " + this.state.render + thisInteractionName);
    let ajaxDetailsQueryUpdated = this.AJAX_DETAILS_QUERY.replace('$BR_APP_NAME$', this.state.appName);
    ajaxDetailsQueryUpdated = ajaxDetailsQueryUpdated.replace('$INTERACTION_NAME$', thisInteractionName);

    const sortingType0 = this.state.column === 0 ? this.state.sortingType : TableHeaderCell.SORTING_TYPE.NONE;
    //const sortingType1 = this.state.column === 1 ? this.state.sortingType : TableHeaderCell.SORTING_TYPE.NONE;
    const sortingType2 = this.state.column === 2 ? this.state.sortingType : TableHeaderCell.SORTING_TYPE.NONE;
    const sortingType3 = this.state.column === 3 ? this.state.sortingType : TableHeaderCell.SORTING_TYPE.NONE;
    const sortingType4 = this.state.column === 4 ? this.state.sortingType : TableHeaderCell.SORTING_TYPE.NONE;
    //const sortingType5 = this.state.column === 5 ? this.state.sortingType : TableHeaderCell.SORTING_TYPE.NONE;

    /*****
     * Additional Columns, temporarily removing to accommodate Modal pop up
                                  <TableHeaderCell sortable sortingType={sortingType1}
                                    onClick={this._onClickTableHeaderCell.bind(this, 1)}
                                    value={({ item }) => item.results[0].count} >
                                        Total # of calls
                                  </TableHeaderCell>

                                  <TableHeaderCell sortable sortingType={sortingType4}
                                    onClick={this._onClickTableHeaderCell.bind(this, 4)}
                                    value={({ item }) => item.results[3].average} >
                                        Avg Wait Time
                                  </TableHeaderCell>
                                  <TableHeaderCell sortable sortingType={sortingType5}
                                    onClick={this._onClickTableHeaderCell.bind(this, 5)}
                                    value={({ item }) => item.results[4].sum} >
                                        Most Time Consuming
                                  </TableHeaderCell>


                                    <TableRowCell>{item.results[0].count}</TableRowCell> ==> 2nd column / indx 1
                                    <TableRowCell>{item.results[3].average}</TableRowCell> ==> 5th column / index 4
                                    <TableRowCell>{item.results[4].sum}</TableRowCell> ==> 6th column / indx 5
     *****/

    return (
      <>
        {this.state.mounted && (
            <NrqlQuery accountIds={[this.state.accountId]} query={ajaxDetailsQueryUpdated} formatType={NrqlQuery.FORMAT_TYPE.RAW} >
              {({ loading, data }) => {
                  if (loading) {
                    return <Spinner inline />
                  }
                  if (!loading && data) {
                    //console.log(data);
                    return (
                      <Modal hidden={this.state.hidden} onClose={this._onClose} onHideEnd={this._onHideEnd}>
                        <HeadingText type={HeadingText.TYPE.HEADING_3}>Ajax Details for the page <br/> {thisInteractionName} </HeadingText>

                          <Table items={data.facets} multivalue>
                              <TableHeader>
                                  <TableHeaderCell sortable sortingType={sortingType0}
                                    onClick={this._onClickTableHeaderCell.bind(this, 0)}
                                    value={({ item }) => item.name[0]} >
                                        Ajax Request
                                  </TableHeaderCell>
                                  <TableHeaderCell sortable sortingType={sortingType2}
                                    onClick={this._onClickTableHeaderCell.bind(this, 2)}
                                    value={({ item }) => item.results[1].result} >
                                        Avg # of calls (per min)
                                  </TableHeaderCell>
                                  <TableHeaderCell sortable sortingType={sortingType3}
                                    onClick={this._onClickTableHeaderCell.bind(this, 3)}
                                    value={({ item }) => item.results[2].average} >
                                        Avg JS duration (seconds)
                                  </TableHeaderCell>

                              </TableHeader>

                              {({ item }) => (
                                  <TableRow>
                                    <TableRowCell additionalValue={`Http Method : ${item.name[0]}`}> {item.name[1]} </TableRowCell>
                                    <TableRowCell>{item.results[1].result}</TableRowCell>
                                    <TableRowCell>{item.results[2].average}</TableRowCell>
                                  </TableRow>
                              )}
                          </Table>
                      </Modal>
                   );
                  } else {
                    return <span></span>
                  }
                }
              }
            </NrqlQuery>
        )}
      </>
    );


  }
}
