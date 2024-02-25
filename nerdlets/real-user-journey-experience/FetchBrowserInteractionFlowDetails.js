import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {
  HeadingText,
  Button,
  navigation,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  MetricTableRowCell
} from 'nr1';

const openChartBuilder = ({ query, accountId }) => {
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
};

const FetchBrowserInteractionFlowDetails = ({
  interactionPaths,
  accountId
}) => {
  const [allInteractionsPaths, setAllInteractionsPaths] = useState(
    interactionPaths
  );
  // const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setAllInteractionsPaths(interactionPaths);
  }, [interactionPaths]);

  const onClose = () => {
    // setHidden(true);
    setOpen(false);
  };

  const onHideEnd = () => {
    setMounted(false);
  };

  const modalCSSStyle = {
    content: {
      width: '90%',
      top: '03%',
      left: '02%',
      right: 'auto',
      bottom: '03%',
      padding: '0px',
      border: '1px solid #000'
    }
  };

  const modalHeaderCSSStyle = {
    backgroundColor: '#000',
    color: '#fff',
    margin: '0px',
    padding: '10px'
  };

  const tableCSSStyle = {
    // Additional styling if needed
  };

  const tableHeaderCSSStyle = {
    color: '#000'
  };

  return (
    <>
      {mounted && (
        <Modal
          isOpen={open}
          onRequestClose={onClose}
          onAfterClose={onHideEnd}
          style={modalCSSStyle}
          ariaHideApp={false}
        >
          <HeadingText
            type={HeadingText.TYPE.HEADING_3}
            style={modalHeaderCSSStyle}
          >
            End to end Journey flows
          </HeadingText>
          <Table items={allInteractionsPaths} style={tableCSSStyle}>
            <TableHeader style={tableHeaderCSSStyle}>
              <TableHeaderCell
                value={({ item }) => item.path}
                width="fit-content"
              >
                Flow Path
              </TableHeaderCell>
              <TableHeaderCell
                alignmentType={TableHeaderCell.ALIGNMENT_TYPE.RIGHT}
                width="100px"
              >
                Total duration
              </TableHeaderCell>
              <TableHeaderCell width="150px">NRQL</TableHeaderCell>
            </TableHeader>
            {({ item }) => (
              <TableRow>
                <TableRowCell>{item.path}</TableRowCell>
                <MetricTableRowCell
                  type={MetricTableRowCell.TYPE.SECONDS}
                  value={item.duration.toFixed(3)}
                />
                <TableRowCell>
                  <Button
                    type={Button.TYPE.PRIMARY}
                    sizeType={Button.SIZE_TYPE.SMALL}
                    onClick={() =>
                      openChartBuilder({ query: item.nrql, accountId })
                    }
                  >
                    Open Query Builder
                  </Button>
                </TableRowCell>
              </TableRow>
            )}
          </Table>
        </Modal>
      )}
    </>
  );
};

export default FetchBrowserInteractionFlowDetails;
